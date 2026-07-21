import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !staffRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.toLowerCase().trim() ?? "";
  if (!email) {
    return NextResponse.json({ members: [] });
  }

  const patient = await prisma.user.findFirst({
    where: { email, role: Role.PATIENT },
  });
  if (!patient) {
    return NextResponse.json({ members: [] });
  }

  const members = await prisma.familyMember.findMany({
    where: { patientId: patient.id },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  return NextResponse.json({ members });
}
