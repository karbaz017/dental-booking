"use client";

import { useState } from "react";
import { ClinicalNotes } from "./clinical-notes";
import { PerioChartComponent } from "./perio-chart";
import { OnboardingDetails } from "./onboarding-details";

type Props = {
  patientId: string;
  initialPatient: any;
  appointments: any[];
  latestPerio: any;
};

export function PatientChartTabs({ patientId, initialPatient, appointments, latestPerio }: Props) {
  const [activeTab, setActiveTab] = useState<"notes" | "perio" | "details">("details");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("details")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "details"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Onboarding & Details
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "notes"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Clinical Notes
          </button>
          <button
            onClick={() => setActiveTab("perio")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "perio"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Periodontal Chart (Perio)
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "details" ? (
          <OnboardingDetails 
            patient={initialPatient} 
            appointments={appointments}
            latestPerio={latestPerio}
          />
        ) : activeTab === "notes" ? (
          <ClinicalNotes patientId={patientId} />
        ) : (
          <PerioChartComponent patientId={patientId} />
        )}
      </div>
    </div>
  );
}
