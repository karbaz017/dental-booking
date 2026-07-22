"use client";

import { cancelStaffAppointment } from "@/app/staff/dashboard/appointments/actions";

export function CancelAppointmentButton({ id }: { id: string }) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={cancelStaffAppointment} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-100"
      >
        Cancel
      </button>
    </form>
  );
}
