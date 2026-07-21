import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffRegisterForm } from "./register-form";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

export default async function StaffRegisterPage() {
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
        <Link href="/" className="flex justify-center text-lg font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
            D
          </span>
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Staff registration
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Create a staff account with role and department access
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <StaffRegisterForm />
        </div>
      </div>
    </div>
  );
}
