"use server";

import { Department, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { mapDbConnectionError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

export type StaffRegisterState = { error?: string };

const allowedRoles: Role[] = ["FRONT_DESK", "SUPERVISOR", "DOCTOR"];
const allowedDepartments: Department[] = [
  "GENERAL_DENTISTRY",
  "ORTHODONTICS",
  "PEDIATRICS",
  "ORAL_SURGERY",
  "ENDODONTICS",
];

export async function registerStaff(
  _prev: StaffRegisterState | undefined,
  formData: FormData,
): Promise<StaffRegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? "").trim() as Role;
  const departmentRaw = String(formData.get("department") ?? "").trim() as Department;
  const code = String(formData.get("registrationCode") ?? "").trim();

  if (!name || !email || !password || !roleRaw || !departmentRaw || !code) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!allowedRoles.includes(roleRaw)) {
    return { error: "Invalid staff role." };
  }
  if (!allowedDepartments.includes(departmentRaw)) {
    return { error: "Invalid department." };
  }

  const expectedCode = process.env.STAFF_REGISTRATION_CODE?.trim();
  if (!expectedCode) {
    return { error: "Staff registration is not configured. Set STAFF_REGISTRATION_CODE." };
  }
  if (code !== expectedCode) {
    return { error: "Invalid registration code." };
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
        role: roleRaw,
        department: departmentRaw,
      },
    });
  } catch (e) {
    const msg = mapDbConnectionError(e);
    if (msg) return { error: msg };
    throw e;
  }

  redirect("/staff/login?registered=1");
}
