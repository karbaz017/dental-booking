import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { cancelPatientAppointment } from "./actions";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusStyles(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-teal-100 text-teal-900";
    case "CANCELLED":
      return "bg-slate-200 text-slate-800";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-900";
    case "NO_SHOW":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default async function AppointmentsPage() {
  const { userId } = await requirePatient();
  const now = new Date();

  const rows = await prisma.appointment.findMany({
    where: { patientId: userId },
    orderBy: { startAt: "desc" },
    include: {
      familyMember: true,
      dentist: { select: { name: true, email: true } },
    },
  });

  const upcoming = rows
    .filter((a) => a.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = rows
    .filter((a) => a.startAt < now)
    .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Appointments</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upcoming visits and your history with this clinic.
          </p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Book a visit
        </Link>
      </div>

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Upcoming
        </h3>
        {upcoming.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Nothing scheduled yet.{" "}
            <Link href="/dashboard/appointments/new" className="font-semibold text-teal-700 hover:underline">
              Book your first visit
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  a.isEmergency ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{formatWhen(a.startAt)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {a.dentist.name?.trim() || a.dentist.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      For:{" "}
                      {a.familyMember
                        ? `${a.familyMember.firstName} ${a.familyMember.lastName}`
                        : "You (account holder)"}
                    </p>
                    {a.reason ? (
                      <p className="mt-2 text-sm text-slate-500">{a.reason}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles(a.status)}`}
                    >
                      {a.status.replaceAll("_", " ")}
                    </span>
                    {a.isEmergency ? (
                      <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        Emergency
                      </span>
                    ) : null}
                    {a.status === "SCHEDULED" || a.status === "CONFIRMED" ? (
                      <div className="flex w-full flex-col gap-2">
                        <Link
                          href={`/dashboard/appointments/${a.id}/reschedule`}
                          className="block w-full rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-center text-xs font-semibold text-teal-900 transition hover:bg-teal-100"
                        >
                          Reschedule
                        </Link>
                        <form action={cancelPatientAppointment} className="w-full">
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            Cancel appointment
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Past
        </h3>
        {past.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No past appointments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {past.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-95"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{formatWhen(a.startAt)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {a.dentist.name?.trim() || a.dentist.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {a.familyMember
                        ? `${a.familyMember.firstName} ${a.familyMember.lastName}`
                        : "You"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles(a.status)}`}
                  >
                    {a.status.replaceAll("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
