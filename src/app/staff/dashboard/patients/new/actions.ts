"use server";

import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export type NewPatientState = { error?: string };

export async function createPatientAction(
  _prev: NewPatientState | undefined,
  formData: FormData,
): Promise<NewPatientState> {
  await requireStaff();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !email || !password) {
    return { error: "Name, email, and temporary password are required." };
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Generate unique chart number
  let chartNumber = "";
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    const rand = Math.floor(1000 + Math.random() * 9000);
    chartNumber = `CN-${rand}`;
    const exists = await prisma.user.findUnique({
      where: { chartNumber },
    });
    if (!exists) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    return { error: "Failed to generate a unique chart number. Please try again." };
  }

  const passwordHash = await hash(password, 12);
  let patientId = "";

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        chartNumber,
        passwordHash,
        role: Role.PATIENT,
      },
    });
    patientId = user.id;
  } catch (err) {
    console.error(err);
    return { error: "Database error. Failed to create patient account." };
  }

  redirect(`/staff/dashboard/patients/${patientId}`);
}
