import "server-only";

import { isTdpSite } from "@/lib/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CurrentProfile } from "@/types/auth";
import type { AppPermission } from "@/types/permission";
import { unstable_noStore as noStore } from "next/cache";
import type { User } from "@supabase/supabase-js";

type CurrentProfileRow = {
  id: string;
  company_id: string | null;
  role_id: string | null;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  companies: {
    name: string;
    rut: string | null;
    logo_url: string | null;
    button_background_color: string | null;
    button_text_color: string | null;
    tab_background_color: string | null;
    tab_text_color: string | null;
    tab_active_background_color: string | null;
    tab_active_text_color: string | null;
    popup_background_color: string | null;
    popup_text_color: string | null;
    sidebar_bg_color: string | null;
    sidebar_text_color: string | null;
    sidebar_active_bg_color: string | null;
    sidebar_active_text_color: string | null;
    platform_background_color: string | null;
  } | null;
  app_roles: {
    name: string;
    permissions: string[];
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

function buildTdpCurrentProfile(user: User): CurrentProfile {
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email ||
    null;

  return {
    id: user.id,
    company_id: null,
    role_id: null,
    full_name: fullName,
    email: user.email ?? "",
    role: "tdp_user",
    is_active: true,
    company_name: null,
    company_rut: null,
    company_logo_url: null,
    company_button_background_color: null,
    company_button_text_color: null,
    company_tab_background_color: null,
    company_tab_text_color: null,
    company_tab_active_background_color: null,
    company_tab_active_text_color: null,
    company_popup_background_color: null,
    company_popup_text_color: null,
    company_sidebar_bg_color: null,
    company_sidebar_text_color: null,
    company_sidebar_active_bg_color: null,
    company_sidebar_active_text_color: null,
    company_platform_background_color: null,
    role_name: "Usuario TDP",
    permissions: [],
  };
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  if (isTdpSite()) {
    return buildTdpCurrentProfile(user);
  }

  const readProfile = async (selectClause: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(selectClause)
      .eq("id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as CurrentProfileRow;
  };

  const data =
    (await readProfile(
      "id, company_id, role_id, full_name, email, role, is_active, companies(name, rut, logo_url, button_background_color, button_text_color, tab_background_color, tab_text_color, tab_active_background_color, tab_active_text_color, popup_background_color, popup_text_color, sidebar_bg_color, sidebar_text_color, sidebar_active_bg_color, sidebar_active_text_color, platform_background_color)",
    )) ??
    (await readProfile(
      "id, company_id, role_id, full_name, email, role, is_active, companies(name, rut, logo_url, popup_background_color, popup_text_color, sidebar_bg_color, sidebar_text_color, sidebar_active_bg_color, sidebar_active_text_color, platform_background_color)",
    ));

  if (!data) {
    return null;
  }

  const { companies, ...profile } = data as Omit<CurrentProfileRow, "app_roles">;

  let roleName: string | null = LEGACY_ROLE_NAMES[profile.role] ?? profile.role;
  let permissions: AppPermission[] = LEGACY_ROLE_PERMISSIONS[profile.role] ?? [];

  if (profile.role_id) {
    const { data: roleData } = await supabase
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
    company_name: companies?.name ?? null,
    company_rut: companies?.rut ?? null,
    company_logo_url: companies?.logo_url ?? null,
    company_button_background_color:
      companies?.button_background_color ?? null,
    company_button_text_color: companies?.button_text_color ?? null,
    company_tab_background_color: companies?.tab_background_color ?? null,
    company_tab_text_color: companies?.tab_text_color ?? null,
    company_tab_active_background_color:
      companies?.tab_active_background_color ?? null,
    company_tab_active_text_color: companies?.tab_active_text_color ?? null,
    company_popup_background_color: companies?.popup_background_color ?? null,
    company_popup_text_color: companies?.popup_text_color ?? null,
    company_sidebar_bg_color: companies?.sidebar_bg_color ?? null,
    company_sidebar_text_color: companies?.sidebar_text_color ?? null,
    company_sidebar_active_bg_color: companies?.sidebar_active_bg_color ?? null,
    company_sidebar_active_text_color: companies?.sidebar_active_text_color ?? null,
    company_platform_background_color:
      companies?.platform_background_color ?? null,
    role_name: roleName,
    permissions,
  };
}
