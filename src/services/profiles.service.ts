import "server-only";

import {
  createCompanyUserForCompanyAdmin,
  createCompanyUserForPlatformAdmin,
  listProfilesForCompanyAdmin,
  listProfilesForPlatformAdmin,
  updateManagedUserForCompanyAdmin,
  updateManagedUserForPlatformAdmin,
  updateUserTemporaryPasswordForPlatformAdmin,
} from "@/server/dal/profiles.dal";
import type {
  CreateManagedCompanyUserInput,
  CreateCompanyUserInput,
  UpdateManagedUserInput,
  UpdateUserTemporaryPasswordInput,
} from "@/schemas/profile.schema";

export async function listProfiles() {
  return listProfilesForPlatformAdmin();
}

export async function createCompanyUser(input: CreateCompanyUserInput) {
  return createCompanyUserForPlatformAdmin(input);
}

export async function updateUserTemporaryPassword(
  input: UpdateUserTemporaryPasswordInput,
) {
  return updateUserTemporaryPasswordForPlatformAdmin(input);
}

export async function listCompanyProfiles() {
  return listProfilesForCompanyAdmin();
}

export async function createManagedCompanyUser(
  input: CreateManagedCompanyUserInput,
) {
  return createCompanyUserForCompanyAdmin(input);
}

export async function updateManagedPlatformUser(input: UpdateManagedUserInput) {
  return updateManagedUserForPlatformAdmin(input);
}

export async function updateManagedCompanyUser(input: UpdateManagedUserInput) {
  return updateManagedUserForCompanyAdmin(input);
}
