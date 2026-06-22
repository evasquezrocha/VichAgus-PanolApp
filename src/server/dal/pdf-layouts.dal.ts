import "server-only";

import { createDefaultPdfLayoutConfig, normalizePdfLayoutConfig } from "@/lib/pdf-layouts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentProfile, requireCompanyAdmin } from "@/server/auth/guards";
import type { PdfLayoutConfigInput, PdfLayoutTemplateInput } from "@/schemas/pdf-layout.schema";
import type { PdfLayoutConfig, PdfLayoutTemplate } from "@/types/pdf-layouts";

const DEFAULT_PDF_LAYOUT_TEMPLATES = [
  {
    template_key: "transfer-detail",
    name: "Detalle de Traspaso",
    description: "Plantilla principal usada en la vista imprimible del traspaso.",
    target_path: "/company/panol/traspasos/[transferId]/pdf",
    layout_config: createDefaultPdfLayoutConfig(),
  },
] as const;

async function getCurrentCompanyIdForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

async function getCurrentCompanyIdForCurrentProfile() {
  const currentProfile = await requireCurrentProfile();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

function mapLayoutTemplate(template: {
  id: string;
  company_id: string;
  template_key: string;
  name: string;
  description: string | null;
  target_path: string;
  layout_config: PdfLayoutConfig | PdfLayoutConfigInput;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}): PdfLayoutTemplate {
  return {
    ...template,
    layout_config: normalizePdfLayoutConfig(template.layout_config),
  };
}

async function ensureDefaultTemplates(companyId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: existingTemplates, error: existingError } = await supabase
    .from("pdf_layout_templates")
    .select("template_key")
    .eq("company_id", companyId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingKeys = new Set((existingTemplates ?? []).map((template) => template.template_key));
  const missingTemplates = DEFAULT_PDF_LAYOUT_TEMPLATES.filter(
    (template) => !existingKeys.has(template.template_key),
  );

  if (missingTemplates.length > 0) {
    const { error } = await supabase.from("pdf_layout_templates").insert(
      missingTemplates.map((template) => ({
        company_id: companyId,
        template_key: template.template_key,
        name: template.name,
        description: template.description,
        target_path: template.target_path,
        layout_config: template.layout_config,
        is_active: true,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function listPdfLayoutTemplatesForCurrentCompanyAdmin(): Promise<PdfLayoutTemplate[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  await ensureDefaultTemplates(companyId);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pdf_layout_templates")
    .select("id, company_id, template_key, name, description, target_path, layout_config, is_active, created_at, updated_at")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((template) => mapLayoutTemplate(template as PdfLayoutTemplate));
}

export async function getPdfLayoutTemplateByKeyForCurrentProfile(
  templateKey: string,
): Promise<PdfLayoutTemplate | null> {
  const companyId = await getCurrentCompanyIdForCurrentProfile();
  await ensureDefaultTemplates(companyId);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pdf_layout_templates")
    .select("id, company_id, template_key, name, description, target_path, layout_config, is_active, created_at, updated_at")
    .eq("company_id", companyId)
    .eq("template_key", templateKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapLayoutTemplate(data as PdfLayoutTemplate) : null;
}

export async function updatePdfLayoutTemplateForCurrentCompanyAdmin(
  input: PdfLayoutTemplateInput,
): Promise<PdfLayoutTemplate> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: currentTemplate, error: currentError } = await supabase
    .from("pdf_layout_templates")
    .select("id, company_id")
    .eq("id", input.template_id)
    .eq("company_id", companyId)
    .single();

  if (currentError || !currentTemplate) {
    throw new Error("Layout template does not belong to your company.");
  }

  const { data, error } = await supabase
    .from("pdf_layout_templates")
    .update({
      template_key: input.template_key,
      name: input.name,
      description: input.description,
      target_path: input.target_path,
      layout_config: input.layout_config,
      is_active: input.is_active,
    })
    .eq("id", input.template_id)
    .eq("company_id", companyId)
    .select("id, company_id, template_key, name, description, target_path, layout_config, is_active, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapLayoutTemplate(data as PdfLayoutTemplate);
}
