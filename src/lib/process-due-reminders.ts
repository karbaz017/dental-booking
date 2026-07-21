import type { ReminderWindow } from "@prisma/client";
import { deliverReminderEmail } from "@/lib/reminder-delivery";
import {
  reminderEmailSubject,
  reminderEmailText,
  reminderWindowToLabel,
} from "@/lib/reminder-email-templates";
import { prisma } from "@/lib/prisma";

export type ProcessedReminder = {
  id: string;
  window: ReminderWindow;
  patientEmail: string;
  appointmentId: string;
  appointmentStartIso: string;
};

export type ProcessDueRemindersResult = {
  processed: number;
  reminders: ProcessedReminder[];
};

function formatAppointmentWhen(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Due reminders: optional Resend email, then mark `sentAt`.
 * Delivery failures skip that row so the next cron run can retry.
 */
export async function processDueReminders(): Promise<ProcessDueRemindersResult> {
  const now = new Date();

  const due = await prisma.appointmentReminder.findMany({
    where: {
      sentAt: null,
      fireAt: { lte: now },
    },
    include: {
      appointment: {
        include: {
          patient: { select: { email: true, name: true } },
          dentist: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: [{ fireAt: "asc" }, { id: "asc" }],
  });

  if (due.length === 0) {
    return { processed: 0, reminders: [] };
  }

  const reminders: ProcessedReminder[] = [];

  for (const r of due) {
    const patientName =
      r.appointment.patient.name?.trim() || r.appointment.patient.email.split("@")[0] || "there";
    const dentistLabel =
      r.appointment.dentist.name?.trim() || r.appointment.dentist.email;
    const appointmentWhenLabel = formatAppointmentWhen(r.appointment.startAt);
    const windowLabel = reminderWindowToLabel(r.window);

    const templateInput = {
      patientName,
      appointmentWhenLabel,
      dentistLabel,
      windowLabel,
    };

    const subject = reminderEmailSubject(templateInput);
    const text = reminderEmailText(templateInput);

    try {
      await deliverReminderEmail({
        to: r.appointment.patient.email,
        subject,
        text,
      });
    } catch (err) {
      console.error("[reminder delivery failed]", r.id, err);
      continue;
    }

    await prisma.appointmentReminder.update({
      where: { id: r.id },
      data: { sentAt: now },
    });

    reminders.push({
      id: r.id,
      window: r.window,
      patientEmail: r.appointment.patient.email,
      appointmentId: r.appointmentId,
      appointmentStartIso: r.appointment.startAt.toISOString(),
    });
  }

  return { processed: reminders.length, reminders };
}
