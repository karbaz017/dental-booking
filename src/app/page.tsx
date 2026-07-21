import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";

const services = [
  {
    title: "Family scheduling",
    body: "Add dependents, sync visits, and keep everyone on one timeline.",
  },
  {
    title: "Insurance-ready",
    body: "Capture carrier and member details so the front desk is prepared.",
  },
  {
    title: "Emergency visits",
    body: "Flag urgent cases so staff can triage and prioritize chair time.",
  },
] as const;

const steps = [
  { n: "1", title: "Create your profile", body: "Register and add family members." },
  { n: "2", title: "Share insurance", body: "Add plan details once, reuse on bookings." },
  { n: "3", title: "Pick a slot", body: "Choose dentist, date, and visit type." },
  { n: "4", title: "Get reminders", body: "Email-style nudges one week and one day prior." },
] as const;

export default function Home() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl sm:h-96 sm:w-96"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              US dental practices
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Appointments your patients can book — and your team can trust
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-slate-600 sm:text-lg">
              One place for families, insurance, and emergency flags. Built for
              front desk, supervisors, and clinicians.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-700"
              >
                Start as a patient
              </Link>
              <Link
                href="/staff/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Staff sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything in one booking flow
          </h2>
          <p className="mt-3 text-slate-600">
            Designed for busy dental hospitals: clear handoffs between patients
            and staff, with visibility into urgency.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n} className="relative rounded-2xl bg-slate-50 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-3xl bg-teal-700 px-6 py-12 text-center text-white sm:px-12 sm:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready when your practice is
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-teal-100">
            Patient dashboard, staff dashboard, and role-based access ship in the
            next milestones of this build.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-teal-800 transition hover:bg-teal-50"
          >
            Create an account
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
