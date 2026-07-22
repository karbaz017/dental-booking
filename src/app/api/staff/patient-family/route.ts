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
  const search = url.searchParams.get("search")?.trim() ?? "";
  const patientId = url.searchParams.get("patientId")?.trim() ?? "";

  // If patientId is provided, load family members for that patient
  if (patientId) {
    try {
      const members = await prisma.familyMember.findMany({
        where: { patientId },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      });
      return NextResponse.json({ members });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to fetch family members" }, { status: 500 });
    }
  }

  // If search is provided, load matching patients
  if (!search || search.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  try {
    // Fetch all patients and filter in-memory for SQLite case-insensitivity
    const allPatients = await prisma.user.findMany({
      where: { role: Role.PATIENT },
      select: {
        id: true,
        name: true,
        chartNumber: true,
        email: true,
        phone: true,
      },
    });

    const matchingPatients = allPatients.filter((p) => {
      const s = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(s) ||
        p.chartNumber?.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s)
      );
    });

    return NextResponse.json({ patients: matchingPatients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to query patients" }, { status: 500 });
  }
}
