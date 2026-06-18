import "server-only";

import {
  createCompanyRoleForCompanyAdmin,
  createGlobalRoleForPlatformAdmin,
  listAssignableRolesForCompanyAdmin,
  listAssignableRolesForPlatformAdmin,
  listCompanyRolesForCompanyAdmin,
  listGlobalRolesForPlatformAdmin,
  updateCompanyRoleForCompanyAdmin,
  updateGlobalRoleForPlatformAdmin,
} from "@/server/dal/roles.dal";
import type { RoleInput, UpdateRoleInput } from "@/schemas/role.schema";

export async function listGlobalRoles() {
  return listGlobalRolesForPlatformAdmin();
}

export async function listPlatformAssignableRoles() {
  return listAssignableRolesForPlatformAdmin();
}

export async function listCompanyAssignableRoles() {
  return listAssignableRolesForCompanyAdmin();
}

export async function createGlobalRole(input: RoleInput) {
  return createGlobalRoleForPlatformAdmin(input);
}

export async function updateGlobalRole(input: UpdateRoleInput) {
  return updateGlobalRoleForPlatformAdmin(input);
}

export async function listCompanyRoles() {
  return listCompanyRolesForCompanyAdmin();
}

export async function createCompanyRole(input: RoleInput) {
  return createCompanyRoleForCompanyAdmin(input);
}

export async function updateCompanyRole(input: UpdateRoleInput) {
  return updateCompanyRoleForCompanyAdmin(input);
}
