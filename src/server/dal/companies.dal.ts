import "server-only";

import { uploadFileToStorage } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/server/auth/guards";
import type { CompanyInput, CompanySettingsInput } from "@/schemas/company.schema";
import type { Company } from "@/types/company";
import { generateUniqueCompanySlug } from "./company-slug";
import { ensureTenantDefaultRoles } from "./roles.dal";

export async function listCompaniesForPlatformAdmin(): Promise<Company[]> {
  await requirePermission("companies.read");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createCompanyForPlatformAdmin(input: CompanyInput) {
  await requirePermission("companies.manage");

  const supabase = await createServerSupabaseClient();
  const slug = await generateUniqueCompanySlug(input.name);
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      slug,
      is_active: input.is_active,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await ensureTenantDefaultRoles(data.id);

  return data;
}

export async function updateCompanySettingsForCurrentCompanyAdmin(
  input: CompanySettingsInput,
) {
  const currentProfile = await requirePermission("company.users.manage");

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      rut: input.rut ?? null,
      logo_url: input.logo_url ?? null,
      button_background_color: input.button_background_color,
      button_text_color: input.button_text_color,
      tab_background_color: input.tab_background_color,
      tab_text_color: input.tab_text_color,
      tab_active_background_color: input.tab_active_background_color,
      tab_active_text_color: input.tab_active_text_color,
      popup_background_color: input.popup_background_color,
      popup_text_color: input.popup_text_color,
      sidebar_bg_color: input.sidebar_bg_color,
      sidebar_text_color: input.sidebar_text_color,
      sidebar_active_bg_color: input.sidebar_active_bg_color,
      sidebar_active_text_color: input.sidebar_active_text_color,
      platform_background_color: input.platform_background_color,
    })
    .eq("id", currentProfile.company_id);

  if (error) {
    throw new Error(error.message);
  }

  const { data, error: fetchError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", currentProfile.company_id)
    .single();

  if (fetchError || !data) {
    throw new Error(fetchError?.message ?? "No se pudo actualizar la empresa.");
  }

  return data;
}

export async function uploadCompanyLogoForCurrentCompanyAdmin(file: File) {
  const currentProfile = await requirePermission("company.users.manage");

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const uploaded = await uploadFileToStorage(
    file,
    `${currentProfile.company_id}/company-logo`,
  );

  if (!uploaded.url) {
    throw new Error("No se pudo resolver la URL publica del logo.");
  }

  return uploaded.url;
}
