import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

type StaffLoginPageProps = {
  searchParams?: Promise<{ registered?: string }>;
};

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
  const sp = searchParams ? await searchParams : {};
  const session = await auth();
  if (session?.user && staffRoles.has(session.user.role)) {
    redirect("/staff/dashboard");
  }
  if (session?.user?.role === "PATIENT") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex justify-center text-lg font-semibold text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
            D
          </span>
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Staff sign in
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Front desk, supervisors, and doctors
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          {sp.registered === "1" ? (
            <p className="mb-6 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
              Staff account created. Sign in with your email and password.
            </p>
          ) : null}
          <LoginForm variant="staff" />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/staff/register" className="font-medium text-teal-700 hover:underline">
            Register staff
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            Patient sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
