import { Role } from "@prisma/client";
import {
  defaultBookingStart,
  formatForDatetimeLocalInput,
} from "@/lib/datetime-local";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { StaffBookingForm } from "../staff-booking-form";

export default async function StaffNewAppointmentPage() {
  const { department } = await requireStaff();

  const dentists = await prisma.user.findMany({
    where: { role: Role.DOCTOR, department },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  const defaultStartAt = formatForDatetimeLocalInput(defaultBookingStart());

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">New appointment</h2>
      <p className="mt-1 text-sm text-slate-600">
        Book on behalf of a patient. Filters and the full schedule are on the main staff
        board.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <StaffBookingForm dentists={dentists} defaultStartAt={defaultStartAt} />
      </div>
    </div>
  );
}
