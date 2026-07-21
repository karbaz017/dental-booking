import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";

export default async function PatientDashboardPage() {
  const { userId } = await requirePatient();
  const now = new Date();

  const [familyCount, insuranceCount, upcomingCount, appointmentTotal] =
    await Promise.all([
      prisma.familyMember.count({ where: { patientId: userId } }),
      prisma.insurance.count({ where: { patientId: userId } }),
      prisma.appointment.count({
        where: { patientId: userId, startAt: { gte: now } },
      }),
      prisma.appointment.count({ where: { patientId: userId } }),
    ]);

  const cards = [
    {
      title: "Appointments",
      description: "Book visits and see what’s coming up.",
      href: "/dashboard/appointments",
      countLabel: `${upcomingCount} upcoming`,
      subLabel:
        appointmentTotal > 0
          ? `${appointmentTotal} total on record`
          : "None yet",
      cta: "View schedule",
    },
    {
      title: "Family members",
      description: "Add dependents and others you book for.",
      href: "/dashboard/family",
      countLabel: `${familyCount} saved`,
      subLabel: null,
      cta: "Manage family",
    },
    {
      title: "Insurance",
      description: "Carrier, member ID, and plan details.",
      href: "/dashboard/insurance",
      countLabel: `${insuranceCount} saved`,
      subLabel: null,
      cta: "Manage insurance",
    },
  ] as const;

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Keep your household and coverage on file, then book when you&apos;re ready.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Book a visit
        </Link>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li
            key={c.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-teal-700">{c.countLabel}</p>
            {c.subLabel ? (
              <p className="mt-0.5 text-xs text-slate-500">{c.subLabel}</p>
            ) : null}
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            <Link
              href={c.href}
              className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline"
            >
              {c.cta} →
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="font-medium text-teal-700 hover:underline">
          ← Back to public site
        </Link>
      </p>
    </div>
  );
}
