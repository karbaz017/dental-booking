"use server";

import { processDueReminders } from "@/lib/process-due-reminders";
import { requireStaff } from "@/lib/require-staff";

export type ReminderSimState =
  | {
      ok: true;
      processed: number;
      reminders: Awaited<ReturnType<typeof processDueReminders>>["reminders"];
    }
  | { ok: false; error: string };

export async function runReminderSimulationAction(
  prev: ReminderSimState | null,
  formData: FormData,
): Promise<ReminderSimState> {
  void prev;
  void formData;
  try {
    await requireStaff();
    const result = await processDueReminders();
    return { ok: true, processed: result.processed, reminders: result.reminders };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
