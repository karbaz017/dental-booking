"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";

export type InsuranceActionState = { error?: string };

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function assertOwnsInsurance(patientId: string, insuranceId: string) {
  return prisma.insurance.findFirst({
    where: { id: insuranceId, patientId },
  });
}

export async function createInsurance(
  _prev: InsuranceActionState | undefined,
  formData: FormData,
): Promise<InsuranceActionState> {
  const { userId } = await requirePatient();

  const carrierName = String(formData.get("carrierName") ?? "").trim();
  const planName = String(formData.get("planName") ?? "").trim() || null;
  const memberId = String(formData.get("memberId") ?? "").trim();
  const groupNumber = String(formData.get("groupNumber") ?? "").trim() || null;
  const subscriberName = String(formData.get("subscriberName") ?? "").trim() || null;
  const effectiveDate = parseOptionalDate(formData.get("effectiveDate"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!carrierName || !memberId) {
    return { error: "Carrier and member ID are required." };
  }

  await prisma.insurance.create({
    data: {
      patientId: userId,
      carrierName,
      planName,
      memberId,
      groupNumber,
      subscriberName,
      effectiveDate,
      notes,
    },
  });

  revalidatePath("/dashboard/insurance");
  redirect("/dashboard/insurance");
}

export async function updateInsurance(
  _prev: InsuranceActionState | undefined,
  formData: FormData,
): Promise<InsuranceActionState> {
  const { userId } = await requirePatient();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing record." };

  const existing = await assertOwnsInsurance(userId, id);
  if (!existing) return { error: "Not found." };

  const carrierName = String(formData.get("carrierName") ?? "").trim();
  const planName = String(formData.get("planName") ?? "").trim() || null;
  const memberId = String(formData.get("memberId") ?? "").trim();
  const groupNumber = String(formData.get("groupNumber") ?? "").trim() || null;
  const subscriberName = String(formData.get("subscriberName") ?? "").trim() || null;
  const effectiveDate = parseOptionalDate(formData.get("effectiveDate"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!carrierName || !memberId) {
    return { error: "Carrier and member ID are required." };
  }

  await prisma.insurance.update({
    where: { id },
    data: {
      carrierName,
      planName,
      memberId,
      groupNumber,
      subscriberName,
      effectiveDate,
      notes,
    },
  });

  revalidatePath("/dashboard/insurance");
  redirect("/dashboard/insurance");
}

export async function deleteInsurance(formData: FormData) {
  const { userId } = await requirePatient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await assertOwnsInsurance(userId, id);
  if (!existing) return;

  await prisma.insurance.delete({ where: { id } });
  revalidatePath("/dashboard/insurance");
}
