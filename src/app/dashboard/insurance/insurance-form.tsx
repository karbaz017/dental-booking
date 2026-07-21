"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createInsurance,
  updateInsurance,
  type InsuranceActionState,
} from "./actions";
import { toDateInputValue } from "@/lib/format-date-input";

type EditInitial = {
  id: string;
  carrierName: string;
  planName: string | null;
  memberId: string;
  groupNumber: string | null;
  subscriberName: string | null;
  effectiveDate: Date | null;
  notes: string | null;
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; initial: EditInitial };

const empty: InsuranceActionState = {};

export function InsuranceForm(props: Props) {
  const action = props.mode === "create" ? createInsurance : updateInsurance;
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
      <div>
        <label htmlFor="carrierName" className="block text-sm font-medium text-slate-700">
          Insurance carrier
        </label>
        <input
          id="carrierName"
          name="carrierName"
          required
          placeholder="e.g. Delta Dental"
          defaultValue={initial?.carrierName}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="planName" className="block text-sm font-medium text-slate-700">
          Plan name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="planName"
          name="planName"
          defaultValue={initial?.planName ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">
            Member ID
          </label>
          <input
            id="memberId"
            name="memberId"
            required
            defaultValue={initial?.memberId}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="groupNumber" className="block text-sm font-medium text-slate-700">
            Group number <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="groupNumber"
            name="groupNumber"
            defaultValue={initial?.groupNumber ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subscriberName" className="block text-sm font-medium text-slate-700">
          Subscriber name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="subscriberName"
          name="subscriberName"
          defaultValue={initial?.subscriberName ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-700">
          Effective date <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="effectiveDate"
          name="effectiveDate"
          type="date"
          defaultValue={toDateInputValue(initial?.effectiveDate ?? null)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : initial ? "Save plan" : "Add plan"}
        </button>
        <Link
          href="/dashboard/insurance"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
