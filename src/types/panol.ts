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
  estado: string | null;
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

export type ToolAllocationSummary = {
  id: string;
  employee_id: string | null;
  employee_name: string | null;
  quantity: number;
  assigned_at: string;
};

export type ToolUnitSummary = {
  unit_number: number;
  employee_id: string | null;
  employee_name: string | null;
  allocation_id: string | null;
  assigned_at: string | null;
};

export type ToolDetailCustomFieldValue = {
  id: string;
  codigo: string;
  nombre: string;
  field_type: ToolCustomFieldType;
  value_text: string | null;
};

export type ToolDetail = {
  tool: Tool;
  group: ToolGroup | null;
  location: {
    id: string;
    nombre: string;
    is_default: boolean;
  } | null;
  custom_field_values: ToolDetailCustomFieldValue[];
  allocations: ToolAllocationSummary[];
  units: ToolUnitSummary[];
  assigned_quantity: number;
  unassigned_quantity: number;
};
