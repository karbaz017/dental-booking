import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_BODY = 8_000;
const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" } as const;

type RouteParams = { params: Promise<{ threadId: string }> };

export async function GET(_req: Request, ctx: RouteParams) {
  const { threadId } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  const isMember = await prisma.chatParticipant.findUnique({
    where: {
      threadId_userId: { threadId, userId: session.user.id },
    },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  }

  const items = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { sender: { select: { id: true, name: true, email: true, role: true } } },
  });
  const messages = items.reverse().map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    sender: {
      id: m.sender.id,
      name: m.sender.name,
      email: m.sender.email,
      role: m.sender.role,
    },
  }));

  return NextResponse.json({ messages }, { headers: noStore });
}

export async function POST(req: Request, ctx: RouteParams) {
  const { threadId } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  const isMember = await prisma.chatParticipant.findUnique({
    where: { threadId_userId: { threadId, userId: session.user.id } },
  });
  if (!isMember) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  }

  let text: string;
  try {
    const q = (await req.json()) as { body?: unknown };
    text = typeof q.body === "string" ? q.body.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }
  if (text.length > MAX_BODY) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const now = new Date();
  const msg = await prisma.$transaction(async (tx) => {
    const m = await tx.chatMessage.create({
      data: { threadId, senderId: session.user.id, body: text },
      include: { sender: { select: { id: true, name: true, email: true, role: true } } },
    });
    await tx.chatThread.update({ where: { id: threadId }, data: { updatedAt: now } });
    return m;
  });

  return NextResponse.json(
    {
      message: {
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt.toISOString(),
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          role: msg.sender.role,
        },
      },
    },
    { headers: noStore },
  );
}
