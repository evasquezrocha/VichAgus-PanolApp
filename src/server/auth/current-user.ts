import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getLocalDevRoleName,
  getLocalDevRolePermissions,
  isLocalDevelopmentRoot,
  LOCAL_DEV_PROFILE_COOKIE,
  LOCAL_DEV_USER_COOKIE,
  parseLocalDevProfileSnapshot,
} from "@/lib/tenant";
import type { CurrentProfile } from "@/types/auth";
import type { AppPermission } from "@/types/permission";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

type CurrentProfileRow = {
  id: string;
  company_id: string | null;
  role_id: string | null;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  companies: {
    slug: string;
    custom_domain: string | null;
    name: string;
    rut: string | null;
    logo_url: string | null;
    sidebar_bg_color: string | null;
    sidebar_text_color: string | null;
    sidebar_active_bg_color: string | null;
    sidebar_active_text_color: string | null;
    platform_background_color: string | null;
    popup_bg_color: string | null;
    popup_text_color: string | null;
  } | null;
  app_roles: {
    name: string;
    permissions: string[] | null;
  } | null;
};

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

function mergePermissions(
  basePermissions: AppPermission[],
  extraPermissions: AppPermission[],
) {
  return Array.from(new Set([...basePermissions, ...extraPermissions]));
}

async function resolveCurrentProfile(
  client: Awaited<ReturnType<typeof createServerSupabaseClient>> | ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
): Promise<CurrentProfile | null> {
  const readProfile = async (selectClause: string) => {
    const { data, error } = await client
      .from("profiles")
      .select(selectClause)
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as CurrentProfileRow;
  };

  const data =
    (await readProfile(
      "id, company_id, role_id, full_name, email, role, is_active, companies(slug, name, rut, logo_url, sidebar_bg_color, sidebar_text_color, sidebar_active_bg_color, sidebar_active_text_color, platform_background_color, popup_bg_color, popup_text_color)",
    )) ??
    (await readProfile(
      "id, company_id, role_id, full_name, email, role, is_active, companies(slug, name)",
    ));

  if (!data) {
    return null;
  }

  const { companies, ...profile } = data as Omit<CurrentProfileRow, "app_roles">;

  let roleName: string | null = LEGACY_ROLE_NAMES[profile.role] ?? profile.role;
  let permissions: AppPermission[] = LEGACY_ROLE_PERMISSIONS[profile.role] ?? [];

  if (profile.role_id) {
    const { data: roleData } = await client
      .from("app_roles")
      .select("name, permissions")
      .eq("id", profile.role_id)
      .single();

    if (roleData) {
      roleName = roleData.name;
      permissions = mergePermissions(
        LEGACY_ROLE_PERMISSIONS[profile.role] ?? [],
        (roleData.permissions ?? []) as AppPermission[],
      );
    }
  }

  return {
    ...profile,
    company_slug: companies?.slug ?? null,
    company_custom_domain: null,
    company_name: companies?.name ?? null,
    company_rut: companies?.rut ?? null,
    company_logo_url: companies?.logo_url ?? null,
    company_sidebar_bg_color: companies?.sidebar_bg_color ?? null,
    company_sidebar_text_color: companies?.sidebar_text_color ?? null,
    company_sidebar_active_bg_color: companies?.sidebar_active_bg_color ?? null,
    company_sidebar_active_text_color: companies?.sidebar_active_text_color ?? null,
    company_platform_background_color:
      companies?.platform_background_color ?? null,
    company_popup_bg_color: companies?.popup_bg_color ?? null,
    company_popup_text_color: companies?.popup_text_color ?? null,
    role_name: roleName,
    permissions,
  };
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const cookieStore = await cookies();
  const localRoot = isLocalDevelopmentRoot();
  const devUserId = localRoot
    ? cookieStore.get(LOCAL_DEV_USER_COOKIE)?.value ?? null
    : null;
  const localSnapshot = localRoot
    ? parseLocalDevProfileSnapshot(
        cookieStore.get(LOCAL_DEV_PROFILE_COOKIE)?.value ?? null,
      )
    : null;

  if (localSnapshot) {
    const liveCompany =
      localSnapshot.company_id && localSnapshot.role !== "super_admin"
        ? await createSupabaseAdminClient()
            .from("companies")
            .select(
              "id, name, rut, logo_url, sidebar_bg_color, sidebar_text_color, sidebar_active_bg_color, sidebar_active_text_color, platform_background_color, popup_bg_color, popup_text_color",
            )
            .eq("id", localSnapshot.company_id)
            .maybeSingle()
        : null;
    const companyData = liveCompany?.data ?? null;

    return {
      id: localSnapshot.id,
      company_id: localSnapshot.company_id,
      role_id: localSnapshot.role_id,
      email: localSnapshot.email,
      full_name: localSnapshot.full_name,
      role: localSnapshot.role,
      is_active: true,
      company_slug: localSnapshot.company_slug,
      company_custom_domain: null,
      company_name: companyData?.name ?? localSnapshot.company_name,
      company_rut: companyData?.rut ?? null,
      company_logo_url: companyData?.logo_url ?? null,
      company_sidebar_bg_color: companyData?.sidebar_bg_color ?? null,
      company_sidebar_text_color: companyData?.sidebar_text_color ?? null,
      company_sidebar_active_bg_color:
        companyData?.sidebar_active_bg_color ?? null,
      company_sidebar_active_text_color:
        companyData?.sidebar_active_text_color ?? null,
      company_platform_background_color:
        companyData?.platform_background_color ?? null,
      company_popup_bg_color: companyData?.popup_bg_color ?? null,
      company_popup_text_color: companyData?.popup_text_color ?? null,
      role_name: localSnapshot.role_name ?? getLocalDevRoleName(localSnapshot.role),
      permissions:
        localSnapshot.permissions.length > 0
          ? (localSnapshot.permissions as AppPermission[])
          : getLocalDevRolePermissions(localSnapshot.role),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (localRoot && devUserId) {
      return resolveCurrentProfile(createSupabaseAdminClient(), devUserId);
    }

    return null;
  }

  const profile = await resolveCurrentProfile(supabase, user.id);

  if (profile) {
    return profile;
  }

  if (localRoot && devUserId) {
    return resolveCurrentProfile(createSupabaseAdminClient(), devUserId);
  }

  return null;
}
