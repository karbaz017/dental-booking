"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerStaff, type StaffRegisterState } from "./actions";

const initial: StaffRegisterState = {};

export function StaffRegisterForm() {
  const [state, formAction, pending] = useActionState(registerStaff, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700">
            Staff role
          </label>
          <select
            id="role"
            name="role"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          >
            <option value="FRONT_DESK">Front desk</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="DOCTOR">Doctor</option>
          </select>
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="department"
            name="department"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          >
            <option value="GENERAL_DENTISTRY">General dentistry</option>
            <option value="ORTHODONTICS">Orthodontics</option>
            <option value="PEDIATRICS">Pediatrics</option>
            <option value="ORAL_SURGERY">Oral surgery</option>
            <option value="ENDODONTICS">Endodontics</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="registrationCode" className="block text-sm font-medium text-slate-700">
          Registration code
        </label>
        <input
          id="registrationCode"
          name="registrationCode"
          type="password"
          autoComplete="off"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Creating staff account..." : "Create staff account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        <Link href="/staff/login" className="font-medium text-teal-700 hover:underline">
          Back to staff login
        </Link>
      </p>
    </form>
  );
}
