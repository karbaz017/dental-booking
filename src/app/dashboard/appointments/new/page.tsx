import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  defaultBookingStart,
  formatForDatetimeLocalInput,
} from "@/lib/datetime-local";
import { requirePatient } from "@/lib/require-patient";
import { BookingForm } from "../booking-form";

export default async function NewAppointmentPage() {
  const { userId } = await requirePatient();

  const defaultStartAt = formatForDatetimeLocalInput(defaultBookingStart());

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

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Book a visit</h2>
      <p className="mt-1 text-sm text-slate-600">
        Choose a dentist and time. You&apos;ll get reminder rows for one week and one day
        before (for the future cron job).
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <BookingForm
          dentists={dentists}
          familyMembers={familyMembers}
          defaultStartAt={defaultStartAt}
        />
      </div>
    </div>
  );
}
