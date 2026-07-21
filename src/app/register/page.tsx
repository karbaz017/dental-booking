import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "PATIENT") redirect("/dashboard");
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
          Create your patient account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Book visits for you and your family
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
