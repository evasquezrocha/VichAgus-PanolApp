import type { Database } from "@/types/database";
import {
  buildTenantUrl,
  getAppRootDomain,
  getLocalTenantSlugFromPathname,
  LOCAL_DEV_TENANT_COOKIE,
  LOCAL_DEV_PROFILE_COOKIE,
  LOCAL_DEV_USER_COOKIE,
  isLocalDevelopmentRoot,
  parseLocalDevProfileSnapshot,
  prependLocalTenantPathPrefix,
  resolveCompanyByHostname,
  stripLocalTenantPathPrefix,
} from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withSharedSupabaseCookieDomain } from "./cookies";

type SessionProfile = {
  company_id: string | null;
  role: string;
  companies: {
    slug: string;
    custom_domain?: string | null;
  } | null;
};

function applyPendingCookies(
  response: NextResponse,
  pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }>,
) {
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}

export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({
            name,
            value,
            options: withSharedSupabaseCookieDomain(options),
          });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const localRoot = isLocalDevelopmentRoot();
  const pathTenantSlug = localRoot
    ? getLocalTenantSlugFromPathname(pathname)
    : null;
  const effectivePathname = pathTenantSlug
    ? stripLocalTenantPathPrefix(pathname)
    : pathname;
  const selectedLocalTenantSlug = localRoot
    ? pathTenantSlug ??
      request.cookies.get(LOCAL_DEV_TENANT_COOKIE)?.value ??
      null
    : null;
  const isAuthRoute = effectivePathname.startsWith("/login");
  const isProtectedRoute =
    effectivePathname.startsWith("/dashboard") ||
    effectivePathname.startsWith("/admin") ||
    effectivePathname.startsWith("/company");
  const rootDomain = getAppRootDomain();
  const requestCompany =
    localRoot ? null : await resolveCompanyByHostname(request.nextUrl.hostname);
  let profile: SessionProfile | null = null;

  if (localRoot) {
    const localSnapshot = parseLocalDevProfileSnapshot(
      request.cookies.get(LOCAL_DEV_PROFILE_COOKIE)?.value ?? null,
    );

    if (localSnapshot) {
      profile = {
        company_id: localSnapshot.company_id,
        role: localSnapshot.role,
        companies: localSnapshot.company_slug
          ? {
              slug: localSnapshot.company_slug,
              custom_domain: null,
            }
          : null,
      };
    }
  }

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("company_id, role, companies(slug)")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      profile = data;
    }
  } else if (localRoot && !profile) {
    const devUserId = request.cookies.get(LOCAL_DEV_USER_COOKIE)?.value ?? null;

    if (devUserId) {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("company_id, role, companies(slug)")
        .eq("id", devUserId)
        .eq("is_active", true)
        .maybeSingle();

      profile = data ?? null;
    }
  }

  const hasAuthenticatedSession = Boolean(user || profile);

  if (!hasAuthenticatedSession && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    const loginPath =
      localRoot && selectedLocalTenantSlug
        ? prependLocalTenantPathPrefix(selectedLocalTenantSlug, "/login")
        : "/login";
    const nextPath =
      localRoot && selectedLocalTenantSlug
        ? prependLocalTenantPathPrefix(
            selectedLocalTenantSlug,
            effectivePathname,
          )
        : effectivePathname;

    redirectUrl.pathname = loginPath;
    redirectUrl.searchParams.set("next", `${nextPath}${search}`);
    return applyPendingCookies(
      NextResponse.redirect(redirectUrl, 303),
      pendingCookies,
    );
  }

  if (profile) {
    const companySlug = profile.companies?.slug ?? null;
    const companyCustomDomain = profile.companies?.custom_domain ?? null;
    const isPlatformUser = !profile.company_id;
    const isLocalTenantRootPath = localRoot && pathTenantSlug && effectivePathname === "/";
    const shouldGoDashboard =
      isLocalTenantRootPath ||
      effectivePathname === "/" ||
      isAuthRoute ||
      (isPlatformUser && effectivePathname.startsWith("/admin"));
    const targetPath = shouldGoDashboard ? "/dashboard" : effectivePathname;
    const targetSearch = shouldGoDashboard ? "" : search;

    if (localRoot) {
      const canonicalLocalTenantSlug = companySlug ?? null;

      if (canonicalLocalTenantSlug) {
        const canonicalPath = prependLocalTenantPathPrefix(
          canonicalLocalTenantSlug,
          targetPath,
        );

        if (
          pathname !== canonicalPath ||
          search !== targetSearch ||
          selectedLocalTenantSlug !== canonicalLocalTenantSlug
        ) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = canonicalPath;
          redirectUrl.search = targetSearch;

          pendingCookies.push({
            name: LOCAL_DEV_TENANT_COOKIE,
            value: canonicalLocalTenantSlug,
            options: { path: "/" },
          });

          return applyPendingCookies(
            NextResponse.redirect(redirectUrl, 303),
            pendingCookies,
          );
        }
      } else if (pathTenantSlug) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = targetPath;
        redirectUrl.search = targetSearch;
        return applyPendingCookies(
          NextResponse.redirect(redirectUrl, 303),
          pendingCookies,
        );
      }

      if (pathTenantSlug) {
        pendingCookies.push({
          name: LOCAL_DEV_TENANT_COOKIE,
          value: pathTenantSlug,
          options: { path: "/" },
        });

        return applyPendingCookies(
          NextResponse.rewrite(
            new URL(`${effectivePathname}${search}`, request.url),
          ),
          pendingCookies,
        );
      }

      if (canonicalLocalTenantSlug) {
        pendingCookies.push({
          name: LOCAL_DEV_TENANT_COOKIE,
          value: canonicalLocalTenantSlug,
          options: { path: "/" },
        });
      }
    }

    const canonicalHostname =
      localRoot
        ? null
        : companyCustomDomain ??
          (companySlug ? `${companySlug}.${rootDomain}` : null);
    const requestIsTenantHost = Boolean(requestCompany);

    if (canonicalHostname) {
      if (request.nextUrl.hostname !== canonicalHostname) {
        const redirectUrl = buildTenantUrl(
          request.url,
          canonicalHostname,
          targetPath,
          targetSearch,
        );
        redirectUrl.hostname = canonicalHostname;
        return applyPendingCookies(
          NextResponse.redirect(redirectUrl, 303),
          pendingCookies,
        );
      }
    } else if (requestIsTenantHost) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.hostname = getAppRootDomain();
      redirectUrl.pathname = targetPath;
      redirectUrl.search = targetSearch;
      return applyPendingCookies(
        NextResponse.redirect(redirectUrl, 303),
        pendingCookies,
      );
    }

    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = targetPath;
      redirectUrl.search = targetSearch;
      return applyPendingCookies(
        NextResponse.redirect(redirectUrl, 303),
        pendingCookies,
      );
    }
  }

  if (localRoot && pathTenantSlug) {
    return applyPendingCookies(
      NextResponse.rewrite(new URL(`${effectivePathname}${search}`, request.url)),
      pendingCookies,
    );
  }

  return applyPendingCookies(NextResponse.next({ request }), pendingCookies);
}
