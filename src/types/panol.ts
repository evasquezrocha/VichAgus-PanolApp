import type { LocationAssignmentFields } from "@/types/ubicaciones";

export type ToolGroup = {
  id: string;
  company_id: string;
  codigo: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
};

export type Tool = {
  id: string;
  company_id: string;
  tool_group_id: string;
  ubicacion_id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  marca: string | null;
  modelo: string | null;
  image_url: string | null;
  image_dropbox_path: string | null;
  created_at: string;
  updated_at: string;
} & LocationAssignmentFields;

export type ToolCustomFieldType = "text" | "number" | "select" | "date" | "boolean";

export type ToolCustomField = {
  id: string;
  company_id: string;
  codigo: string;
  nombre: string;
  field_type: ToolCustomFieldType;
  options: string[];
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ToolCustomFieldValue = {
  id: string;
  company_id: string;
  tool_id: string;
  custom_field_id: string;
  value_text: string | null;
  created_at: string;
  updated_at: string;
};
