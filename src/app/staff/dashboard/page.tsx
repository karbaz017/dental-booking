import type { Prisma } from "@prisma/client";
import { Role } from "@prisma/client";
import Link from "next/link";
import { ReminderSimulator } from "@/components/staff/reminder-simulator";
import { parseLocalDayBounds } from "@/lib/day-bounds";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { cancelStaffAppointment } from "./appointments/actions";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type StaffDashboardProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function StaffDashboardPage({ searchParams }: StaffDashboardProps) {
  const { department } = await requireStaff();
  const sp = searchParams ? await searchParams : {};

  const dateStr = sp.date ?? "";
  const dentistId = sp.dentist ?? "";
  const emergency = sp.emergency ?? "";

  const andParts: Prisma.AppointmentWhereInput[] = [];
  const bounds = dateStr ? parseLocalDayBounds(dateStr) : null;
  if (bounds) {
    andParts.push({
      startAt: { gte: bounds.start, lte: bounds.end },
    });
  }
  if (dentistId) {
    andParts.push({ dentistId });
  }
  if (emergency === "1") {
    andParts.push({ isEmergency: true });
  }
  if (emergency === "0") {
    andParts.push({ isEmergency: false });
  }

  const where: Prisma.AppointmentWhereInput =
    andParts.length > 0
      ? { AND: [{ dentist: { department } }, ...andParts] }
      : { dentist: { department } };

  const [rows, dentists] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
      include: {
        patient: { select: { name: true, email: true } },
        familyMember: true,
        dentist: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.DOCTOR, department },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Appointments</h2>
          <p className="mt-1 text-sm text-slate-600">
            Filter by day, dentist, or emergency. Click a row to edit.
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-teal-700">
            Department: {department.replaceAll("_", " ")}
          </p>
        </div>
        <Link
          href="/staff/dashboard/appointments/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          New appointment
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="date" className="block text-xs font-medium text-slate-600">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={dateStr}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="dentist" className="block text-xs font-medium text-slate-600">
            Dentist
          </label>
          <select
            id="dentist"
            name="dentist"
            defaultValue={dentistId}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          >
            <option value="">All dentists</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name?.trim() || d.email}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[10rem]">
          <label htmlFor="emergency" className="block text-xs font-medium text-slate-600">
            Emergency
          </label>
          <select
            id="emergency"
            name="emergency"
            defaultValue={emergency}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          >
            <option value="">All</option>
            <option value="1">Emergency only</option>
            <option value="0">Non-emergency</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Apply
          </button>
          <Link
            href="/staff/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Clear
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          No appointments match these filters.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[56rem] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">For</th>
                <th className="px-4 py-3">Dentist</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className={
                    a.isEmergency ? "bg-red-50/80 hover:bg-red-50" : "hover:bg-slate-50"
                  }
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    <div className="flex flex-col gap-0.5">
                      <span>{formatWhen(a.startAt)}</span>
                      {a.isEmergency ? (
                        <span className="w-fit rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Emergency
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="max-w-[14rem] truncate font-medium">
                      {a.patient.name?.trim() || a.patient.email}
                    </div>
                    <div className="truncate text-xs text-slate-500">{a.patient.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {a.familyMember
                      ? `${a.familyMember.firstName} ${a.familyMember.lastName}`
                      : "Account holder"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {a.dentist.name?.trim() || a.dentist.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      {a.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/staff/dashboard/appointments/${a.id}/edit`}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      {a.status !== "CANCELLED" ? (
                        <form action={cancelStaffAppointment} className="inline">
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 max-w-2xl">
        <ReminderSimulator />
      </div>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="font-medium text-teal-700 hover:underline">
          ← Public site
        </Link>
      </p>
    </div>
  );
}
