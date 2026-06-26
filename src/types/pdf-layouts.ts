export type PdfLayoutSectionKey =
  | "header"
  | "summary"
  | "items"
  | "signature"
  | "metadata";

export type PdfLayoutFieldKey =
  | "origin"
  | "destination"
  | "date"
  | "registered_by"
  | "transfer_number"
  | "transfer_id"
  | "items_total"
  | "equipment_count"
  | "tool_count"
  | "signed_by"
  | "observations";

export type PdfLayoutImageSourceKey = "company_logo_url";

export type PdfLayoutPageSize = "A4" | "Letter";
export type PdfLayoutOrientation = "portrait" | "landscape";

export type PdfLayoutCanvasBaseElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
};

export type PdfLayoutTextElement = PdfLayoutCanvasBaseElement & {
  kind: "text";
  text: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  color: string;
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  radius?: number | null;
  padding?: number | null;
};

export type PdfLayoutFieldElement = PdfLayoutCanvasBaseElement & {
  kind: "field";
  fieldKey: PdfLayoutFieldKey;
  label?: string | null;
  showLabel: boolean;
  labelSize: number;
  valueSize: number;
  labelColor: string;
  valueColor: string;
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  radius?: number | null;
  padding?: number | null;
};

export type PdfLayoutLineElement = PdfLayoutCanvasBaseElement & {
  kind: "line";
  orientation: "horizontal" | "vertical";
  thickness: number;
  color: string;
};

export type PdfLayoutBoxElement = PdfLayoutCanvasBaseElement & {
  kind: "box";
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  radius: number;
};

export type PdfLayoutItemsListElement = PdfLayoutCanvasBaseElement & {
  kind: "items-list";
  title: string;
  titleSize: number;
  titleColor: string;
  itemSize: number;
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  radius: number;
  showQuantity: boolean;
  showDescription: boolean;
};

export type PdfLayoutSignatureElement = PdfLayoutCanvasBaseElement & {
  kind: "signature";
  title: string;
  titleSize: number;
  titleColor: string;
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  radius: number;
  showPlaceholder: boolean;
};

export type PdfLayoutImageElement = PdfLayoutCanvasBaseElement & {
  kind: "image";
  source: "static" | "runtime";
  sourceKey?: PdfLayoutImageSourceKey | null;
  src?: string | null;
  alt: string;
  fit: "contain" | "cover" | "fill" | "scale-down";
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  radius?: number | null;
  padding?: number | null;
};

export type PdfLayoutCanvasElement =
  | PdfLayoutTextElement
  | PdfLayoutFieldElement
  | PdfLayoutLineElement
  | PdfLayoutBoxElement
  | PdfLayoutItemsListElement
  | PdfLayoutSignatureElement
  | PdfLayoutImageElement;

export type PdfLayoutCanvasConfig = {
  backgroundColor: string;
  gridSizeMm: number;
  showGrid: boolean;
  elements: PdfLayoutCanvasElement[];
};

export type PdfLayoutConfig = {
  title: string;
  subtitle: string | null;
  page_size: PdfLayoutPageSize;
  orientation: PdfLayoutOrientation;
  show_header: boolean;
  section_order: PdfLayoutSectionKey[];
  sections: Record<PdfLayoutSectionKey, boolean>;
  field_labels: Partial<
    Record<"origin" | "destination" | "date" | "registered_by" | "observations", string>
  >;
  canvas?: PdfLayoutCanvasConfig | null;
};

export type PdfLayoutTemplate = {
  id: string;
  company_id: string;
  template_key: string;
  name: string;
  description: string | null;
  target_path: string;
  layout_config: PdfLayoutConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
