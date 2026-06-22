"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { createDefaultPdfLayoutCanvas } from "@/lib/pdf-layouts";
import { pdfLayoutConfigSchema, pdfLayoutTemplateInputSchema } from "@/schemas/pdf-layout.schema";
import type { PdfLayoutConfig, PdfLayoutSectionKey } from "@/types/pdf-layouts";
import { updatePdfLayoutTemplate } from "@/services/pdf-layouts.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getCheckboxValue(formData: FormData, name: string) {
  return formData.get(name) === "true";
}

function getTextValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function parseSectionOrder(formData: FormData): PdfLayoutSectionKey[] {
  const rawOrder = String(formData.get("section_order") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowedKeys: PdfLayoutSectionKey[] = [
    "header",
    "summary",
    "items",
    "signature",
    "metadata",
  ];

  const parsedOrder = rawOrder.filter((value): value is PdfLayoutSectionKey =>
    allowedKeys.includes(value as PdfLayoutSectionKey),
  );

  return parsedOrder.length > 0 ? parsedOrder : allowedKeys;
}

function parseSectionVisibility(formData: FormData): PdfLayoutConfig["sections"] {
  return {
    header: getCheckboxValue(formData, "section_header"),
    summary: getCheckboxValue(formData, "section_summary"),
    items: getCheckboxValue(formData, "section_items"),
    signature: getCheckboxValue(formData, "section_signature"),
    metadata: getCheckboxValue(formData, "section_metadata"),
  };
}

function getSectionInputsPresent(formData: FormData) {
  return [
    "section_header",
    "section_summary",
    "section_items",
    "section_signature",
    "section_metadata",
  ].some((name) => formData.has(name));
}

function buildFallbackLayoutConfig(formData: FormData): PdfLayoutConfig {
  const pageSize = String(formData.get("page_size") ?? "A4") as PdfLayoutConfig["page_size"];
  const orientation = String(formData.get("orientation") ?? "portrait") as PdfLayoutConfig["orientation"];

  return {
    title: getTextValue(formData, "layout_title") || "Detalle de traspaso",
    subtitle: getTextValue(formData, "layout_subtitle") || null,
    page_size: pageSize,
    orientation,
    show_header: getCheckboxValue(formData, "show_header"),
    section_order: parseSectionOrder(formData),
    sections: {
      header: getCheckboxValue(formData, "section_header"),
      summary: getCheckboxValue(formData, "section_summary"),
      items: getCheckboxValue(formData, "section_items"),
      signature: getCheckboxValue(formData, "section_signature"),
      metadata: getCheckboxValue(formData, "section_metadata"),
    },
    field_labels: {
      origin: getTextValue(formData, "label_origin") || undefined,
      destination: getTextValue(formData, "label_destination") || undefined,
      date: getTextValue(formData, "label_date") || undefined,
      registered_by: getTextValue(formData, "label_registered_by") || undefined,
    },
    canvas: createDefaultPdfLayoutCanvas(pageSize, orientation),
  };
}

export async function updatePdfLayoutTemplateAction(formData: FormData) {
  const returnTo = "/company/settings/edicion-de-layouts";
  const templateKey = getTextValue(formData, "template_key");

  try {
    const rawLayoutConfig = String(formData.get("layout_config_json") ?? "").trim();
    const parsedLayoutConfig = rawLayoutConfig
      ? pdfLayoutConfigSchema.parse(JSON.parse(rawLayoutConfig))
      : buildFallbackLayoutConfig(formData);
    const hasSectionInputs = getSectionInputsPresent(formData);
    const sectionOrder = hasSectionInputs
      ? parseSectionOrder(formData)
      : parsedLayoutConfig.section_order;
    const sections = hasSectionInputs
      ? parseSectionVisibility(formData)
      : parsedLayoutConfig.sections;

    const parsed = pdfLayoutTemplateInputSchema.parse({
      template_id: formData.get("template_id"),
      template_key: templateKey,
      name: formData.get("name"),
      description: getTextValue(formData, "description") || null,
      target_path: formData.get("target_path"),
      is_active: getCheckboxValue(formData, "is_active"),
      layout_config: {
        ...parsedLayoutConfig,
        section_order: sectionOrder,
        sections,
      },
    });

    await updatePdfLayoutTemplate(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        `${returnTo}?layout=${encodeURIComponent(templateKey || "transfer-detail")}`,
        "error",
        getActionErrorMessage(error, "No se pudo guardar el layout."),
      ),
    );
  }

  revalidatePath("/company/settings/edicion-de-layouts");
  revalidatePath("/company/panol/traspasos");
  redirect(
    buildFlashPath(
      `${returnTo}?layout=${encodeURIComponent(templateKey || "transfer-detail")}`,
      "success",
      "Layout actualizado correctamente.",
    ),
  );
}
