import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id || !staffRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = params.id;

  const notes = await prisma.clinicalNote.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id || !staffRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = params.id;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const note = await prisma.clinicalNote.create({
    data: {
      patientId,
      authorId: session.user.id,
      content: content.trim(),
    },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ note });
}
