import "server-only";

import type { AppPermission } from "@/types/permission";
import type { CurrentProfile } from "@/types/auth";
import type { AppRole } from "@/types/roles";

export function hasRole(profile: CurrentProfile, roles: AppRole[]) {
  return roles.some((role) => role === profile.role);
}

export function hasPermission(
  profile: CurrentProfile,
  permission: AppPermission,
) {
  if (profile.role === "super_admin") {
    return true;
  }

  return profile.permissions.includes(permission);
}

export function isSuperAdmin(profile: CurrentProfile) {
  return hasPermission(profile, "platform.manage");
}

export function isCompanyAdmin(profile: CurrentProfile) {
  return hasPermission(profile, "company.users.manage");
}

export function canAccessCompany(profile: CurrentProfile, companyId: string) {
  return isSuperAdmin(profile) || profile.company_id === companyId;
}
