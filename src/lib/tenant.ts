import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppPermission } from "@/types/permission";

export const LOCAL_DEV_USER_COOKIE = "panolapp_dev_user_id";
export const LOCAL_DEV_TENANT_COOKIE = "panolapp_dev_tenant";
export const LOCAL_DEV_PROFILE_COOKIE = "panolapp_dev_profile";

const LEGACY_ROLE_PERMISSIONS: Record<string, AppPermission[]> = {
  super_admin: [
    "platform.access",
    "platform.manage",
    "companies.read",
    "companies.manage",
    "users.read.global",
    "users.manage.global",
    "roles.read.global",
    "roles.manage.global",
    "company.access",
    "company.users.read",
    "company.users.manage",
    "company.roles.read",
    "company.roles.manage",
  ],
  company_admin: [
    "company.access",
    "company.users.read",
    "company.users.manage",
    "company.roles.read",
    "company.roles.manage",
  ],
  company_user: ["company.access"],
};

const LEGACY_ROLE_NAMES: Record<string, string> = {
  super_admin: "Super Admin",
  company_admin: "Company Admin",
  company_user: "Company User",
};

export function getAppRootDomain() {
  return normalizeHostname(process.env.APP_ROOT_DOMAIN ?? "localhost");
}

export function getAuthCookieDomain() {
  const rootDomain = getAppRootDomain();

  if (isLocalDevelopmentRoot()) {
    return undefined;
  }

  return rootDomain.startsWith(".") ? rootDomain : `.${rootDomain}`;
}

export function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export function isLocalDevelopmentRoot() {
  const rootDomain = getAppRootDomain();

  return rootDomain === "localhost" || rootDomain.endsWith(".localhost");
}

export function getTenantSlugFromHostname(hostname: string) {
  const normalizedHost = normalizeHostname(hostname);
  const rootDomain = getAppRootDomain();

  if (
    !normalizedHost ||
    normalizedHost === rootDomain ||
    normalizedHost === `www.${rootDomain}`
  ) {
    return null;
  }

  const tenantSuffix = `.${rootDomain}`;

  if (!normalizedHost.endsWith(tenantSuffix)) {
    return null;
  }

  const tenantSlug = normalizedHost.slice(0, -tenantSuffix.length);

  if (!tenantSlug || tenantSlug.includes(".")) {
    return null;
  }

  return tenantSlug;
}

export function getTenantHostname(tenantSlug: string) {
  return `${normalizeHostname(tenantSlug)}.${getAppRootDomain()}`;
}

export function getLocalTenantPathPrefix(tenantSlug: string) {
  return `/t/${normalizeHostname(tenantSlug)}`;
}

export function getLocalTenantSlugFromPathname(pathname: string) {
  const normalizedPath = pathname.trim().toLowerCase();
  const match = normalizedPath.match(/^\/t\/([a-z0-9]+(?:-[a-z0-9]+)*)($|\/)/);

  return match?.[1] ?? null;
}

export function stripLocalTenantPathPrefix(pathname: string) {
  const tenantSlug = getLocalTenantSlugFromPathname(pathname);

  if (!tenantSlug) {
    return pathname;
  }

  const prefix = getLocalTenantPathPrefix(tenantSlug);
  const strippedPath = pathname.slice(prefix.length);

  return strippedPath.length > 0 ? strippedPath : "/";
}

export function prependLocalTenantPathPrefix(
  tenantSlug: string,
  pathname: string,
) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getLocalTenantPathPrefix(tenantSlug)}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export type LocalDevProfileSnapshot = {
  id: string;
  company_id: string | null;
  role_id: string | null;
  full_name: string | null;
  email: string;
  role: string;
  company_slug: string | null;
  company_custom_domain: string | null;
  company_name: string | null;
  role_name: string | null;
  permissions: string[];
};

export function getLocalDevRolePermissions(role: string): AppPermission[] {
  return LEGACY_ROLE_PERMISSIONS[role] ?? [];
}

export function getLocalDevRoleName(role: string) {
  return LEGACY_ROLE_NAMES[role] ?? role;
}

export function serializeLocalDevProfileSnapshot(
  snapshot: LocalDevProfileSnapshot,
) {
  return encodeURIComponent(JSON.stringify(snapshot));
}

export function parseLocalDevProfileSnapshot(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<LocalDevProfileSnapshot> & {
      permissions?: unknown;
    };

    if (!parsed.id || !parsed.email || !parsed.role) {
      return null;
    }

    const permissions = Array.isArray(parsed.permissions)
      ? parsed.permissions.filter((permission): permission is AppPermission =>
          typeof permission === "string",
        )
      : getLocalDevRolePermissions(parsed.role);

    return {
      id: parsed.id,
      company_id: parsed.company_id ?? null,
      role_id: parsed.role_id ?? null,
      full_name: parsed.full_name ?? null,
      email: parsed.email,
      role: parsed.role,
      company_slug: parsed.company_slug ?? null,
      company_custom_domain: parsed.company_custom_domain ?? null,
      company_name: parsed.company_name ?? null,
      role_name: parsed.role_name ?? getLocalDevRoleName(parsed.role),
      permissions,
    };
  } catch {
    return null;
  }
}

export function buildTenantUrl(
  requestUrl: string | URL,
  hostname: string,
  pathname = "/",
  search = "",
) {
  const url = new URL(requestUrl);
  if (isLocalDevelopmentRoot()) {
    url.hostname = normalizeHostname(url.hostname);
    url.pathname = prependLocalTenantPathPrefix(hostname, pathname);
    url.search = search;
    url.hash = "";
    return url;
  }

  url.hostname = normalizeHostname(hostname);
  url.pathname = pathname;
  url.search = search;
  url.hash = "";
  return url;
}

type TenantCompany = {
  slug: string;
  custom_domain: string | null;
  is_active: boolean;
};

export type CompanyTenantRecord = TenantCompany;

export function getCompanyHostname(company: {
  slug: string;
  custom_domain: string | null;
}) {
  return normalizeHostname(
    company.custom_domain ?? `${company.slug}.${getAppRootDomain()}`,
  );
}

export function getCompanyPublicUrl(company: {
  slug: string;
  custom_domain: string | null;
}) {
  if (isLocalDevelopmentRoot()) {
    return `${getLocalTenantPathPrefix(company.slug)}/dashboard`;
  }

  const hostname = getCompanyHostname(company);
  const protocol =
    hostname === "localhost" || hostname.endsWith(".localhost")
      ? "http"
      : "https";

  return `${protocol}://${hostname}`;
}

export function getCompanyResolutionLabel(company: {
  slug: string;
  custom_domain: string | null;
}) {
  return company.custom_domain ? "Dominio propio" : "Subdominio";
}

export async function resolveCompanyByHostname(hostname: string) {
  const normalizedHost = normalizeHostname(hostname);
  const rootDomain = getAppRootDomain();

  if (
    !normalizedHost ||
    normalizedHost === rootDomain ||
    normalizedHost === `www.${rootDomain}`
  ) {
    return null;
  }

  const admin = createSupabaseAdminClient();

  if (normalizedHost.endsWith(`.${rootDomain}`)) {
    const slug = normalizedHost.slice(0, -(`.${rootDomain}`.length));

    if (!slug || slug.includes(".")) {
      return null;
    }

    const { data, error } = await admin
      .from("companies")
      .select("slug, is_active")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return null;
    }

    return data as TenantCompany;
  }

  return null;
}
