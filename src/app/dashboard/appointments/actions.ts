"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { buildReminderCreates, endAtFromStart } from "@/lib/appointment-scheduling";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { syncAppointmentReminders } from "@/lib/sync-appointment-reminders";

export type BookingActionState = { error?: string };

export async function createAppointment(
  _prev: BookingActionState | undefined,
  formData: FormData,
): Promise<BookingActionState> {
  const { userId } = await requirePatient();

  const dentistId = String(formData.get("dentistId") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const familyMemberIdRaw = String(formData.get("familyMemberId") ?? "").trim();
  const familyMemberId = familyMemberIdRaw.length > 0 ? familyMemberIdRaw : null;
  const isEmergency = formData.get("isEmergency") === "on";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!dentistId || !startRaw) {
    return { error: "Dentist and date/time are required." };
  }

  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { error: "Invalid date or time." };
  }

  const minStart = Date.now() + 60_000;
  if (startAt.getTime() < minStart) {
    return { error: "Please choose a time at least one minute from now." };
  }

  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, role: Role.DOCTOR },
  });
  if (!dentist) {
    return { error: "Selected dentist is not available." };
  }

  if (familyMemberId) {
    const member = await prisma.familyMember.findFirst({
      where: { id: familyMemberId, patientId: userId },
    });
    if (!member) {
      return { error: "That family member is not on your account." };
    }
  }

  const endAt = endAtFromStart(startAt);

  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        patientId: userId,
        familyMemberId,
        dentistId,
        startAt,
        endAt,
        isEmergency,
        reason,
        status: "SCHEDULED",
      },
    });

    await tx.appointmentReminder.createMany({
      data: buildReminderCreates(appt.id, startAt),
    });
  });

  revalidatePath("/dashboard/appointments");
  redirect("/dashboard/appointments");
}

export async function cancelPatientAppointment(formData: FormData) {
  const { userId } = await requirePatient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const appt = await prisma.appointment.findFirst({
    where: { id, patientId: userId },
  });
  if (!appt) return;
  if (appt.status === "CANCELLED" || appt.status === "COMPLETED") return;
  if (appt.startAt.getTime() < Date.now()) return;

  await prisma.$transaction([
    prisma.appointmentReminder.deleteMany({ where: { appointmentId: id } }),
    prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    }),
  ]);

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/staff/dashboard");
}

export async function reschedulePatientAppointment(
  _prev: BookingActionState | undefined,
  formData: FormData,
): Promise<BookingActionState> {
  const { userId } = await requirePatient();

  const id = String(formData.get("id") ?? "").trim();
  const dentistId = String(formData.get("dentistId") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const familyMemberIdRaw = String(formData.get("familyMemberId") ?? "").trim();
  const familyMemberId = familyMemberIdRaw.length > 0 ? familyMemberIdRaw : null;
  const isEmergency = formData.get("isEmergency") === "on";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!id || !dentistId || !startRaw) {
    return { error: "Missing appointment or required fields." };
  }

  const appt = await prisma.appointment.findFirst({
    where: { id, patientId: userId },
  });
  if (!appt) {
    return { error: "Appointment not found." };
  }
  if (appt.status !== "SCHEDULED" && appt.status !== "CONFIRMED") {
    return { error: "This visit can no longer be rescheduled online." };
  }
  if (appt.startAt.getTime() < Date.now()) {
    return { error: "Past visits cannot be rescheduled here." };
  }

  const startAt = new Date(startRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { error: "Invalid date or time." };
  }

  const minStart = Date.now() + 60_000;
  if (startAt.getTime() < minStart) {
    return { error: "Please choose a time at least one minute from now." };
  }

  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, role: Role.DOCTOR },
  });
  if (!dentist) {
    return { error: "Selected dentist is not available." };
  }

  if (familyMemberId) {
    const member = await prisma.familyMember.findFirst({
      where: { id: familyMemberId, patientId: userId },
    });
    if (!member) {
      return { error: "That family member is not on your account." };
    }
  }

  const endAt = endAtFromStart(startAt);

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: {
        dentistId,
        familyMemberId,
        startAt,
        endAt,
        isEmergency,
        reason,
      },
    });
    await syncAppointmentReminders(tx, id, startAt);
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/staff/dashboard");
  redirect("/dashboard/appointments");
}
