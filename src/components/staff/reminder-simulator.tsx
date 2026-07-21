"use client";

import { useActionState } from "react";
import {
  runReminderSimulationAction,
  type ReminderSimState,
} from "@/app/staff/dashboard/reminder-actions";

const initial: ReminderSimState | null = null;

export function ReminderSimulator() {
  const [state, action, pending] = useActionState(runReminderSimulationAction, initial);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Reminder job (simulated)</h3>
      <p className="mt-1 text-sm text-slate-600">
        Marks due rows as sent where{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">fireAt ≤ now</code> and{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">sentAt</code> is empty — same
        logic as the cron API.
      </p>
      <form action={action} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Running…" : "Run now"}
        </button>
      </form>
      {state?.ok === false ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-3 text-sm text-teal-950">
          <p className="font-semibold">
            Processed {state.processed} reminder{state.processed === 1 ? "" : "s"}.
          </p>
          {state.reminders.length > 0 ? (
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-xs">
              {state.reminders.map((r) => (
                <li key={r.id} className="font-mono leading-relaxed">
                  {r.window.replaceAll("_", " ")} → {r.patientEmail} · appt{" "}
                  {new Date(r.appointmentStartIso).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-teal-800">Nothing due right now.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
