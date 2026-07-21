import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/require-patient";
import { InsuranceForm } from "../../insurance-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditInsurancePage({ params }: Props) {
  const { id } = await params;
  const { userId } = await requirePatient();

  const plan = await prisma.insurance.findFirst({
    where: { id, patientId: userId },
  });
  if (!plan) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Edit insurance</h2>
      <p className="mt-1 text-sm text-slate-600">Update {plan.carrierName}.</p>
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <InsuranceForm
          mode="edit"
          initial={{
            id: plan.id,
            carrierName: plan.carrierName,
            planName: plan.planName,
            memberId: plan.memberId,
            groupNumber: plan.groupNumber,
            subscriberName: plan.subscriberName,
            effectiveDate: plan.effectiveDate,
            notes: plan.notes,
          }}
        />
      </div>
    </div>
  );
}
