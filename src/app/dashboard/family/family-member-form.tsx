"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createFamilyMember,
  updateFamilyMember,
  type FamilyActionState,
} from "./actions";
import { toDateInputValue } from "@/lib/format-date-input";

type EditInitial = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  dob: Date | null;
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: EditInitial };

const empty: FamilyActionState = {};

export function FamilyMemberForm(props: Props) {
  const action =
    props.mode === "create" ? createFamilyMember : updateFamilyMember;
  const [state, formAction, pending] = useActionState(action, empty);

  const initial = props.mode === "edit" ? props.initial : null;

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
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={initial?.firstName}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            defaultValue={initial?.lastName}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="relationship" className="block text-sm font-medium text-slate-700">
          Relationship <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="relationship"
          name="relationship"
          placeholder="e.g. Child, Spouse"
          defaultValue={initial?.relationship ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-slate-700">
          Date of birth <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          defaultValue={toDateInputValue(initial?.dob ?? null)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Add member"}
        </button>
        <Link
          href="/dashboard/family"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
