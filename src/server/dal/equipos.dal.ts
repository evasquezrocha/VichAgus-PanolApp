import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type {
  EquipmentCustomFieldInput,
  EquipmentGroupInput,
  EquipmentInput,
} from "@/schemas/equipos.schema";
import type { Equipment, EquipmentCustomField, EquipmentCustomFieldValue, EquipmentGroup } from "@/types/equipos";

async function getCurrentCompanyIdForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

function isMissingEstadoColumnError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("could not find the 'estado' column") ||
    normalized.includes("could not find column 'estado'") ||
    normalized.includes("column \"estado\" does not exist") ||
    normalized.includes("column estado does not exist")
  );
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

export async function listEquipmentGroupsForCurrentCompanyAdmin(): Promise<EquipmentGroup[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_groups")
    .select("*")
    .eq("company_id", companyId)
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EquipmentGroup[];
}

export async function createEquipmentGroupForCurrentCompanyAdmin(
  input: EquipmentGroupInput,
): Promise<EquipmentGroup> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_groups")
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

  return data as EquipmentGroup;
}

export async function listEquipmentsForCurrentCompanyAdmin(): Promise<Equipment[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const [equipmentsResult, assignmentsResult, locationsResult, employeesResult] = await Promise.all([
    admin
      .from("equipments")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    admin
      .from("employee_equipment_assignments")
      .select("equipment_id, employee_id")
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

  if (equipmentsResult.error) {
    throw new Error(equipmentsResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }

  const assignmentByEquipmentId = new Map<string, { employee_id: string | null }>(
    (assignmentsResult.data ?? []).map((assignment) => [
      assignment.equipment_id,
      assignment,
    ]),
  );
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

  return (equipmentsResult.data ?? []).map((equipment) => {
    const assignment = assignmentByEquipmentId.get(equipment.id);
    const location = locationById.get(equipment.ubicacion_id);
    const assignedEmployee = assignment?.employee_id
      ? employeeById.get(assignment.employee_id)
      : null;

    return {
      ...(equipment as Equipment),
      ubicacion_nombre: location?.nombre ?? null,
      ubicacion_display_name: assignment?.employee_id
        ? "Asignado a Empleado"
        : location?.nombre ?? "PAÑOL",
      assigned_employee_id: assignment?.employee_id ?? null,
      assigned_employee_name: buildEmployeeName(assignedEmployee),
    };
  });
}

export async function createEquipmentForCurrentCompanyAdmin(
  input: EquipmentInput & { image_url: string | null; image_dropbox_path: string | null },
): Promise<Equipment> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const payload: Record<string, string | null> = {
    company_id: companyId,
    tool_group_id: input.tool_group_id,
    ubicacion_id: input.ubicacion_id,
    codigo: input.codigo.toUpperCase(),
    descripcion: input.descripcion,
    nro_serie: input.nro_serie?.trim() || null,
    marca: input.marca?.trim() || null,
    modelo: input.modelo?.trim() || null,
    image_url: input.image_url,
    image_dropbox_path: input.image_dropbox_path,
  };

  const { data, error } = await admin
    .from("equipments")
    .insert(
      {
        ...payload,
        estado: input.estado?.trim() || null,
      } as never,
    )
    .select("*")
    .single();

  if (error && isMissingEstadoColumnError(error.message)) {
    const retryResult = await admin
      .from("equipments")
      .insert(payload as never)
      .select("*")
      .single();

    if (retryResult.error || !retryResult.data) {
      throw new Error(retryResult.error?.message ?? "No se pudo crear el equipo.");
    }

    return retryResult.data as Equipment;
  }

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el equipo.");
  }

  return data as Equipment;
}

export async function updateEquipmentForCurrentCompanyAdmin(
  input: EquipmentInput & {
    id: string;
    image_url: string | null;
    image_dropbox_path: string | null;
  },
): Promise<Equipment> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const payload: Record<string, string | null> = {
    tool_group_id: input.tool_group_id,
    ubicacion_id: input.ubicacion_id,
    codigo: input.codigo.toUpperCase(),
    descripcion: input.descripcion,
    nro_serie: input.nro_serie?.trim() || null,
    marca: input.marca?.trim() || null,
    modelo: input.modelo?.trim() || null,
    image_url: input.image_url,
    image_dropbox_path: input.image_dropbox_path,
  };

  const { data, error } = await admin
    .from("equipments")
    .update({
      ...payload,
      estado: input.estado?.trim() || null,
    } as never)
    .eq("id", input.id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error && isMissingEstadoColumnError(error.message)) {
    const retryResult = await admin
      .from("equipments")
      .update(payload as never)
      .eq("id", input.id)
      .eq("company_id", companyId)
      .select("*")
      .single();

    if (retryResult.error || !retryResult.data) {
      throw new Error(retryResult.error?.message ?? "No se pudo actualizar el equipo.");
    }

    return retryResult.data as Equipment;
  }

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el equipo.");
  }

  return data as Equipment;
}

export async function deleteEquipmentForCurrentCompanyAdmin(id: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data: transferItems, error: transferItemsError } = await admin
    .from("employee_transfer_items")
    .select("id")
    .eq("equipment_id", id);

  if (transferItemsError) {
    throw new Error(transferItemsError.message);
  }

  if ((transferItems ?? []).length > 0) {
    throw new Error("No se puede eliminar un equipo que ya participó en un traspaso.");
  }

  const { error } = await admin
    .from("equipments")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function listEquipmentCustomFieldsForCurrentCompanyAdmin(): Promise<EquipmentCustomField[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_custom_fields")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EquipmentCustomField[];
}

export async function createEquipmentCustomFieldForCurrentCompanyAdmin(
  input: EquipmentCustomFieldInput,
): Promise<EquipmentCustomField> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_custom_fields")
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

  return data as EquipmentCustomField;
}

export async function updateEquipmentCustomFieldForCurrentCompanyAdmin(
  input: EquipmentCustomFieldInput & { id: string },
): Promise<EquipmentCustomField> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_custom_fields")
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

  return data as EquipmentCustomField;
}

export async function deleteEquipmentCustomFieldForCurrentCompanyAdmin(id: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("equipment_custom_fields")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function reorderEquipmentCustomFieldForCurrentCompanyAdmin(
  id: string,
  direction: "up" | "down",
) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const fields = await listEquipmentCustomFieldsForCurrentCompanyAdmin();
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
    .from("equipment_custom_fields")
    .update({ sort_order: targetField.sort_order })
    .eq("id", currentField.id)
    .eq("company_id", companyId);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const { error: secondError } = await admin
    .from("equipment_custom_fields")
    .update({ sort_order: currentField.sort_order })
    .eq("id", targetField.id)
    .eq("company_id", companyId);

  if (secondError) {
    throw new Error(secondError.message);
  }

  return { success: true };
}

export async function listEquipmentCustomFieldValuesForCurrentCompanyAdmin(): Promise<
  EquipmentCustomFieldValue[]
> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("equipment_custom_field_values")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EquipmentCustomFieldValue[];
}

export async function replaceEquipmentCustomFieldValuesForCurrentCompanyAdmin(
  toolId: string,
  values: Record<string, string | null>,
) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const fieldIds = Object.keys(values);

  const admin = createSupabaseAdminClient();

  if (fieldIds.length === 0) {
    const { error: deleteError } = await admin
      .from("equipment_custom_field_values")
      .delete()
      .eq("tool_id", toolId)
      .eq("company_id", companyId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true };
  }

  const { data: fields, error: fieldsError } = await admin
    .from("equipment_custom_fields")
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
    .from("equipment_custom_field_values")
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

  const { error: insertError } = await admin.from("equipment_custom_field_values").insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}

