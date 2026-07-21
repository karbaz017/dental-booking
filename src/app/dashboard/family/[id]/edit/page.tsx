import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { FamilyMemberForm } from "../../family-member-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditFamilyMemberPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requirePatient();

  const member = await prisma.familyMember.findFirst({
    where: { id, patientId: userId },
  });
  if (!member) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Edit family member</h2>
      <p className="mt-1 text-sm text-slate-600">
        Update details for {member.firstName} {member.lastName}.
      </p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <FamilyMemberForm
          mode="edit"
          initial={{
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            relationship: member.relationship,
            dob: member.dob,
          }}
        />
      </div>
    </div>
  );
}
