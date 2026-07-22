import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StaffNav } from "@/components/staff/staff-nav";

export default async function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const roleLabel = session.user.role.replaceAll("_", " ");

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              DentalCare
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Staff · {roleLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[14rem] truncate text-sm text-slate-600 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <StaffNav role={session.user.role} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
