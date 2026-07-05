import "server-only";

import { getCurrentProfile } from "@/server/auth/current-user";
import { getDefaultDashboardPath, getLoginPath } from "@/lib/site";
import {
  canAccessCompany,
  hasPermission,
  hasRole,
} from "@/server/auth/permissions";
import type { CurrentProfile } from "@/types/auth";
import type { AppPermission } from "@/types/permission";
import type { AppRole } from "@/types/roles";
import { redirect } from "next/navigation";

export async function requireCurrentProfile(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(getLoginPath());
  }

  return profile;
}

export async function requireRole(roles: AppRole[]) {
  const profile = await requireCurrentProfile();

  if (!hasRole(profile, roles)) {
    redirect(getDefaultDashboardPath());
  }

  return profile;
}

export async function requireCompanyAdmin() {
  const profile = await requireCurrentProfile();

  if (!profile.company_id || !hasPermission(profile, "company.users.manage")) {
    redirect(getDefaultDashboardPath());
  }

  return profile;
}

export async function requirePermission(permission: AppPermission) {
  const profile = await requireCurrentProfile();

  if (!hasPermission(profile, permission)) {
    redirect(getDefaultDashboardPath());
  }

  return profile;
}

export async function requireTdpAdmin() {
  const profile = await requireCurrentProfile();

  if (!profile.is_tdp_admin) {
    redirect(getDefaultDashboardPath());
  }

  return profile;
}

export async function requireCompanyAccess(companyId: string) {
  const profile = await requireCurrentProfile();

  if (!canAccessCompany(profile, companyId)) {
    redirect(getDefaultDashboardPath());
  }

  return profile;
}
