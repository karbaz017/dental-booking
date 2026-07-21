import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

const staffRoles = new Set(["FRONT_DESK", "SUPERVISOR", "DOCTOR"]);

export async function middleware(req: NextRequest) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });
  const pathname = req.nextUrl.pathname;
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role && staffRoles.has(role)) {
      return NextResponse.redirect(new URL("/staff/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/staff/dashboard")) {
    if (!token) {
      const url = new URL("/staff/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (role && !staffRoles.has(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/staff/dashboard/:path*"],
};
