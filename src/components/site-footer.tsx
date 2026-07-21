import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-slate-200 bg-slate-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">DentalCare Booking</p>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Appointment scheduling for US dental practices. Patients and
              staff stay aligned from booking to chair time.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="font-medium text-slate-900">Patients</p>
              <ul className="mt-2 space-y-2 text-slate-600">
                <li>
                  <Link href="/register" className="hover:text-teal-700">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-teal-700">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-900">Practice</p>
              <ul className="mt-2 space-y-2 text-slate-600">
                <li>
                  <Link href="/staff/login" className="hover:text-teal-700">
                    Staff portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} DentalCare Booking. Demo product.
        </p>
      </div>
    </footer>
  );
}
