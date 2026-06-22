import { z } from "zod";

export const pdfLayoutSectionKeySchema = z.enum([
  "header",
  "summary",
  "items",
  "signature",
  "metadata",
]);

export const pdfLayoutFieldKeySchema = z.enum([
  "origin",
  "destination",
  "date",
  "registered_by",
  "transfer_number",
  "transfer_id",
  "items_total",
  "equipment_count",
  "tool_count",
  "signed_by",
]);

const pdfLayoutCanvasBaseElementSchema = z.object({
  id: z.string().trim().min(1).max(80),
  x: z.number().finite().min(0),
  y: z.number().finite().min(0),
  width: z.number().finite().min(0),
  height: z.number().finite().min(0),
  zIndex: z.number().int().min(0).default(0),
  opacity: z.number().min(0).max(1).optional(),
});

const pdfLayoutTextElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("text"),
  text: z.string().trim().min(1).max(800),
  fontSize: z.number().min(6).max(72).default(14),
  fontWeight: z.union([
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
    z.literal(800),
  ]).default(600),
  color: z.string().trim().min(1).default("#1f2937"),
  align: z.enum(["left", "center", "right"]).default("left"),
  verticalAlign: z.enum(["top", "middle", "bottom"]).default("top"),
  backgroundColor: z.string().trim().min(1).nullable().optional(),
  borderColor: z.string().trim().min(1).nullable().optional(),
  borderWidth: z.number().min(0).default(0),
  radius: z.number().min(0).default(0),
  padding: z.number().min(0).default(0),
});

const pdfLayoutFieldElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("field"),
  fieldKey: pdfLayoutFieldKeySchema,
  label: z.string().trim().max(120).nullable().optional(),
  showLabel: z.boolean().default(true),
  labelSize: z.number().min(5).max(28).default(8),
  valueSize: z.number().min(6).max(40).default(11),
  labelColor: z.string().trim().min(1).default("#6b7280"),
  valueColor: z.string().trim().min(1).default("#111827"),
  align: z.enum(["left", "center", "right"]).default("left"),
  verticalAlign: z.enum(["top", "middle", "bottom"]).default("top"),
  backgroundColor: z.string().trim().min(1).nullable().optional(),
  borderColor: z.string().trim().min(1).nullable().optional(),
  borderWidth: z.number().min(0).default(0),
  radius: z.number().min(0).default(0),
  padding: z.number().min(0).default(0),
});

const pdfLayoutLineElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("line"),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  thickness: z.number().min(0.1).max(10).default(0.6),
  color: z.string().trim().min(1).default("#1f2937"),
});

const pdfLayoutBoxElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("box"),
  borderColor: z.string().trim().min(1).default("#d1d5db"),
  borderWidth: z.number().min(0).default(0.4),
  backgroundColor: z.string().trim().min(1).default("#ffffff"),
  radius: z.number().min(0).default(2),
});

const pdfLayoutItemsListElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("items-list"),
  title: z.string().trim().min(1).max(120).default("Detalle de items"),
  titleSize: z.number().min(6).max(28).default(8),
  titleColor: z.string().trim().min(1).default("#111827"),
  itemSize: z.number().min(6).max(28).default(9),
  borderColor: z.string().trim().min(1).default("#d1d5db"),
  borderWidth: z.number().min(0).default(0.4),
  backgroundColor: z.string().trim().min(1).default("#ffffff"),
  radius: z.number().min(0).default(3),
  showQuantity: z.boolean().default(true),
  showDescription: z.boolean().default(true),
});

const pdfLayoutSignatureElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("signature"),
  title: z.string().trim().min(1).max(120).default("Firma"),
  titleSize: z.number().min(6).max(28).default(8),
  titleColor: z.string().trim().min(1).default("#111827"),
  borderColor: z.string().trim().min(1).default("#d1d5db"),
  borderWidth: z.number().min(0).default(0.4),
  backgroundColor: z.string().trim().min(1).default("#ffffff"),
  radius: z.number().min(0).default(3),
  showPlaceholder: z.boolean().default(true),
});

const pdfLayoutImageElementSchema = pdfLayoutCanvasBaseElementSchema.extend({
  kind: z.literal("image"),
  source: z.enum(["static", "runtime"]).default("static"),
  sourceKey: z.enum(["company_logo_url"]).nullable().optional(),
  src: z.string().trim().max(2000).nullable().optional(),
  alt: z.string().trim().min(1).max(140).default("Imagen del layout"),
  fit: z.enum(["contain", "cover", "fill", "scale-down"]).default("contain"),
  backgroundColor: z.string().trim().min(1).nullable().optional(),
  borderColor: z.string().trim().min(1).nullable().optional(),
  borderWidth: z.number().min(0).default(0),
  radius: z.number().min(0).default(0),
  padding: z.number().min(0).default(0),
});

export const pdfLayoutCanvasElementSchema = z.discriminatedUnion("kind", [
  pdfLayoutTextElementSchema,
  pdfLayoutFieldElementSchema,
  pdfLayoutLineElementSchema,
  pdfLayoutBoxElementSchema,
  pdfLayoutItemsListElementSchema,
  pdfLayoutSignatureElementSchema,
  pdfLayoutImageElementSchema,
]);

export const pdfLayoutCanvasConfigSchema = z.object({
  backgroundColor: z.string().trim().min(1).default("#ffffff"),
  gridSizeMm: z.number().min(1).max(40).default(10),
  showGrid: z.boolean().default(true),
  elements: z.array(pdfLayoutCanvasElementSchema).default([]),
});

export const pdfLayoutConfigSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240).nullable(),
  page_size: z.enum(["A4", "Letter"]),
  orientation: z.enum(["portrait", "landscape"]),
  show_header: z.boolean().default(true),
  section_order: z
    .array(pdfLayoutSectionKeySchema)
    .min(1)
    .default(["header", "summary", "items", "signature", "metadata"]),
  sections: z.object({
    header: z.boolean().default(true),
    summary: z.boolean().default(true),
    items: z.boolean().default(true),
    signature: z.boolean().default(true),
    metadata: z.boolean().default(true),
  }),
  field_labels: z.object({
    origin: z.string().trim().max(80).optional(),
    destination: z.string().trim().max(80).optional(),
    date: z.string().trim().max(80).optional(),
    registered_by: z.string().trim().max(80).optional(),
  }),
  canvas: pdfLayoutCanvasConfigSchema.nullish(),
});

export const pdfLayoutTemplateInputSchema = z.object({
  template_id: z.uuid(),
  template_key: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(240).nullable(),
  target_path: z.string().trim().min(2).max(160),
  is_active: z.boolean().default(true),
  layout_config: pdfLayoutConfigSchema,
});

export type PdfLayoutTemplateInput = z.infer<typeof pdfLayoutTemplateInputSchema>;
export type PdfLayoutConfigInput = z.infer<typeof pdfLayoutConfigSchema>;
