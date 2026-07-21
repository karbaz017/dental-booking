"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updateStaffAppointment,
  type StaffApptState,
} from "./actions";

type DentistOption = { id: string; name: string | null; email: string };
type FamilyOpt = { id: string; firstName: string; lastName: string };

type Initial = {
  id: string;
  patientEmail: string;
  dentistId: string;
  familyMemberId: string | null;
  startAtLocal: string;
  status: string;
  isEmergency: boolean;
  reason: string | null;
  notes: string | null;
};

type Props = {
  initial: Initial;
  dentists: DentistOption[];
  familyMembers: FamilyOpt[];
};

const initialState: StaffApptState = {};

export function StaffEditForm({ initial, dentists, familyMembers }: Props) {
  const [state, formAction, pending] = useActionState(
    updateStaffAppointment,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={initial.id} />
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="patientEmail" className="block text-sm font-medium text-slate-700">
          Patient email
        </label>
        <input
          id="patientEmail"
          name="patientEmail"
          type="email"
          required
          defaultValue={initial.patientEmail}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="familyMemberId" className="block text-sm font-medium text-slate-700">
          Visit for
        </label>
        <select
          id="familyMemberId"
          name="familyMemberId"
          defaultValue={initial.familyMemberId ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Account holder</option>
          {familyMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dentistId" className="block text-sm font-medium text-slate-700">
          Dentist
        </label>
        <select
          id="dentistId"
          name="dentistId"
          required
          defaultValue={initial.dentistId}
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
        <label htmlFor="startAt" className="block text-sm font-medium text-slate-700">
          Date & time
        </label>
        <input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={initial.startAtLocal}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial.status}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
          <option value="NO_SHOW">No show</option>
        </select>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="isEmergency"
          name="isEmergency"
          type="checkbox"
          defaultChecked={initial.isEmergency}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        <label htmlFor="isEmergency" className="text-sm font-medium text-slate-900">
          Emergency / urgent
        </label>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
          Reason <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={2}
          defaultValue={initial.reason ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Internal notes <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={initial.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/staff/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back
        </Link>
      </div>
    </form>
  );
}
