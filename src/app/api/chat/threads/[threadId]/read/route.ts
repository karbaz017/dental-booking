import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ threadId: string }> };

export async function POST(_req: Request, ctx: RouteParams) {
  const { threadId } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r = await prisma.chatParticipant.updateMany({
    where: { threadId, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });
  if (r.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
