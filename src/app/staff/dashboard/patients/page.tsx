import { Role } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

type Props = {
  searchParams?: Promise<{ search?: string }>;
};

export default async function PatientsPage({ searchParams }: Props) {
  await requireStaff();
  const sp = searchParams ? await searchParams : {};
  const query = sp.search?.trim() ?? "";

  // Query all patient users
  const allPatients = await prisma.user.findMany({
    where: { role: Role.PATIENT },
    select: {
      id: true,
      name: true,
      email: true,
      chartNumber: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter in-memory for SQLite case-insensitivity safety
  const matchingPatients = query
    ? allPatients.filter((p) => {
        const s = query.toLowerCase();
        return (
          p.name?.toLowerCase().includes(s) ||
          p.chartNumber?.toLowerCase().includes(s) ||
          p.email.toLowerCase().includes(s) ||
          p.phone?.includes(s)
        );
      })
    : allPatients;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patients Directory</h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Search patient records, view clinical histories, and perform perio charting.
          </p>
        </div>
      </div>

      {/* Search Input Box Form */}
      <form
        method="get"
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="search" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Search Patients
          </label>
          <input
            id="search"
            name="search"
            type="text"
            defaultValue={query}
            placeholder="Search by name, chart number, email, or phone number..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Search
          </button>
          {query && (
            <Link
              href="/staff/dashboard/patients"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table Results */}
      {matchingPatients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          {query ? `No patients match the search term "${query}".` : "No registered patients in directory."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[50rem] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Chart Number</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {matchingPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-teal-800">
                    {p.chartNumber ? `#${p.chartNumber}` : <span className="text-slate-400 font-normal">N/A</span>}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {p.name || <span className="text-slate-400 font-normal">Unnamed Patient</span>}
                  </td>
                  <td className="px-6 py-4 truncate max-w-[12rem]">{p.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.phone || <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/staff/dashboard/patients/${p.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
                    >
                      View Chart
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
