import "server-only";

import {
  createCompanyForPlatformAdmin,
  listCompaniesForPlatformAdmin,
  uploadCompanyLogoForCurrentCompanyAdmin,
  updateCompanyForPlatformAdmin,
  updateCompanySettingsForCurrentCompanyAdmin,
} from "@/server/dal/companies.dal";
import type {
  CompanyAdminUpdateInput,
  CompanyInput,
  CompanySettingsInput,
} from "@/schemas/company.schema";

export async function listCompanies() {
  return listCompaniesForPlatformAdmin();
}

export async function createCompany(input: CompanyInput) {
  return createCompanyForPlatformAdmin(input);
}

export async function updateCompany(input: CompanyAdminUpdateInput) {
  return updateCompanyForPlatformAdmin(input);
}

export async function updateCompanySettings(input: CompanySettingsInput) {
  return updateCompanySettingsForCurrentCompanyAdmin(input);
}

export async function uploadCompanyLogo(file: File) {
  return uploadCompanyLogoForCurrentCompanyAdmin(file);
}
