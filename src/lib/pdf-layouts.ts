import { pdfLayoutConfigSchema } from "@/schemas/pdf-layout.schema";
import type {
  PdfLayoutCanvasConfig,
  PdfLayoutConfig,
  PdfLayoutFieldKey,
  PdfLayoutImageSourceKey,
  PdfLayoutOrientation,
  PdfLayoutPageSize,
} from "@/types/pdf-layouts";

export type PdfLayoutRuntimeFieldValues = Record<PdfLayoutFieldKey, string>;

export type PdfLayoutRuntimeItem = {
  code: string;
  description: string;
  quantity: number;
};

export type PdfLayoutRuntimeContext = {
  fieldValues: PdfLayoutRuntimeFieldValues;
  imageValues?: Partial<Record<PdfLayoutImageSourceKey, string | null>>;
  items: PdfLayoutRuntimeItem[];
  signatureData?: string | null;
};

export const DEFAULT_PDF_LAYOUT_FIELD_LABELS = {
  origin: "Origen",
  destination: "Destino",
  date: "Fecha",
  registered_by: "Registrado por",
};

export function getPdfLayoutPageDimensions(
  pageSize: PdfLayoutPageSize,
  orientation: PdfLayoutOrientation,
) {
  const sizes: Record<PdfLayoutPageSize, { widthMm: number; heightMm: number }> = {
    A4: { widthMm: 210, heightMm: 297 },
    Letter: { widthMm: 215.9, heightMm: 279.4 },
  };

  const base = sizes[pageSize];
  return orientation === "portrait"
    ? base
    : { widthMm: base.heightMm, heightMm: base.widthMm };
}

function mm(value: number) {
  return Math.round(value * 10) / 10;
}

function createDefaultCanvasElements(widthMm: number, heightMm: number) {
  const marginX = mm(widthMm * 0.085);
  const marginTop = mm(heightMm * 0.05);
  const gap = mm(widthMm * 0.02);
  const labelHeight = mm(heightMm * 0.06);
  const fieldHeight = mm(heightMm * 0.07);
  const fieldWidth = mm((widthMm - marginX * 2 - gap) / 2);
  const wideFieldWidth = mm(widthMm - marginX * 2);
  const itemListTop = mm(heightMm * 0.29);
  const bottomTop = mm(heightMm * 0.64);
  const bottomHeight = mm(heightMm * 0.24);
  const rightColumnX = mm(widthMm * 0.58);

  return [
    {
      id: "canvas-title",
      kind: "text" as const,
      x: marginX,
      y: marginTop,
      width: wideFieldWidth,
      height: mm(heightMm * 0.05),
      zIndex: 10,
      text: "Detalle de traspaso",
      fontSize: 18,
      fontWeight: 800 as const,
      color: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: null,
      borderColor: null,
      borderWidth: 0,
      radius: 0,
      padding: 0,
    },
    {
      id: "canvas-subtitle",
      kind: "text" as const,
      x: marginX,
      y: mm(marginTop + 10),
      width: wideFieldWidth,
      height: labelHeight,
      zIndex: 9,
      text: "Formato compacto para guardar o imprimir.",
      fontSize: 9,
      fontWeight: 500 as const,
      color: "#6b7280",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: null,
      borderColor: null,
      borderWidth: 0,
      radius: 0,
      padding: 0,
    },
    {
      id: "canvas-divider",
      kind: "line" as const,
      x: marginX,
      y: mm(marginTop + 20),
      width: wideFieldWidth,
      height: 0.6,
      zIndex: 8,
      orientation: "horizontal" as const,
      thickness: 0.6,
      color: "#d1d5db",
    },
    {
      id: "field-origin",
      kind: "field" as const,
      x: marginX,
      y: mm(marginTop + 28),
      width: fieldWidth,
      height: fieldHeight,
      zIndex: 8,
      fieldKey: "origin" as const,
      label: DEFAULT_PDF_LAYOUT_FIELD_LABELS.origin,
      showLabel: true,
      labelSize: 8,
      valueSize: 11,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      radius: 3,
      padding: 2,
    },
    {
      id: "field-destination",
      kind: "field" as const,
      x: mm(marginX + fieldWidth + gap),
      y: mm(marginTop + 28),
      width: fieldWidth,
      height: fieldHeight,
      zIndex: 8,
      fieldKey: "destination" as const,
      label: DEFAULT_PDF_LAYOUT_FIELD_LABELS.destination,
      showLabel: true,
      labelSize: 8,
      valueSize: 11,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      radius: 3,
      padding: 2,
    },
    {
      id: "field-date",
      kind: "field" as const,
      x: marginX,
      y: mm(marginTop + 28 + fieldHeight + 4),
      width: mm(fieldWidth * 0.58),
      height: mm(fieldHeight * 0.9),
      zIndex: 8,
      fieldKey: "date" as const,
      label: DEFAULT_PDF_LAYOUT_FIELD_LABELS.date,
      showLabel: true,
      labelSize: 8,
      valueSize: 11,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      radius: 3,
      padding: 2,
    },
    {
      id: "field-registered-by",
      kind: "field" as const,
      x: mm(marginX + fieldWidth * 0.62 + gap),
      y: mm(marginTop + 28 + fieldHeight + 4),
      width: mm(fieldWidth * 1.38),
      height: mm(fieldHeight * 0.9),
      zIndex: 8,
      fieldKey: "registered_by" as const,
      label: DEFAULT_PDF_LAYOUT_FIELD_LABELS.registered_by,
      showLabel: true,
      labelSize: 8,
      valueSize: 11,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      radius: 3,
      padding: 2,
    },
    {
      id: "items-box",
      kind: "items-list" as const,
      x: marginX,
      y: itemListTop,
      width: wideFieldWidth,
      height: mm(heightMm * 0.27),
      zIndex: 6,
      title: "Detalle de items",
      titleSize: 8,
      titleColor: "#111827",
      itemSize: 9,
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      backgroundColor: "#ffffff",
      radius: 3,
      showQuantity: true,
      showDescription: true,
    },
    {
      id: "signature-block",
      kind: "signature" as const,
      x: marginX,
      y: bottomTop,
      width: mm(widthMm * 0.38),
      height: bottomHeight,
      zIndex: 6,
      title: "Firma",
      titleSize: 8,
      titleColor: "#111827",
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      backgroundColor: "#ffffff",
      radius: 3,
      showPlaceholder: true,
    },
    {
      id: "metadata-box",
      kind: "box" as const,
      x: rightColumnX,
      y: bottomTop,
      width: mm(widthMm - rightColumnX - marginX),
      height: bottomHeight,
      zIndex: 4,
      borderColor: "#d1d5db",
      borderWidth: 0.4,
      backgroundColor: "#ffffff",
      radius: 3,
    },
    {
      id: "field-transfer-number",
      kind: "field" as const,
      x: mm(rightColumnX + 3),
      y: mm(bottomTop + 4),
      width: mm(widthMm - rightColumnX - marginX - 6),
      height: mm(bottomHeight * 0.2),
      zIndex: 8,
      fieldKey: "transfer_number" as const,
      label: "Numero",
      showLabel: true,
      labelSize: 7,
      valueSize: 8,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "transparent",
      borderColor: null,
      borderWidth: 0,
      radius: 0,
      padding: 0,
    },
    {
      id: "field-items-total",
      kind: "field" as const,
      x: mm(rightColumnX + 3),
      y: mm(bottomTop + 4 + bottomHeight * 0.2 + 2),
      width: mm(widthMm - rightColumnX - marginX - 6),
      height: mm(bottomHeight * 0.2),
      zIndex: 8,
      fieldKey: "items_total" as const,
      label: "Items",
      showLabel: true,
      labelSize: 7,
      valueSize: 8,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "transparent",
      borderColor: null,
      borderWidth: 0,
      radius: 0,
      padding: 0,
    },
    {
      id: "field-signed-by",
      kind: "field" as const,
      x: mm(rightColumnX + 3),
      y: mm(bottomTop + 4 + bottomHeight * 0.4 + 4),
      width: mm(widthMm - rightColumnX - marginX - 6),
      height: mm(bottomHeight * 0.38),
      zIndex: 8,
      fieldKey: "signed_by" as const,
      label: "Firmado por",
      showLabel: true,
      labelSize: 7,
      valueSize: 8,
      labelColor: "#6b7280",
      valueColor: "#111827",
      align: "left" as const,
      verticalAlign: "top" as const,
      backgroundColor: "transparent",
      borderColor: null,
      borderWidth: 0,
      radius: 0,
      padding: 0,
    },
  ];
}

export function createDefaultPdfLayoutCanvas(
  pageSize: PdfLayoutPageSize = "A4",
  orientation: PdfLayoutOrientation = "portrait",
): PdfLayoutCanvasConfig {
  const { widthMm, heightMm } = getPdfLayoutPageDimensions(pageSize, orientation);
  return {
    backgroundColor: "#ffffff",
    gridSizeMm: 10,
    showGrid: true,
    elements: createDefaultCanvasElements(widthMm, heightMm),
  };
}

export function createDefaultPdfLayoutConfig(): PdfLayoutConfig {
  return {
    title: "Detalle de traspaso",
    subtitle: "Formato compacto para guardar o imprimir.",
    page_size: "A4",
    orientation: "portrait",
    show_header: true,
    section_order: ["header", "summary", "items", "signature", "metadata"],
    sections: {
      header: true,
      summary: true,
      items: true,
      signature: true,
      metadata: true,
    },
    field_labels: { ...DEFAULT_PDF_LAYOUT_FIELD_LABELS },
    canvas: createDefaultPdfLayoutCanvas("A4", "portrait"),
  };
}

export function normalizePdfLayoutConfig(input: unknown): PdfLayoutConfig {
  const parsed = pdfLayoutConfigSchema.safeParse(input);

  if (!parsed.success) {
    return createDefaultPdfLayoutConfig();
  }

  const config = parsed.data;

  return {
    ...createDefaultPdfLayoutConfig(),
    ...config,
    field_labels: {
      ...DEFAULT_PDF_LAYOUT_FIELD_LABELS,
      ...(config.field_labels ?? {}),
    },
    canvas:
      config.canvas ?? createDefaultPdfLayoutCanvas(config.page_size, config.orientation),
  };
}
