import { FamilyMemberForm } from "../family-member-form";

export default function NewFamilyMemberPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Add family member</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add a dependent or other person you schedule for.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <FamilyMemberForm mode="create" />
      </div>
    </div>
  );
}
