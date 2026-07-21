"use client";

import Link from "next/link";
import { useActionState } from "react";
import { reschedulePatientAppointment, type BookingActionState } from "./actions";

type DentistOption = { id: string; name: string | null; email: string };
type FamilyOption = { id: string; firstName: string; lastName: string };

type Props = {
  appointmentId: string;
  dentists: DentistOption[];
  familyMembers: FamilyOption[];
  defaultStartAt: string;
  defaultDentistId: string;
  defaultFamilyMemberId: string | null;
  defaultIsEmergency: boolean;
  defaultReason: string | null;
};

const initial: BookingActionState = {};

export function RescheduleForm({
  appointmentId,
  dentists,
  familyMembers,
  defaultStartAt,
  defaultDentistId,
  defaultFamilyMemberId,
  defaultIsEmergency,
  defaultReason,
}: Props) {
  const [state, formAction, pending] = useActionState(
    reschedulePatientAppointment,
    initial,
  );

  if (dentists.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No dentists are available. Contact the clinic.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={appointmentId} />
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="dentistId" className="block text-sm font-medium text-slate-700">
          Dentist
        </label>
        <select
          id="dentistId"
          name="dentistId"
          required
          defaultValue={defaultDentistId}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          {dentists.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name?.trim() || d.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="familyMemberId" className="block text-sm font-medium text-slate-700">
          Who is the visit for?
        </label>
        <select
          id="familyMemberId"
          name="familyMemberId"
          defaultValue={defaultFamilyMemberId ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Me (account holder)</option>
          {familyMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="startAt" className="block text-sm font-medium text-slate-700">
          New date & time
        </label>
        <input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={defaultStartAt}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          45-minute slot. Reminder times are recalculated from the new start time.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="isEmergency"
          name="isEmergency"
          type="checkbox"
          defaultChecked={defaultIsEmergency}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        <div>
          <label htmlFor="isEmergency" className="text-sm font-medium text-slate-900">
            Emergency / urgent visit
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
          Reason for visit <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          defaultValue={defaultReason ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save new time"}
        </button>
        <Link
          href="/dashboard/appointments"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back
        </Link>
      </div>
    </form>
  );
}
