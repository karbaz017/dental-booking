import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Loads an appointment the patient may reschedule (future, scheduled or confirmed). */
export async function getPatientRescheduleAppointment(
  patientId: string,
  appointmentId: string,
) {
  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId,
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startAt: { gte: new Date() },
    },
  });
}
