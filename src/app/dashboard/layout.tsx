import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PatientNav } from "@/components/dashboard/patient-nav";
import { PatientChatAssistantWidget } from "@/components/chat/patient-chat-assistant-widget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              DentalCare
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Patient portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[14rem] truncate text-sm text-slate-600 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <PatientNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      {session.user.role === "PATIENT" && (
        <PatientChatAssistantWidget userId={session.user.id} />
      )}
    </div>
  );
}
