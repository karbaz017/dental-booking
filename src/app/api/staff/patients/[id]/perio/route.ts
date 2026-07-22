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

  const chart = await prisma.perioChart.findFirst({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ chart });
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id || !staffRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = params.id;
  const { data } = await req.json();

  if (!data) {
    return NextResponse.json({ error: "Data is required" }, { status: 400 });
  }

  const chart = await prisma.perioChart.create({
    data: {
      patientId,
      authorId: session.user.id,
      data: typeof data === "string" ? data : JSON.stringify(data),
    },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ chart });
}
