import "server-only";

import { getCurrentProfile } from "@/server/auth/current-user";
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
    redirect("/login");
  }

  return profile;
}

export async function requireRole(roles: AppRole[]) {
  const profile = await requireCurrentProfile();

  if (!hasRole(profile, roles)) {
    redirect("/dashboard");
  }

  return profile;
}

export async function requireCompanyAdmin() {
  const profile = await requireCurrentProfile();

  if (!profile.company_id || !hasPermission(profile, "company.users.manage")) {
    redirect("/dashboard");
  }

  return profile;
}

export async function requirePermission(permission: AppPermission) {
  const profile = await requireCurrentProfile();

  if (!hasPermission(profile, permission)) {
    redirect("/dashboard");
  }

  return profile;
}

export async function requireCompanyAccess(companyId: string) {
  const profile = await requireCurrentProfile();

  if (!canAccessCompany(profile, companyId)) {
    redirect("/dashboard");
  }

  return profile;
}
