import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = searchParams ? await searchParams : {};
  const session = await auth();
  if (session?.user) {
    const r = session.user.role;
    if (r === "PATIENT") redirect("/dashboard");
    redirect("/staff/dashboard");
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
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Patients and families
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          {sp.registered === "1" ? (
            <p className="mb-6 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
              Account created. Sign in with your email and password.
            </p>
          ) : null}
          <LoginForm variant="patient" />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Practice staff?{" "}
          <Link href="/staff/login" className="font-medium text-teal-700 hover:underline">
            Staff portal
          </Link>
        </p>
      </div>
    </div>
  );
}
