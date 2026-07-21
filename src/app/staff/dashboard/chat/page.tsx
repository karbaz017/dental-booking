import { ChatInbox } from "@/components/chat/chat-inbox";
import { requireStaff } from "@/lib/require-staff";

export default async function StaffChatPage() {
  const { role, userId } = await requireStaff();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Chat</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Message other team members. Front-desk staff can also message patients; patients can only
        message the front desk.
      </p>
      <div className="mt-6">
        <ChatInbox
          selfId={userId}
          showStaffAndPatientStarters={role === "FRONT_DESK"}
          context="staff"
        />
      </div>
    </div>
  );
}
