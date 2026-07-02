import type { Database } from "@/types/database";
import { getDefaultDashboardPath } from "@/lib/site";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type SessionProxyOptions = {
  loginPath?: string;
  dashboardPath?: string;
  protectedPathPrefixes?: string[];
};

export async function updateSupabaseSession(
  request: NextRequest,
  options: SessionProxyOptions = {},
) {
  let response = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginPath = options.loginPath ?? "/login";
  const dashboardPath = options.dashboardPath ?? getDefaultDashboardPath();
  const protectedPathPrefixes = options.protectedPathPrefixes ?? [
    getDefaultDashboardPath(),
    "/dashboard",
    "/panel",
    "/admin",
    "/tdp/dashboard",
    "/tdp/panel",
  ];

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith(loginPath);
  const isProtectedRoute = protectedPathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = loginPath;
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardPath;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
