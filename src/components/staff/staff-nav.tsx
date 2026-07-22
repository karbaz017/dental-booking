"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/staff/dashboard", label: "Schedule" },
  { href: "/staff/dashboard/patients", label: "Patients" },
  { href: "/staff/dashboard/appointments/new", label: "New appointment" },
  { href: "/staff/dashboard/patients/new", label: "New patient" },
  { href: "/staff/dashboard/chat", label: "Chat" },
] as const;

export function StaffNav({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleLinks = links.filter((item) => {
    if (role === "DOCTOR") {
      return item.label !== "New appointment" && item.label !== "New patient";
    }
    return true;
  });

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-2">
        {visibleLinks.map((item) => {
          const active =
            item.href === "/staff/dashboard"
              ? pathname === "/staff/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
