"use server";

import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { mapDbConnectionError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

export type RegisterState = { error?: string };

export async function registerPatient(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw.length > 0 ? phoneRaw : null;

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: Role.PATIENT,
      },
    });
  } catch (e) {
    const msg = mapDbConnectionError(e);
    if (msg) return { error: msg };
    throw e;
  }

  redirect("/login?registered=1");
}
