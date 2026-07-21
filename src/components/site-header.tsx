import Link from "next/link";

const nav = [
  { href: "/#services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-slate-900"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white"
            aria-hidden
          >
            D
          </span>
          <span className="hidden sm:inline">DentalCare Booking</span>
          <span className="sm:hidden">DentalCare</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-teal-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 sm:px-4"
          >
            Book care
          </Link>
        </div>
      </div>
    </header>
  );
}
