"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createAppointment, type BookingActionState } from "./actions";

type DentistOption = { id: string; name: string | null; email: string };
type FamilyOption = { id: string; firstName: string; lastName: string };

type Props = {
  dentists: DentistOption[];
  familyMembers: FamilyOption[];
  defaultStartAt: string;
};

const initial: BookingActionState = {};

export function BookingForm({ dentists, familyMembers, defaultStartAt }: Props) {
  const [state, formAction, pending] = useActionState(createAppointment, initial);

  if (dentists.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No dentists are set up yet. Ask your clinic to add doctor accounts, or run{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:seed</code> for demo data.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
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
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Select a dentist</option>
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
          Date & time
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
          Times use this device&apos;s local timezone. Slot length is 45 minutes.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="isEmergency"
          name="isEmergency"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        <div>
          <label htmlFor="isEmergency" className="text-sm font-medium text-slate-900">
            Emergency / urgent visit
          </label>
          <p className="mt-1 text-xs text-slate-600">
            Flags the request so staff can prioritize triage.
          </p>
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
          placeholder="e.g. tooth pain, cleaning, follow-up"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Booking…" : "Request appointment"}
        </button>
        <Link
          href="/dashboard/appointments"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
