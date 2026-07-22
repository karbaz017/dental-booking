import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { formatForDatetimeLocalInput } from "@/lib/datetime-local";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { StaffEditForm } from "../../staff-edit-form";

type Props = { params: Promise<{ id: string }> };

export default async function StaffEditAppointmentPage({ params }: Props) {
  const { department } = await requireStaff();
  const { id } = await params;

  const [appointment, dentists] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id, dentist: { department } },
      include: {
        patient: { select: { id: true, name: true, email: true, chartNumber: true, phone: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.DOCTOR, department },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!appointment) notFound();

  const familyMembers = await prisma.familyMember.findMany({
    where: { patientId: appointment.patientId },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Edit appointment</h2>
      <p className="mt-1 text-sm text-slate-600">Update time, provider, status, or patient of record.</p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <StaffEditForm
          dentists={dentists}
          familyMembers={familyMembers}
          initial={{
            id: appointment.id,
            patientSearch: appointment.patient.chartNumber || appointment.patient.name || appointment.patient.email,
            patient: appointment.patient,
            dentistId: appointment.dentistId,
            familyMemberId: appointment.familyMemberId,
            startAtLocal: formatForDatetimeLocalInput(appointment.startAt),
            status: appointment.status,
            isEmergency: appointment.isEmergency,
            reason: appointment.reason,
            notes: appointment.notes,
          }}
        />
      </div>
    </div>
  );
}
