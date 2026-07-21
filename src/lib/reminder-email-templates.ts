import type { ReminderWindow } from "@prisma/client";

/**
 * Plain-text copy for email/SMS. Used by `processDueReminders` + Resend when configured.
 */

export function reminderWindowToLabel(w: ReminderWindow): "one week" | "one day" {
  return w === "SEVEN_DAYS" ? "one week" : "one day";
}

export type ReminderTemplateInput = {
  patientName: string;
  appointmentWhenLabel: string;
  dentistLabel: string;
  windowLabel: "one week" | "one day";
};

export function reminderEmailSubject(input: ReminderTemplateInput): string {
  return `DentalCare reminder — visit in ${input.windowLabel}`;
}

export function reminderEmailText(input: ReminderTemplateInput): string {
  return [
    `Hi ${input.patientName},`,
    "",
    `This is a friendly reminder about your dental visit ${input.windowLabel} from now:`,
    input.appointmentWhenLabel,
    `Provider: ${input.dentistLabel}`,
    "",
    "If you need to reschedule, sign in to your patient portal or call the office.",
    "",
    "— DentalCare Booking",
  ].join("\n");
}
