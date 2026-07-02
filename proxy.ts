import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { getDefaultDashboardPath, isTdpSite } from "@/lib/site";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  if (!isTdpSite()) {
    return updateSupabaseSession(request);
  }

  const pathname = request.nextUrl.pathname;
  const isAllowedRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/tdp");

  if (!isAllowedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDefaultDashboardPath();
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
