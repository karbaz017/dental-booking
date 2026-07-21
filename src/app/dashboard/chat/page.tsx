import { ChatInbox } from "@/components/chat/chat-inbox";
import { requirePatient } from "@/lib/require-patient";

export default async function PatientChatPage() {
  const { userId } = await requirePatient();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Chat with the front desk for scheduling and questions. For clinical questions, your provider
        will address them at your visit.
      </p>
      <div className="mt-6">
        <ChatInbox
          selfId={userId}
          showStaffAndPatientStarters={false}
          context="patient"
        />
      </div>
    </div>
  );
}
