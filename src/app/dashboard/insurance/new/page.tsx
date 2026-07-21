import { InsuranceForm } from "../insurance-form";

export default function NewInsurancePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Add insurance plan</h2>
      <p className="mt-1 text-sm text-slate-600">
        US dental billing details your front desk may ask for.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <InsuranceForm mode="create" />
      </div>
    </div>
  );
}
