"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppointmentStatus, Role } from "@prisma/client";
import { endAtFromStart } from "@/lib/appointment-scheduling";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { syncAppointmentReminders } from "@/lib/sync-appointment-reminders";

export type StaffApptState = { error?: string };

export async function createStaffAppointment(
  _prev: StaffApptState | undefined,
  formData: FormData,
): Promise<StaffApptState> {
  const { userId: staffId, department } = await requireStaff();

  const patientSearch = String(formData.get("patientSearch") ?? "").trim();
  const dentistId = String(formData.get("dentistId") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const familyMemberIdRaw = String(formData.get("familyMemberId") ?? "").trim();
  const familyMemberId = familyMemberIdRaw.length > 0 ? familyMemberIdRaw : null;
  const isEmergency = formData.get("isEmergency") === "on";
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!patientSearch || !dentistId || !startRaw) {
    return { error: "Patient name or chart number, dentist, and date/time are required." };
  }

  let patient = await prisma.user.findFirst({
    where: {
      role: Role.PATIENT,
      OR: [
        { chartNumber: patientSearch },
        { email: patientSearch.toLowerCase() },
        { name: patientSearch },
      ],
    },
  });

  if (!patient) {
    const patients = await prisma.user.findMany({
      where: { role: Role.PATIENT },
    });
    const matches = patients.filter(
      (p) =>
        p.name?.toLowerCase() === patientSearch.toLowerCase() ||
        p.name?.toLowerCase().includes(patientSearch.toLowerCase())
    );
    if (matches.length === 1) {
      patient = matches[0];
    } else if (matches.length > 1) {
      return { error: `Multiple patients found matching "${patientSearch}". Please use their unique chart number.` };
    }
  }

  if (!patient) {
    return { error: "No patient account found for that name or chart number." };
  }

  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, role: Role.DOCTOR, department },
  });
  if (!dentist) {
    return { error: "Selected dentist is not available." };
  }

  if (familyMemberId) {
    const member = await prisma.familyMember.findFirst({
      where: { id: familyMemberId, patientId: patient.id },
    });
    if (!member) {
      return { error: "That family member is not on the patient's account." };
    }
  }

  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { error: "Invalid date or time." };
  }

  const endAt = endAtFromStart(startAt);

  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        patientId: patient.id,
        familyMemberId,
        dentistId,
        createdByStaffId: staffId,
        startAt,
        endAt,
        isEmergency,
        reason,
        notes,
        status: "SCHEDULED",
      },
    });
    await syncAppointmentReminders(tx, appt.id, startAt);
  });

  revalidatePath("/staff/dashboard");
  redirect("/staff/dashboard");
}

export async function updateStaffAppointment(
  _prev: StaffApptState | undefined,
  formData: FormData,
): Promise<StaffApptState> {
  const { userId: staffId, department } = await requireStaff();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing appointment." };

  const patientSearch = String(formData.get("patientSearch") ?? "").trim();
  const dentistId = String(formData.get("dentistId") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const familyMemberIdRaw = String(formData.get("familyMemberId") ?? "").trim();
  const familyMemberId = familyMemberIdRaw.length > 0 ? familyMemberIdRaw : null;
  const status = String(formData.get("status") ?? "SCHEDULED").trim();
  const isEmergency = formData.get("isEmergency") === "on";
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!patientSearch || !dentistId || !startRaw) {
    return { error: "Patient name or chart number, dentist, and date/time are required." };
  }

  let patient = await prisma.user.findFirst({
    where: {
      role: Role.PATIENT,
      OR: [
        { chartNumber: patientSearch },
        { email: patientSearch.toLowerCase() },
        { name: patientSearch },
      ],
    },
  });

  if (!patient) {
    const patients = await prisma.user.findMany({
      where: { role: Role.PATIENT },
    });
    const matches = patients.filter(
      (p) =>
        p.name?.toLowerCase() === patientSearch.toLowerCase() ||
        p.name?.toLowerCase().includes(patientSearch.toLowerCase())
    );
    if (matches.length === 1) {
      patient = matches[0];
    } else if (matches.length > 1) {
      return { error: `Multiple patients found matching "${patientSearch}". Please use their unique chart number.` };
    }
  }

  if (!patient) {
    return { error: "No patient account found for that name or chart number." };
  }

  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, role: Role.DOCTOR, department },
  });
  if (!dentist) {
    return { error: "Selected dentist is not available." };
  }

  if (familyMemberId) {
    const member = await prisma.familyMember.findFirst({
      where: { id: familyMemberId, patientId: patient.id },
    });
    if (!member) {
      return { error: "That family member is not on the patient's account." };
    }
  }

  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { error: "Invalid date or time." };
  }

  const allowed = new Set([
    "SCHEDULED",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ]);
  if (!allowed.has(status)) {
    return { error: "Invalid status." };
  }

  const existing = await prisma.appointment.findFirst({
    where: { id, dentist: { department } },
  });
  if (!existing) return { error: "Appointment not found." };

  const endAt = endAtFromStart(startAt);

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: {
        patientId: patient.id,
        familyMemberId,
        dentistId,
        createdByStaffId: staffId,
        startAt,
        endAt,
        status: status as AppointmentStatus,
        isEmergency,
        reason,
        notes,
      },
    });
    await syncAppointmentReminders(tx, id, startAt);
  });

  revalidatePath("/staff/dashboard");
  redirect("/staff/dashboard");
}

export async function cancelStaffAppointment(formData: FormData) {
  const { department } = await requireStaff();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.appointment.findFirst({
    where: { id, dentist: { department } },
  });
  if (!existing) return;

  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/staff/dashboard");
}
