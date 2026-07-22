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
  const { firstName, lastName, dob, relationship } = await req.json();

  if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
    return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
  }

  const dobVal = dob ? new Date(dob) : null;

  try {
    const member = await prisma.familyMember.create({
      data: {
        patientId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dobVal,
        relationship: relationship?.trim() || null,
      },
    });
    return NextResponse.json({ member });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add family member" }, { status: 500 });
  }
}
