import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type {
  ToolCustomFieldInput,
  ToolGroupInput,
  ToolInput,
} from "@/schemas/panol.schema";
import type { Tool, ToolCustomField, ToolCustomFieldValue, ToolGroup } from "@/types/panol";

async function getCurrentCompanyIdForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

function buildEmployeeName(
  employee:
    | { nombres: string; apellidos: string | null; rut: string | null }
    | null
    | undefined,
) {
  if (!employee) {
    return null;
  }

  const fullName = `${employee.nombres} ${employee.apellidos ?? ""}`.trim();
  return fullName.length > 0 ? fullName : employee.rut;
}

export async function getCurrentCompanySlugForCurrentCompanyAdmin() {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Company slug could not be resolved.");
  }

  return data.slug as string;
}

export async function listToolGroupsForCurrentCompanyAdmin(): Promise<ToolGroup[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_groups")
    .select("*")
    .eq("company_id", companyId)
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ToolGroup[];
}

export async function createToolGroupForCurrentCompanyAdmin(
  input: ToolGroupInput,
): Promise<ToolGroup> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_groups")
    .insert({
      company_id: companyId,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el grupo.");
  }

  return data as ToolGroup;
}

export async function listToolsForCurrentCompanyAdmin(): Promise<Tool[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const [toolsResult, allocationsResult, locationsResult, employeesResult] = await Promise.all([
    admin
      .from("tools")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    admin
      .from("employee_tool_allocations")
      .select("tool_id, employee_id, quantity")
      .eq("company_id", companyId),
    admin
      .from("panol_locations")
      .select("id, nombre")
      .eq("company_id", companyId),
    admin
      .from("employees")
      .select("id, nombres, apellidos, rut")
      .eq("company_id", companyId),
  ]);

  if (toolsResult.error) {
    throw new Error(toolsResult.error.message);
  }

  if (allocationsResult.error) {
    throw new Error(allocationsResult.error.message);
  }

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }

  const locationById = new Map<string, { nombre: string }>(
    (locationsResult.data ?? []).map((location) => [location.id, location]),
  );
  const employeeById = new Map(
    (employeesResult.data ?? []).map((employee) => [
      employee.id,
      {
        id: employee.id,
        nombres: employee.nombres,
        apellidos: employee.apellidos,
        rut: employee.rut,
      },
    ]),
  );

  return (toolsResult.data ?? []).map((tool) => {
    const assignedAllocation = (allocationsResult.data ?? []).find(
      (item) => item.tool_id === tool.id && item.employee_id,
    );
    const location = locationById.get(tool.ubicacion_id);
    const assignedEmployee = assignedAllocation?.employee_id
      ? employeeById.get(assignedAllocation.employee_id)
      : null;

    return {
      ...(tool as Tool),
      ubicacion_nombre: location?.nombre ?? null,
      ubicacion_display_name: assignedAllocation?.employee_id
        ? "Asignado a Empleado"
        : location?.nombre ?? "PAÑOL",
      assigned_employee_id: assignedAllocation?.employee_id ?? null,
      assigned_employee_name: buildEmployeeName(assignedEmployee),
    } as Tool;
  });
}

export async function createToolForCurrentCompanyAdmin(
  input: ToolInput & { image_url: string | null; image_dropbox_path: string | null },
): Promise<Tool> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tools")
    .insert({
      company_id: companyId,
      tool_group_id: input.tool_group_id,
      ubicacion_id: input.ubicacion_id,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
      cantidad: input.cantidad,
      unidad: input.unidad.toUpperCase(),
      marca: input.marca?.trim() || null,
      modelo: input.modelo?.trim() || null,
      image_url: input.image_url,
      image_dropbox_path: input.image_dropbox_path,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la herramienta.");
  }

  return data as Tool;
}

export async function updateToolForCurrentCompanyAdmin(
  input: ToolInput & {
    id: string;
    image_url: string | null;
    image_dropbox_path: string | null;
  },
): Promise<Tool> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tools")
    .update({
      tool_group_id: input.tool_group_id,
      ubicacion_id: input.ubicacion_id,
      codigo: input.codigo.toUpperCase(),
      descripcion: input.descripcion,
      cantidad: input.cantidad,
      unidad: input.unidad.toUpperCase(),
      marca: input.marca?.trim() || null,
      modelo: input.modelo?.trim() || null,
      image_url: input.image_url,
      image_dropbox_path: input.image_dropbox_path,
    })
    .eq("id", input.id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar la herramienta.");
  }

  return data as Tool;
}

export async function deleteToolForCurrentCompanyAdmin(id: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data: transferItems, error: transferItemsError } = await admin
    .from("employee_transfer_items")
    .select("id")
    .eq("tool_id", id);

  if (transferItemsError) {
    throw new Error(transferItemsError.message);
  }

  if ((transferItems ?? []).length > 0) {
    throw new Error("No se puede eliminar una herramienta que ya participó en un traspaso.");
  }

  const { error } = await admin
    .from("tools")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function listToolCustomFieldsForCurrentCompanyAdmin(): Promise<ToolCustomField[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_custom_fields")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ToolCustomField[];
}

export async function createToolCustomFieldForCurrentCompanyAdmin(
  input: ToolCustomFieldInput,
): Promise<ToolCustomField> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_custom_fields")
    .insert({
      company_id: companyId,
      codigo: input.codigo.toUpperCase(),
      nombre: input.nombre,
      field_type: input.field_type,
      options: input.field_type === "select" ? input.options : [],
      is_required: input.is_required,
      is_active: input.is_active,
      sort_order: input.sort_order,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el campo personalizado.");
  }

  return data as ToolCustomField;
}

export async function updateToolCustomFieldForCurrentCompanyAdmin(
  input: ToolCustomFieldInput & { id: string },
): Promise<ToolCustomField> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_custom_fields")
    .update({
      codigo: input.codigo.toUpperCase(),
      nombre: input.nombre,
      field_type: input.field_type,
      options: input.field_type === "select" ? input.options : [],
      is_required: input.is_required,
      is_active: input.is_active,
      sort_order: input.sort_order,
    })
    .eq("id", input.id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el campo personalizado.");
  }

  return data as ToolCustomField;
}

export async function deleteToolCustomFieldForCurrentCompanyAdmin(id: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("tool_custom_fields")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function reorderToolCustomFieldForCurrentCompanyAdmin(
  id: string,
  direction: "up" | "down",
) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const fields = await listToolCustomFieldsForCurrentCompanyAdmin();
  const index = fields.findIndex((field) => field.id === id);

  if (index === -1) {
    throw new Error("Custom field not found.");
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const targetField = fields[targetIndex];

  if (!targetField) {
    return { success: true };
  }

  const currentField = fields[index];

  const admin = createSupabaseAdminClient();
  const { error: firstError } = await admin
    .from("tool_custom_fields")
    .update({ sort_order: targetField.sort_order })
    .eq("id", currentField.id)
    .eq("company_id", companyId);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const { error: secondError } = await admin
    .from("tool_custom_fields")
    .update({ sort_order: currentField.sort_order })
    .eq("id", targetField.id)
    .eq("company_id", companyId);

  if (secondError) {
    throw new Error(secondError.message);
  }

  return { success: true };
}

export async function listToolCustomFieldValuesForCurrentCompanyAdmin(): Promise<
  ToolCustomFieldValue[]
> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tool_custom_field_values")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ToolCustomFieldValue[];
}

export async function replaceToolCustomFieldValuesForCurrentCompanyAdmin(
  toolId: string,
  values: Record<string, string | null>,
) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const fieldIds = Object.keys(values);

  const admin = createSupabaseAdminClient();

  if (fieldIds.length === 0) {
    const { error: deleteError } = await admin
      .from("tool_custom_field_values")
      .delete()
      .eq("tool_id", toolId)
      .eq("company_id", companyId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true };
  }

  const { data: fields, error: fieldsError } = await admin
    .from("tool_custom_fields")
    .select("id")
    .eq("company_id", companyId)
    .in("id", fieldIds);

  if (fieldsError) {
    throw new Error(fieldsError.message);
  }

  if ((fields ?? []).length !== fieldIds.length) {
    throw new Error("One or more custom fields are invalid.");
  }

  const { error: deleteError } = await admin
    .from("tool_custom_field_values")
    .delete()
    .eq("tool_id", toolId)
    .eq("company_id", companyId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = fieldIds
    .map((fieldId) => {
      const value = values[fieldId];

      if (value === null || value.trim().length === 0) {
        return null;
      }

      return {
        company_id: companyId,
        tool_id: toolId,
        custom_field_id: fieldId,
        value_text: value.trim(),
      };
    })
    .filter((row): row is {
      company_id: string;
      tool_id: string;
      custom_field_id: string;
      value_text: string;
    } => row !== null);

  if (rows.length === 0) {
    return { success: true };
  }

  const { error: insertError } = await admin.from("tool_custom_field_values").insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}
