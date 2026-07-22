import { requireStaff } from "@/lib/require-staff";
import { NewPatientForm } from "./patient-form";

export default async function NewPatientPage() {
  await requireStaff();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Onboard New Patient</h2>
      <p className="mt-1 text-sm text-slate-600">
        Register a new patient account. The system will automatically assign a unique Chart Number.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <NewPatientForm />
      </div>
    </div>
  );
}
