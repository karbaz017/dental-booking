import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { formatForDatetimeLocalInput } from "@/lib/datetime-local";
import { getPatientRescheduleAppointment } from "@/lib/patient-reschedule-context";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { RescheduleForm } from "../../reschedule-form";

type Props = { params: Promise<{ id: string }> };

export default async function RescheduleAppointmentPage({ params }: Props) {
  const { userId } = await requirePatient();
  const { id } = await params;

  const appointment = await getPatientRescheduleAppointment(userId, id);

  if (!appointment) notFound();

  const [dentists, familyMembers] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.DOCTOR },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.familyMember.findMany({
      where: { patientId: userId },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  if (!dentists.some((d) => d.id === appointment.dentistId)) {
    redirect("/dashboard/appointments");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Reschedule visit</h2>
      <p className="mt-1 text-sm text-slate-600">
        Pick a new time or dentist. Confirmed visits stay confirmed unless the clinic
        changes status.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <RescheduleForm
          appointmentId={appointment.id}
          dentists={dentists}
          familyMembers={familyMembers}
          defaultStartAt={formatForDatetimeLocalInput(appointment.startAt)}
          defaultDentistId={appointment.dentistId}
          defaultFamilyMemberId={appointment.familyMemberId}
          defaultIsEmergency={appointment.isEmergency}
          defaultReason={appointment.reason}
        />
      </div>
    </div>
  );
}
