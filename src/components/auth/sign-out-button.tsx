"use client";

import { signOut } from "next-auth/react";

type Props = {
  label?: string;
  className?: string;
};

export function SignOutButton({
  label = "Sign out",
  className = "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50",
}: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      {label}
    </button>
  );
}
