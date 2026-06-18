import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/server/auth/guards";
import type {
  CompanyInput,
  CompanySettingsInput,
} from "@/schemas/company.schema";
import type { Company } from "@/types/company";
import { randomUUID } from "node:crypto";
import { generateUniqueCompanySlug } from "./company-slug";
import { ensureTenantDefaultRoles } from "./roles.dal";

const COMPANY_LOGO_BUCKET = "company-logos";

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

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      rut: input.rut ?? null,
      logo_url: input.logo_url ?? null,
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

  const admin = createSupabaseAdminClient();
  const extension =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${currentProfile.company_id}/${randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(COMPANY_LOGO_BUCKET)
    .upload(path, body, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = admin.storage.from(COMPANY_LOGO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
