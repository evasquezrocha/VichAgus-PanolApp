import "server-only";

import {
  getPdfLayoutTemplateByKeyForCurrentProfile,
  listPdfLayoutTemplatesForCurrentCompanyAdmin,
  updatePdfLayoutTemplateForCurrentCompanyAdmin,
} from "@/server/dal/pdf-layouts.dal";
import type { PdfLayoutTemplateInput } from "@/schemas/pdf-layout.schema";

export async function listPdfLayoutTemplates() {
  return listPdfLayoutTemplatesForCurrentCompanyAdmin();
}

export async function getPdfLayoutTemplateByKey(templateKey: string) {
  return getPdfLayoutTemplateByKeyForCurrentProfile(templateKey);
}

export async function updatePdfLayoutTemplate(input: PdfLayoutTemplateInput) {
  return updatePdfLayoutTemplateForCurrentCompanyAdmin(input);
}
