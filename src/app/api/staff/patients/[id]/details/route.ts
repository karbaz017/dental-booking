import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id || !staffRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = params.id;
  const { name, phone, chartNumber } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: patientId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        chartNumber: chartNumber?.trim() || null,
      },
    });
    return NextResponse.json({ patient: updated });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Chart number must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
