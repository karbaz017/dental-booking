import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canOpenChat, makePairKey } from "@/lib/chat-access";
import { prisma } from "@/lib/prisma";

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" } as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  let threadsPayload;
  try {
    const members = await prisma.chatParticipant.findMany({
      where: { userId: me.id },
      orderBy: { thread: { updatedAt: "desc" } },
      include: {
        thread: {
          include: {
            messages: { take: 1, orderBy: { createdAt: "desc" } },
            participants: {
              include: { user: { select: { id: true, name: true, email: true, role: true } } } },
          },
        },
      },
    });

    const threads = members
      .map((row) => {
        const t = row.thread;
        const other = t.participants
          .map((p) => p.user)
          .find((u) => u.id !== me.id);
        if (!other) {
          return null;
        }
        const last = t.messages[0];
        const myRead = row.lastReadAt;
        const hasUnread = last
          ? !myRead || last.createdAt.getTime() > myRead.getTime()
          : false;
        return {
          id: t.id,
          other: {
            id: other.id,
            name: other.name,
            email: other.email,
            role: other.role,
          },
          lastMessage: last
            ? { body: last.body, createdAt: last.createdAt.toISOString(), senderId: last.senderId }
            : null,
          hasUnread,
          updatedAt: t.updatedAt.toISOString(),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);
    threadsPayload = threads;
  } catch (e) {
    console.error("chat.threads list", e);
    return NextResponse.json(
      { error: "Could not load conversations" },
      { status: 500, headers: noStore },
    );
  }

  return NextResponse.json({ threads: threadsPayload }, { headers: noStore });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let peerUserId: string;
  try {
    const q = (await req.json()) as { peerUserId?: unknown };
    if (typeof q.peerUserId !== "string" || !q.peerUserId.trim()) {
      return NextResponse.json({ error: "peerUserId required" }, { status: 400 });
    }
    peerUserId = q.peerUserId.trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (peerUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid peer" }, { status: 400 });
  }

  const [me, peer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, department: true },
    }),
    prisma.user.findUnique({
      where: { id: peerUserId },
      select: { id: true, role: true, department: true },
    }),
  ]);

  if (!me || !peer) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!me.department && me.role !== "PATIENT") {
    return NextResponse.json({ error: "Account not allowed in chat" }, { status: 403 });
  }
  // Any front-desk user is a valid DM target; other staff need a department on file.
  if (peer.role !== "PATIENT" && peer.role !== "FRONT_DESK" && !peer.department) {
    return NextResponse.json({ error: "Peer is not in chat" }, { status: 400 });
  }

  if (!canOpenChat({ role: me.role }, { role: peer.role })) {
    return NextResponse.json({ error: "Chat is not allowed with this person" }, { status: 403 });
  }

  const pairKey = makePairKey(me.id, peer.id);
  const existing = await prisma.chatThread.findUnique({
    where: { pairKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ thread: { id: existing.id } });
  }

  const created = await prisma.$transaction(async (tx) => {
    const th = await tx.chatThread.create({
      data: { pairKey },
    });
    await tx.chatParticipant.createMany({
      data: [{ threadId: th.id, userId: me.id }, { threadId: th.id, userId: peer.id }],
    });
    return th;
  });

  return NextResponse.json({ thread: { id: created.id } });
}
