import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { toDateInputValue } from "@/lib/format-date-input";
import { deleteInsurance } from "./actions";

export default async function InsuranceListPage() {
  const { userId } = await requirePatient();
  const plans = await prisma.insurance.findMany({
    where: { patientId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Insurance</h2>
          <p className="mt-1 text-sm text-slate-600">
            Plans on file for verification at check-in.
          </p>
        </div>
        <Link
          href="/dashboard/insurance/new"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Add plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No insurance plans saved yet.</p>
          <Link
            href="/dashboard/insurance/new"
            className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:underline"
          >
            Add a plan
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {plans.map((p) => (
            <li
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">{p.carrierName}</p>
                {p.planName ? (
                  <p className="mt-1 text-sm text-slate-600">{p.planName}</p>
                ) : null}
                <dl className="mt-3 space-y-1 text-sm text-slate-600">
                  <div>
                    <dt className="inline font-medium text-slate-700">Member ID:</dt>{" "}
                    <dd className="inline font-mono text-xs">{p.memberId}</dd>
                  </div>
                  {p.groupNumber ? (
                    <div>
                      <dt className="inline font-medium text-slate-700">Group:</dt>{" "}
                      <dd className="inline font-mono text-xs">{p.groupNumber}</dd>
                    </div>
                  ) : null}
                  {p.subscriberName ? (
                    <div>
                      <dt className="inline font-medium text-slate-700">Subscriber:</dt>{" "}
                      <dd className="inline">{p.subscriberName}</dd>
                    </div>
                  ) : null}
                  {p.effectiveDate ? (
                    <div>
                      <dt className="inline font-medium text-slate-700">Effective:</dt>{" "}
                      <dd className="inline">{toDateInputValue(p.effectiveDate)}</dd>
                    </div>
                  ) : null}
                </dl>
                {p.notes ? (
                  <p className="mt-3 line-clamp-3 text-xs text-slate-500">{p.notes}</p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/dashboard/insurance/${p.id}/edit`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
                <form action={deleteInsurance}>
                  <input type="hidden" name="id" value={p.id} />
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
