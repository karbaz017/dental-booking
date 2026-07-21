import { ReminderWindow } from "@prisma/client";

export const SLOT_MS = 45 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function endAtFromStart(startAt: Date): Date {
  return new Date(startAt.getTime() + SLOT_MS);
}

export function buildReminderCreates(appointmentId: string, startAt: Date) {
  return [
    {
      appointmentId,
      window: ReminderWindow.SEVEN_DAYS,
      fireAt: new Date(startAt.getTime() - WEEK_MS),
    },
    {
      appointmentId,
      window: ReminderWindow.ONE_DAY,
      fireAt: new Date(startAt.getTime() - DAY_MS),
    },
  ];
}
