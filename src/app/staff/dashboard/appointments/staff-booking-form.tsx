"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  createStaffAppointment,
  type StaffApptState,
} from "./actions";

type DentistOption = { id: string; name: string | null; email: string };

type Props = {
  dentists: DentistOption[];
  defaultStartAt: string;
};

const initial: StaffApptState = {};

type FamilyOpt = { id: string; firstName: string; lastName: string };

export function StaffBookingForm({ dentists, defaultStartAt }: Props) {
  const [state, formAction, pending] = useActionState(createStaffAppointment, initial);
  const [patientEmail, setPatientEmail] = useState("");
  const [familyOptions, setFamilyOptions] = useState<FamilyOpt[]>([]);

  useEffect(() => {
    const raw = patientEmail.trim().toLowerCase();
    const t = setTimeout(async () => {
      if (!raw || !raw.includes("@")) {
        setFamilyOptions([]);
        return;
      }
      const res = await fetch(
        `/api/staff/patient-family?email=${encodeURIComponent(raw)}`,
      );
      if (!res.ok) {
        setFamilyOptions([]);
        return;
      }
      const data = (await res.json()) as { members: FamilyOpt[] };
      setFamilyOptions(data.members ?? []);
    }, 400);
    return () => clearTimeout(t);
  }, [patientEmail]);

  if (dentists.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add at least one doctor user before scheduling.
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
        <label htmlFor="patientEmail" className="block text-sm font-medium text-slate-700">
          Patient email
        </label>
        <input
          id="patientEmail"
          name="patientEmail"
          type="email"
          required
          autoComplete="off"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          Must match a registered patient account. Family list loads after you type the email.
        </p>
      </div>

      <div>
        <label htmlFor="familyMemberId" className="block text-sm font-medium text-slate-700">
          Visit for
        </label>
        <select
          id="familyMemberId"
          name="familyMemberId"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Account holder</option>
          {familyOptions.map((m) => (
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
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Select dentist</option>
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
          defaultValue={defaultStartAt}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="isEmergency"
          name="isEmergency"
          type="checkbox"
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
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create appointment"}
        </button>
        <Link
          href="/staff/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
