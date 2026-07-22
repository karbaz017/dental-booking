"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPatientAction, type NewPatientState } from "./actions";

const initial: NewPatientState = {};

export function NewPatientForm() {
  const [state, formAction, pending] = useActionState(createPatientAction, initial);
  const [tempPassword, setTempPassword] = useState("Welcome123!");

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

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane.doe@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="e.g. (555) 019-2834"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Temporary Password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            required
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
          <p className="mt-1 text-xs text-slate-500">
            Provide this password to the patient so they can sign in later to schedule appointments or check messages.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Onboard Patient"}
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
