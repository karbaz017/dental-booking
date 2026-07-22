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
  const body = await req.json();

  const {
    carrierName,
    planName,
    memberId,
    groupNumber,
    subscriberName,
    effectiveDate,
    notes,
  } = body;

  if (!carrierName || !carrierName.trim()) {
    return NextResponse.json({ error: "Carrier name is required" }, { status: 400 });
  }
  if (!memberId || !memberId.trim()) {
    return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
  }

  const dateVal = effectiveDate ? new Date(effectiveDate) : null;

  try {
    const existing = await prisma.insurance.findFirst({
      where: { patientId },
    });

    if (existing) {
      const updated = await prisma.insurance.update({
        where: { id: existing.id },
        data: {
          carrierName: carrierName.trim(),
          planName: planName?.trim() || null,
          memberId: memberId.trim(),
          groupNumber: groupNumber?.trim() || null,
          subscriberName: subscriberName?.trim() || null,
          effectiveDate: dateVal,
          notes: notes?.trim() || null,
        },
      });
      return NextResponse.json({ insurance: updated });
    } else {
      const created = await prisma.insurance.create({
        data: {
          patientId,
          carrierName: carrierName.trim(),
          planName: planName?.trim() || null,
          memberId: memberId.trim(),
          groupNumber: groupNumber?.trim() || null,
          subscriberName: subscriberName?.trim() || null,
          effectiveDate: dateVal,
          notes: notes?.trim() || null,
        },
      });
      return NextResponse.json({ insurance: created });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save insurance" }, { status: 500 });
  }
}
