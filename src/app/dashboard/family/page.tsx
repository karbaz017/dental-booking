import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { toDateInputValue } from "@/lib/format-date-input";
import { deleteFamilyMember } from "./actions";

export default async function FamilyListPage() {
  const { userId } = await requirePatient();
  const members = await prisma.familyMember.findMany({
    where: { patientId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Family members</h2>
          <p className="mt-1 text-sm text-slate-600">
            People on your account for booking visits.
          </p>
        </div>
        <Link
          href="/dashboard/family/new"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Add member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No family members yet.</p>
          <Link
            href="/dashboard/family/new"
            className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:underline"
          >
            Add your first member
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {m.firstName} {m.lastName}
                </p>
                {m.relationship ? (
                  <p className="mt-1 text-sm text-slate-600">{m.relationship}</p>
                ) : null}
                {m.dob ? (
                  <p className="mt-2 text-xs text-slate-500">
                    DOB {toDateInputValue(m.dob)}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/dashboard/family/${m.id}/edit`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
                <form action={deleteFamilyMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 transition hover:bg-red-100"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
