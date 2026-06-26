import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCompanyAdmin, requireCurrentProfile } from "@/server/auth/guards";
import type { EmployeeInput } from "@/schemas/empleados.schema";
import type {
  Employee,
  EmployeeCompany,
  EmployeeDetail,
  EmployeeEquipmentDetail,
  EmployeeTransferHistoryEntry,
  EmployeeToolDetail,
} from "@/types/empleados";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

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

export async function listEmployeeCompaniesForCurrentCompanyAdmin(): Promise<
  EmployeeCompany[]
> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employee_companies")
    .select("*")
    .eq("company_id", companyId)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EmployeeCompany[];
}

async function ensureEmployeeCompanyForCurrentCompanyAdmin(nombre: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const normalized = normalizeText(nombre);

  if (!normalized) {
    throw new Error("Company name is required.");
  }

  const existingCompanies = await listEmployeeCompaniesForCurrentCompanyAdmin();
  const existing = existingCompanies.find(
    (item) => item.nombre.trim().toLowerCase() === normalized.toLowerCase(),
  );

  if (existing) {
    return existing;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employee_companies")
    .insert({
      company_id: companyId,
      nombre: normalized,
    })
    .select("*")
    .single();

  if (error || !data) {
    const refreshedCompanies = await listEmployeeCompaniesForCurrentCompanyAdmin();
    const retry = refreshedCompanies.find(
      (item) => item.nombre.trim().toLowerCase() === normalized.toLowerCase(),
    );

    if (retry) {
      return retry;
    }

    throw new Error(error?.message ?? "No se pudo crear la empresa.");
  }

  return data as EmployeeCompany;
}

async function ensureEmployeeCanBeDeactivated(
  employeeId: string,
  companyId: string,
  supabase?: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const client = supabase ?? (await createServerSupabaseClient());
  const [equipmentResult, toolResult] = await Promise.all([
    client
      .from("employee_equipment_assignments")
      .select("id")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId),
    client
      .from("employee_tool_allocations")
      .select("quantity")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId),
  ]);

  if (equipmentResult.error) {
    throw new Error(equipmentResult.error.message);
  }

  if (toolResult.error) {
    throw new Error(toolResult.error.message);
  }

  const assignedEquipmentCount = equipmentResult.data?.length ?? 0;
  const assignedToolCount = toolResult.data?.reduce((sum, allocation) => sum + allocation.quantity, 0) ?? 0;

  if (assignedEquipmentCount > 0 || assignedToolCount > 0) {
    throw new Error(
      "No se puede inactivar un empleado con equipos o herramientas asignadas.",
    );
  }
}

export async function listEmployeesForCurrentCompanyAdmin(): Promise<Employee[]> {
  const companyId = await getCurrentCompanyIdForCurrentProfile();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .order("apellidos", { ascending: true })
    .order("nombres", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Employee[];
}

export async function getEmployeeDetailForCurrentCompanyAdmin(
  employeeId: string,
): Promise<EmployeeDetail | null> {
  const profile = await requireCompanyAdmin();
  if (!profile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  const admin = createSupabaseAdminClient();
  const [
    employeeResult,
    employeeCompanyResult,
    equipmentAssignmentsResult,
    toolsAllocationsResult,
    equipmentGroupsResult,
    toolsResult,
    transfersResult,
    employeesResult,
    locationsResult,
  ] = await Promise.all([
    admin
      .from("employees")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("id", employeeId)
      .single(),
    admin.from("employee_companies").select("id, nombre").eq("company_id", profile.company_id),
    admin
      .from("employee_equipment_assignments")
      .select("id, equipment_id, assigned_at")
      .eq("company_id", profile.company_id)
      .eq("employee_id", employeeId)
      .order("assigned_at", { ascending: false }),
    admin
      .from("employee_tool_allocations")
      .select("id, tool_id, quantity, assigned_at")
      .eq("company_id", profile.company_id)
      .eq("employee_id", employeeId)
      .order("assigned_at", { ascending: false }),
    admin
      .from("equipment_groups")
      .select("id, codigo, descripcion")
      .eq("company_id", profile.company_id),
    admin
      .from("tools")
      .select("id, codigo, descripcion, cantidad, unidad, estado, marca, modelo")
      .eq("company_id", profile.company_id),
    admin
      .from("employee_transfers")
      .select(
        "id, transfer_number, origin_type, origin_employee_id, origin_location_id, destination_type, destination_employee_id, destination_location_id, transfer_date, transfer_time",
      )
      .eq("company_id", profile.company_id)
      .or(`origin_employee_id.eq.${employeeId},destination_employee_id.eq.${employeeId}`),
    admin
      .from("employees")
      .select("id, nombres, apellidos, rut")
      .eq("company_id", profile.company_id),
    admin
      .from("panol_locations")
      .select("id, nombre, is_default")
      .eq("company_id", profile.company_id),
  ]);

  if (employeeResult.error) {
    if (employeeResult.error.code === "PGRST116") {
      return null;
    }

    throw new Error(employeeResult.error.message);
  }

  if (employeeCompanyResult.error) {
    throw new Error(employeeCompanyResult.error.message);
  }

  if (equipmentAssignmentsResult.error) {
    throw new Error(equipmentAssignmentsResult.error.message);
  }

  if (toolsAllocationsResult.error) {
    throw new Error(toolsAllocationsResult.error.message);
  }

  if (equipmentGroupsResult.error) {
    throw new Error(equipmentGroupsResult.error.message);
  }

  if (toolsResult.error) {
    throw new Error(toolsResult.error.message);
  }

  if (transfersResult.error) {
    throw new Error(transfersResult.error.message);
  }

  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  const employeeCompanyById = new Map(
    (employeeCompanyResult.data ?? []).map((item) => [item.id, item.nombre]),
  );
  const equipmentGroupById = new Map(
    (equipmentGroupsResult.data ?? []).map((item) => [item.id, item]),
  );
  const toolById = new Map((toolsResult.data ?? []).map((item) => [item.id, item]));
  const employeeById = new Map(
    (employeesResult.data ?? []).map((item) => [
      item.id,
      {
        nombres: item.nombres,
        apellidos: item.apellidos,
        rut: item.rut,
      },
    ]),
  );
  const locationById = new Map(
    (locationsResult.data ?? []).map((item) => [
      item.id,
      {
        nombre: item.nombre,
        is_default: item.is_default,
      },
    ]),
  );

  const equipmentIds = (equipmentAssignmentsResult.data ?? []).map((item) => item.equipment_id);
  const transferIds = (transfersResult.data ?? []).map((item) => item.id);

  const equipmentRecordsResult = equipmentIds.length
    ? await admin
        .from("equipments")
        .select("id, codigo, descripcion, nro_serie, estado, marca, modelo, tool_group_id")
        .eq("company_id", profile.company_id)
        .in("id", equipmentIds)
    : { data: [], error: null };

  if (equipmentRecordsResult.error) {
    throw new Error(equipmentRecordsResult.error.message);
  }

  const equipmentById = new Map(
    (equipmentRecordsResult.data ?? []).map((item) => [item.id, item]),
  );

  const employeeEquipments = (equipmentAssignmentsResult.data ?? []).map((assignment) => {
    const equipment = equipmentById.get(assignment.equipment_id);
    const group = equipment?.tool_group_id ? equipmentGroupById.get(equipment.tool_group_id) : null;

    return {
      id: assignment.id,
      equipment_id: assignment.equipment_id,
      codigo: equipment?.codigo ?? "",
      descripcion: equipment?.descripcion ?? "",
      nro_serie: equipment?.nro_serie ?? null,
      estado: equipment?.estado ?? null,
      marca: equipment?.marca ?? null,
      modelo: equipment?.modelo ?? null,
      assigned_at: assignment.assigned_at,
      group_codigo: group?.codigo ?? null,
      group_descripcion: group?.descripcion ?? null,
    } satisfies EmployeeEquipmentDetail;
  });

  const employeeTools = (toolsAllocationsResult.data ?? []).map((allocation) => {
    const tool = toolById.get(allocation.tool_id);

    return {
      id: allocation.id,
      tool_id: allocation.tool_id,
      codigo: tool?.codigo ?? "",
      descripcion: tool?.descripcion ?? "",
      cantidad: allocation.quantity,
      unidad: tool?.unidad ?? "",
      estado: tool?.estado ?? null,
      marca: tool?.marca ?? null,
      modelo: tool?.modelo ?? null,
      assigned_at: allocation.assigned_at,
    } satisfies EmployeeToolDetail;
  });

  const transferItemsResult = transferIds.length
    ? await admin
        .from("employee_transfer_items")
        .select("transfer_id, equipment_id, tool_id, quantity")
        .in("transfer_id", transferIds)
    : { data: [], error: null };

  if (transferItemsResult.error) {
    throw new Error(transferItemsResult.error.message);
  }

  const transferItemsByTransferId = new Map<
    string,
    { equipmentCount: number; toolQuantity: number; itemCount: number }
  >();

  for (const item of transferItemsResult.data ?? []) {
    const current = transferItemsByTransferId.get(item.transfer_id) ?? {
      equipmentCount: 0,
      toolQuantity: 0,
      itemCount: 0,
    };

    current.itemCount += 1;
    if (item.equipment_id) {
      current.equipmentCount += 1;
    }
    if (item.tool_id) {
      current.toolQuantity += item.quantity;
    }

    transferItemsByTransferId.set(item.transfer_id, current);
  }

  const buildEmployeeName = (
    employee:
      | { nombres: string; apellidos: string | null; rut: string | null }
      | null
      | undefined,
  ) => {
    if (!employee) {
      return "Sin asignar";
    }

    const fullName = `${employee.nombres} ${employee.apellidos ?? ""}`.trim();
    return fullName.length > 0 ? fullName : employee.rut ?? "Sin asignar";
  };

  const buildEndpointLabel = (
    endpoint: {
      type: string;
      employee_id: string | null;
      location_id: string | null;
    } | null,
  ) => {
    if (!endpoint) {
      return "Sin definir";
    }

    if (endpoint.type === "employee") {
      return `Empleado: ${buildEmployeeName(endpoint.employee_id ? employeeById.get(endpoint.employee_id) : null)}`;
    }

    const location = endpoint.location_id ? locationById.get(endpoint.location_id) : null;
    return `Ubicación: ${location ? (location.is_default ? "Pañol" : location.nombre) : "Pañol"}`;
  };

  const history: EmployeeTransferHistoryEntry[] = (transfersResult.data ?? [])
    .map((transfer) => {
      const direction =
        transfer.origin_employee_id === employeeId ? "outgoing" : "incoming";
      const counterpartEndpoint =
        direction === "outgoing"
          ? {
              type: transfer.destination_type,
              employee_id: transfer.destination_employee_id,
              location_id: transfer.destination_location_id,
            }
          : {
              type: transfer.origin_type,
              employee_id: transfer.origin_employee_id,
              location_id: transfer.origin_location_id,
            };
      const totals = transferItemsByTransferId.get(transfer.id) ?? {
        equipmentCount: 0,
        toolQuantity: 0,
        itemCount: 0,
      };

      return {
        transfer_id: transfer.id,
        transfer_number: transfer.transfer_number,
        transfer_date: transfer.transfer_date,
        transfer_time: transfer.transfer_time,
        direction,
        counterpart_label: buildEndpointLabel(counterpartEndpoint),
        item_count: totals.itemCount,
        equipment_count: totals.equipmentCount,
        tool_quantity: totals.toolQuantity,
      } satisfies EmployeeTransferHistoryEntry;
    })
    .sort((left, right) => {
      const leftStamp = `${left.transfer_date}T${left.transfer_time}`;
      const rightStamp = `${right.transfer_date}T${right.transfer_time}`;
      return rightStamp.localeCompare(leftStamp);
    });

  const employeeCompanyName =
    employeeCompanyById.get(employeeResult.data.employee_company_id) ??
    employeeResult.data.employee_company_id;

  return {
    employee: employeeResult.data as Employee,
    company_name: profile.company_name ?? "Empresa",
    employee_company_name: employeeCompanyName,
    equipments: employeeEquipments,
    tools: employeeTools,
    history,
    equipment_count: employeeEquipments.length,
    tool_quantity: employeeTools.reduce((sum, item) => sum + item.cantidad, 0),
  };
}

export async function createEmployeeForCurrentCompanyAdmin(input: EmployeeInput): Promise<Employee> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const employeeCompany = await ensureEmployeeCompanyForCurrentCompanyAdmin(input.empresa);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      company_id: companyId,
      employee_company_id: employeeCompany.id,
      rut: normalizeText(input.rut).toUpperCase(),
      nombres: normalizeText(input.nombres),
      apellidos: normalizeText(input.apellidos),
      email: input.email?.trim() || null,
      telefono: input.telefono?.trim() || null,
      is_active: input.is_active,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el empleado.");
  }

  return data as Employee;
}

export async function updateEmployeeForCurrentCompanyAdmin(
  input: EmployeeInput & { id: string },
): Promise<Employee> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const employeeCompany = await ensureEmployeeCompanyForCurrentCompanyAdmin(input.empresa);

  const supabase = await createServerSupabaseClient();
  const { data: currentEmployee, error: currentEmployeeError } = await supabase
    .from("employees")
    .select("id, is_active")
    .eq("id", input.id)
    .eq("company_id", companyId)
    .single();

  if (currentEmployeeError || !currentEmployee) {
    throw new Error(currentEmployeeError?.message ?? "Employee not found.");
  }

  if (currentEmployee.is_active && !input.is_active) {
    await ensureEmployeeCanBeDeactivated(input.id, companyId, supabase);
  }

  const { data, error } = await supabase
    .from("employees")
    .update({
      employee_company_id: employeeCompany.id,
      rut: normalizeText(input.rut).toUpperCase(),
      nombres: normalizeText(input.nombres),
      apellidos: normalizeText(input.apellidos),
      email: input.email?.trim() || null,
      telefono: input.telefono?.trim() || null,
      is_active: input.is_active,
    })
    .eq("id", input.id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el empleado.");
  }

  return data as Employee;
}

export async function deleteEmployeeForCurrentCompanyAdmin(id: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();

  const supabase = await createServerSupabaseClient();
  const [employeeTransfersResult] = await Promise.all([
    supabase
      .from("employee_transfers")
      .select("id")
      .eq("company_id", companyId)
      .or(`origin_employee_id.eq.${id},destination_employee_id.eq.${id}`),
  ]);

  if (employeeTransfersResult.error) {
    throw new Error(employeeTransfersResult.error.message);
  }

  if ((employeeTransfersResult.data ?? []).length > 0) {
    throw new Error("No se puede eliminar un empleado que participa en traspasos.");
  }

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
