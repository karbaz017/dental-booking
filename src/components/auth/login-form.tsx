"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  variant: "patient" | "staff";
};

export function LoginForm({ variant }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const defaultDest =
    variant === "staff" ? "/staff/dashboard" : "/dashboard";
  const dest =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : defaultDest;

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "");
        const password = String(fd.get("password") ?? "");
        startTransition(async () => {
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (res?.error) {
            setError("Invalid email or password.");
            return;
          }
          if (res?.ok) {
            router.push(dest);
            router.refresh();
          }
        });
      }}
    >
      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {variant === "patient" ? (
        <p className="text-center text-sm text-slate-600">
          No account?{" "}
          <Link href="/register" className="font-medium text-teal-700 hover:underline">
            Register
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            Patient sign in
          </Link>
        </p>
      )}
    </form>
  );
}
