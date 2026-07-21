"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";

export type FamilyActionState = { error?: string };

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function assertOwnsFamily(patientId: string, memberId: string) {
  const row = await prisma.familyMember.findFirst({
    where: { id: memberId, patientId },
  });
  return row;
}

export async function createFamilyMember(
  _prev: FamilyActionState | undefined,
  formData: FormData,
): Promise<FamilyActionState> {
  const { userId } = await requirePatient();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim() || null;
  const dob = parseOptionalDate(formData.get("dob"));

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  await prisma.familyMember.create({
    data: {
      patientId: userId,
      firstName,
      lastName,
      relationship,
      dob,
    },
  });

  revalidatePath("/dashboard/family");
  redirect("/dashboard/family");
}

export async function updateFamilyMember(
  _prev: FamilyActionState | undefined,
  formData: FormData,
): Promise<FamilyActionState> {
  const { userId } = await requirePatient();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing record." };

  const existing = await assertOwnsFamily(userId, id);
  if (!existing) return { error: "Not found." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim() || null;
  const dob = parseOptionalDate(formData.get("dob"));

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  await prisma.familyMember.update({
    where: { id },
    data: { firstName, lastName, relationship, dob },
  });

  revalidatePath("/dashboard/family");
  redirect("/dashboard/family");
}

export async function deleteFamilyMember(formData: FormData) {
  const { userId } = await requirePatient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await assertOwnsFamily(userId, id);
  if (!existing) return;

  await prisma.familyMember.delete({ where: { id } });
  revalidatePath("/dashboard/family");
}
