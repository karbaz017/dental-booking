import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/chat-access";
import { prisma } from "@/lib/prisma";

const staffSet = new Set<Role>([
  Role.FRONT_DESK,
  Role.SUPERVISOR,
  Role.DOCTOR,
]);

type Peer = { id: string; name: string | null; email: string; role: Role; department: string | null };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let staffPeers: Peer[] = [];
  let patients: Peer[] = [];

  if (me.role === Role.PATIENT) {
    // Front-desk is the only staff role patients can message; include rows even if
    // department is unset (some orgs may not have filled it yet).
    staffPeers = await prisma.user.findMany({
      where: {
        role: Role.FRONT_DESK,
        id: { not: me.id },
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, role: true, department: true },
    });
    return NextResponse.json({ staffPeers, patients: [] as Peer[] });
  }

  if (!isStaffRole(me.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (me.role === Role.FRONT_DESK) {
    [staffPeers, patients] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: [...staffSet] }, id: { not: me.id }, department: { not: null } },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: { id: true, name: true, email: true, role: true, department: true },
      }),
      prisma.user.findMany({
        where: { role: Role.PATIENT },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        take: 500,
        select: { id: true, name: true, email: true, role: true, department: true },
      }),
    ]);
  } else {
    staffPeers = await prisma.user.findMany({
      where: { role: { in: [...staffSet] }, id: { not: me.id }, department: { not: null } },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, role: true, department: true },
    });
  }

  return NextResponse.json({ staffPeers, patients });
}
