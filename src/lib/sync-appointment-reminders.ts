import type { Prisma } from "@prisma/client";
import { buildReminderCreates } from "@/lib/appointment-scheduling";

export async function syncAppointmentReminders(
  tx: Prisma.TransactionClient,
  appointmentId: string,
  startAt: Date,
) {
  await tx.appointmentReminder.deleteMany({ where: { appointmentId } });
  await tx.appointmentReminder.createMany({
    data: buildReminderCreates(appointmentId, startAt),
  });
}
