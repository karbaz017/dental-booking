import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import Link from "next/link";
import { PatientChartTabs } from "./chart-tabs";

type Props = { params: Promise<{ id: string }> };

export default async function PatientChartPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;

  const [patient, appointments, latestPerio] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: Role.PATIENT },
      include: {
        familyMembers: true,
        insurances: true,
      },
    }),
    prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: { startAt: "desc" },
      include: {
        dentist: { select: { name: true, email: true } },
      },
    }),
    prisma.perioChart.findFirst({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
      },
    }),
  ]);

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{patient.name || "Unnamed Patient"}</h2>
          <p className="text-sm text-slate-600 font-medium">
            {patient.chartNumber ? `Chart: #${patient.chartNumber}` : "No chart number assigned"} • {patient.email}
          </p>
        </div>
        <Link
          href="/staff/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <PatientChartTabs
        patientId={patient.id}
        initialPatient={patient}
        appointments={appointments}
        latestPerio={latestPerio}
      />
    </div>
  );
}
