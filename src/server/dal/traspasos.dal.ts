import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/permissions";
import type { CurrentProfile } from "@/types/auth";
import type {
  EmployeeTransfer,
  EmployeeTransferItem,
  TransferEquipmentRow,
  TransferLocationSummary,
  TransferToolRow,
  TransferUserSummary,
} from "@/types/traspasos";
import type { Equipment } from "@/types/equipos";
import type { Tool } from "@/types/panol";
import { isInactiveItemStatus } from "@/lib/item-status";

type TransferItemInput =
  | { item_type: "equipment"; equipment_id: string; quantity?: never; tool_id?: never }
  | { item_type: "tool"; tool_id: string; quantity: number; equipment_id?: never };

type TransferEndpointInput =
  | { type: "employee"; employee_id: string; location_id?: never }
  | { type: "location"; location_id: string; employee_id?: never };

function isTransferAdmin(profile: CurrentProfile) {
  return (
    hasPermission(profile, "platform.manage") ||
    hasPermission(profile, "company.users.manage")
  );
}

async function getTransferContext() {
  const profile = await requireCurrentProfile();

  if (!profile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return {
    profile,
    companyId: profile.company_id,
    isAdmin: isTransferAdmin(profile),
  };
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

export async function listTransferEquipmentsForCurrentCompanyAdmin(): Promise<
  TransferEquipmentRow[]
> {
  const { companyId } = await getTransferContext();
  const admin = await createServerSupabaseClient();

  const [equipmentsResult, assignmentsResult, employeesResult] = await Promise.all([
    admin.from("equipments").select("*").eq("company_id", companyId).order("codigo", { ascending: true }),
    admin
      .from("employee_equipment_assignments")
      .select("equipment_id, employee_id")
      .eq("company_id", companyId),
    admin.from("employees").select("id, nombres, apellidos, rut").eq("company_id", companyId),
  ]);

  if (equipmentsResult.error) {
    throw new Error(equipmentsResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }

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
  const assignmentByEquipmentId = new Map<string, { employee_id: string | null }>(
    (assignmentsResult.data ?? []).map((assignment) => [
      assignment.equipment_id,
      assignment,
    ]),
  );

  return (equipmentsResult.data ?? []).map((equipment) => {
    const assignment = assignmentByEquipmentId.get(equipment.id);
    const employee = assignment?.employee_id
      ? employeeById.get(assignment.employee_id)
      : null;

    return {
      ...(equipment as Equipment),
      current_employee_id: assignment?.employee_id ?? null,
      current_employee_name: buildEmployeeName(employee),
    };
  });
}

export async function listTransferToolsForCurrentCompanyAdmin(): Promise<TransferToolRow[]> {
  const { companyId } = await getTransferContext();
  const admin = await createServerSupabaseClient();

  const [toolsResult, allocationsResult] = await Promise.all([
    admin.from("tools").select("*").eq("company_id", companyId).order("codigo", { ascending: true }),
    admin
      .from("employee_tool_allocations")
      .select("tool_id, employee_id, quantity")
      .eq("company_id", companyId),
  ]);

  if (toolsResult.error) {
    throw new Error(toolsResult.error.message);
  }

  if (allocationsResult.error) {
    throw new Error(allocationsResult.error.message);
  }

  const allocationsByToolId = new Map<
    string,
    { assigned: number; unassigned: number }
  >();
  const allocationsListByToolId = new Map<
    string,
    Array<{ employee_id: string | null; quantity: number }>
  >();

  for (const allocation of allocationsResult.data ?? []) {
    const current = allocationsByToolId.get(allocation.tool_id) ?? {
      assigned: 0,
      unassigned: 0,
    };

    if (allocation.employee_id) {
      current.assigned += allocation.quantity;
    } else {
      current.unassigned += allocation.quantity;
    }

    allocationsByToolId.set(allocation.tool_id, current);

    const list = allocationsListByToolId.get(allocation.tool_id) ?? [];
    list.push({
      employee_id: allocation.employee_id,
      quantity: allocation.quantity,
    });
    allocationsListByToolId.set(allocation.tool_id, list);
  }

  return (toolsResult.data ?? []).map((tool) => {
    const allocation = allocationsByToolId.get(tool.id) ?? {
      assigned: 0,
      unassigned: 0,
    };

    return {
      ...(tool as Tool),
      assigned_quantity: allocation.assigned,
      unassigned_quantity: allocation.unassigned,
      allocations: allocationsListByToolId.get(tool.id) ?? [],
    };
  });
}

async function listLocationResponsibilityMap(companyId: string) {
  const admin = await createServerSupabaseClient();
  const { data, error } = await admin
    .from("panol_locations")
    .select("id, responsible_user_id")
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return new Map<string, string | null>(
    (data ?? []).map((location) => [location.id, location.responsible_user_id]),
  );
}

async function listLocationUsersById(companyId: string) {
  const admin = await createServerSupabaseClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return new Map<string, TransferUserSummary>(
    (data ?? []).map((user) => [
      user.id,
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    ]),
  );
}

async function buildTransferNumberMap(companyId: string) {
  const admin = await createServerSupabaseClient();
  const { data, error } = await admin
    .from("employee_transfers")
    .select("id, transfer_number, transfer_date, transfer_time, created_at")
    .eq("company_id", companyId)
    .order("transfer_date", { ascending: true })
    .order("transfer_time", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const transferNumberById = new Map<string, number>();
  let nextTransferNumber = 1;

  for (const transfer of data ?? []) {
    const parsedTransferNumber =
      transfer.transfer_number === null || transfer.transfer_number === undefined
        ? null
        : Number(transfer.transfer_number);
    const transferNumber =
      parsedTransferNumber !== null && Number.isFinite(parsedTransferNumber)
        ? parsedTransferNumber
        : nextTransferNumber;

    transferNumberById.set(transfer.id, transferNumber);
    nextTransferNumber = Math.max(nextTransferNumber, transferNumber + 1);
  }

  return transferNumberById;
}

async function ensureTransferItemsAreActive(
  companyId: string,
  items: TransferItemInput[],
) {
  const admin = await createServerSupabaseClient();
  const equipmentIds = items
    .filter((item): item is Extract<TransferItemInput, { item_type: "equipment" }> => item.item_type === "equipment")
    .map((item) => item.equipment_id);
  const toolIds = items
    .filter((item): item is Extract<TransferItemInput, { item_type: "tool" }> => item.item_type === "tool")
    .map((item) => item.tool_id);

  if (equipmentIds.length > 0) {
    const { data, error } = await admin
      .from("equipments")
      .select("id, estado")
      .eq("company_id", companyId)
      .in("id", equipmentIds);

    if (error) {
      throw new Error(error.message);
    }

    const inactiveEquipmentIds = (data ?? [])
      .filter((equipment) => isInactiveItemStatus(equipment.estado))
      .map((equipment) => equipment.id);

    if (inactiveEquipmentIds.length > 0) {
      throw new Error("No se pueden usar equipos inactivos en un traspaso.");
    }
  }

  if (toolIds.length > 0) {
    const { data, error } = await admin
      .from("tools")
      .select("id, estado")
      .eq("company_id", companyId)
      .in("id", toolIds);

    if (error) {
      throw new Error(error.message);
    }

    const inactiveToolIds = (data ?? [])
      .filter((tool) => isInactiveItemStatus(tool.estado))
      .map((tool) => tool.id);

    if (inactiveToolIds.length > 0) {
      throw new Error("No se pueden usar herramientas inactivas en un traspaso.");
    }
  }
}

export async function listEmployeeTransfersForCurrentCompanyAdmin(): Promise<
  EmployeeTransfer[]
> {
  const { companyId } = await getTransferContext();
  const admin = await createServerSupabaseClient();

  const transfersResult = await admin
    .from("employee_transfers")
    .select("*")
    .eq("company_id", companyId)
    .order("transfer_date", { ascending: false })
    .order("transfer_time", { ascending: false });

  if (transfersResult.error) {
    throw new Error(transfersResult.error.message);
  }

  const transferNumberById = await buildTransferNumberMap(companyId);

  const transferIds = (transfersResult.data ?? []).map((transfer) => transfer.id);

  if (transferIds.length === 0) {
    return [];
  }

  const [
    itemsResult,
    employeesResult,
    locationsResult,
    equipmentsResult,
    toolsResult,
    usersById,
  ] = await Promise.all([
    admin.from("employee_transfer_items").select("*").in("transfer_id", transferIds),
    admin.from("employees").select("id, nombres, apellidos, rut").eq("company_id", companyId),
    admin.from("panol_locations").select("id, nombre, is_default").eq("company_id", companyId),
    admin
      .from("equipments")
      .select(
        "id, codigo, descripcion, tool_group_id, company_id, ubicacion_id, nro_serie, cantidad, estado, marca, modelo, image_url, image_storage_path, created_at, updated_at",
      )
      .eq("company_id", companyId),
    admin
      .from("tools")
      .select(
        "id, codigo, descripcion, tool_group_id, company_id, ubicacion_id, cantidad, unidad, estado, marca, modelo, image_url, image_storage_path, created_at, updated_at",
      )
      .eq("company_id", companyId),
    listLocationUsersById(companyId),
  ]);

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }
  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }
  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }
  if (equipmentsResult.error) {
    throw new Error(equipmentsResult.error.message);
  }
  if (toolsResult.error) {
    throw new Error(toolsResult.error.message);
  }

  const employeeById = new Map(
    (employeesResult.data ?? []).map((employee) => [employee.id, employee]),
  );
  const locationById = new Map<string, TransferLocationSummary>(
    (locationsResult.data ?? []).map((location) => [
      location.id,
      {
        id: location.id,
        nombre: location.nombre,
        is_default: location.is_default,
      },
    ]),
  );
  const equipmentById = new Map(
    (equipmentsResult.data ?? []).map((equipment) => [equipment.id, equipment]),
  );
  const toolById = new Map((toolsResult.data ?? []).map((tool) => [tool.id, tool]));

  const itemsByTransferId = new Map<string, EmployeeTransferItem[]>();

  for (const item of itemsResult.data ?? []) {
    const currentItems = itemsByTransferId.get(item.transfer_id) ?? [];
    const typedItem: EmployeeTransferItem = {
      ...(item as EmployeeTransferItem),
      equipment: item.equipment_id ? (equipmentById.get(item.equipment_id) ?? null) : null,
      tool: item.tool_id ? (toolById.get(item.tool_id) ?? null) : null,
    };
    currentItems.push(typedItem);
    itemsByTransferId.set(item.transfer_id, currentItems);
  }

  return (transfersResult.data ?? []).map((transfer) => ({
    ...(transfer as EmployeeTransfer),
    transfer_number: transferNumberById.get(transfer.id) ?? transfer.transfer_number ?? 0,
    origin_employee: transfer.origin_employee_id
      ? employeeById.get(transfer.origin_employee_id) ?? null
      : null,
    origin_location: transfer.origin_location_id
      ? locationById.get(transfer.origin_location_id) ?? null
      : null,
    destination_employee: transfer.destination_employee_id
      ? employeeById.get(transfer.destination_employee_id) ?? null
      : null,
    destination_location: transfer.destination_location_id
      ? locationById.get(transfer.destination_location_id) ?? null
      : null,
    created_by_user: transfer.created_by_user_id
      ? usersById.get(transfer.created_by_user_id) ?? null
      : null,
    signed_by_user: transfer.signed_by_user_id
      ? usersById.get(transfer.signed_by_user_id) ?? null
      : null,
    items: itemsByTransferId.get(transfer.id) ?? [],
  }));
}

export async function getEmployeeTransferForCurrentCompanyAdmin(
  transferId: string,
): Promise<EmployeeTransfer | null> {
  const { companyId } = await getTransferContext();
  const admin = await createServerSupabaseClient();

  const { data: transfer, error } = await admin
    .from("employee_transfers")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", transferId)
    .single();

  if (error || !transfer) {
    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    return null;
  }

  const transferNumberById = await buildTransferNumberMap(companyId);

  const [itemsResult, employeesResult, locationsResult, equipmentsResult, toolsResult, usersById] =
    await Promise.all([
      admin
        .from("employee_transfer_items")
        .select("*")
        .eq("transfer_id", transfer.id),
      admin.from("employees").select("id, nombres, apellidos, rut").eq("company_id", companyId),
      admin.from("panol_locations").select("id, nombre, is_default").eq("company_id", companyId),
      admin
        .from("equipments")
        .select(
          "id, codigo, descripcion, tool_group_id, company_id, ubicacion_id, nro_serie, cantidad, estado, marca, modelo, image_url, image_storage_path, created_at, updated_at",
        )
        .eq("company_id", companyId),
      admin
        .from("tools")
        .select(
          "id, codigo, descripcion, tool_group_id, company_id, ubicacion_id, cantidad, unidad, estado, marca, modelo, image_url, image_storage_path, created_at, updated_at",
        )
        .eq("company_id", companyId),
      listLocationUsersById(companyId),
    ]);

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }
  if (employeesResult.error) {
    throw new Error(employeesResult.error.message);
  }
  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }
  if (equipmentsResult.error) {
    throw new Error(equipmentsResult.error.message);
  }
  if (toolsResult.error) {
    throw new Error(toolsResult.error.message);
  }

  const employeeById = new Map(
    (employeesResult.data ?? []).map((employee) => [employee.id, employee]),
  );
  const locationById = new Map<string, TransferLocationSummary>(
    (locationsResult.data ?? []).map((location) => [
      location.id,
      {
        id: location.id,
        nombre: location.nombre,
        is_default: location.is_default,
      },
    ]),
  );
  const equipmentById = new Map(
    (equipmentsResult.data ?? []).map((equipment) => [equipment.id, equipment]),
  );
  const toolById = new Map((toolsResult.data ?? []).map((tool) => [tool.id, tool]));

  const items = (itemsResult.data ?? []).map((item) => ({
    ...(item as EmployeeTransferItem),
    equipment: item.equipment_id ? (equipmentById.get(item.equipment_id) ?? null) : null,
    tool: item.tool_id ? (toolById.get(item.tool_id) ?? null) : null,
  }));

  return {
    ...(transfer as EmployeeTransfer),
    transfer_number: transferNumberById.get(transfer.id) ?? transfer.transfer_number ?? 0,
    origin_employee: transfer.origin_employee_id
      ? employeeById.get(transfer.origin_employee_id) ?? null
      : null,
    origin_location: transfer.origin_location_id
      ? locationById.get(transfer.origin_location_id) ?? null
      : null,
    destination_employee: transfer.destination_employee_id
      ? employeeById.get(transfer.destination_employee_id) ?? null
      : null,
    destination_location: transfer.destination_location_id
      ? locationById.get(transfer.destination_location_id) ?? null
      : null,
    created_by_user: transfer.created_by_user_id
      ? usersById.get(transfer.created_by_user_id) ?? null
      : null,
    signed_by_user: transfer.signed_by_user_id
      ? usersById.get(transfer.signed_by_user_id) ?? null
      : null,
    items,
  };
}

function endpointUsesResponsibleLocation(
  endpoint: TransferEndpointInput,
  allowedLocationIds: Set<string>,
) {
  return endpoint.type === "location" && allowedLocationIds.has(endpoint.location_id);
}

export async function createEmployeeTransferForCurrentCompanyAdmin(input: {
  origin: TransferEndpointInput;
  destination: TransferEndpointInput;
  transfer_date: string;
  transfer_time: string;
  signature_data: string;
  observations: string;
  items: TransferItemInput[];
}) {
  const { profile, companyId, isAdmin } = await getTransferContext();
  const admin = await createServerSupabaseClient();

  await ensureTransferItemsAreActive(companyId, input.items);

  if (!isAdmin) {
    const allowedLocationIds = new Set(
      Array.from((await listLocationResponsibilityMap(companyId)).entries())
        .filter(([, responsibleUserId]) => responsibleUserId === profile.id)
        .map(([locationId]) => locationId),
    );

    const canUseOrigin = endpointUsesResponsibleLocation(input.origin, allowedLocationIds);
    const canUseDestination = endpointUsesResponsibleLocation(
      input.destination,
      allowedLocationIds,
    );

    if (!canUseOrigin && !canUseDestination) {
      throw new Error(
        "No tienes permisos para realizar traspasos con estas ubicaciones.",
      );
    }
  }

  const { data, error } = await admin.rpc("create_employee_transfer", {
    p_company_id: companyId,
    p_created_by_user_id: profile.id,
    p_created_by_is_admin: isAdmin,
    p_signed_by_user_id: profile.id,
    p_origin_type: input.origin.type,
    p_origin_employee_id: input.origin.type === "employee" ? input.origin.employee_id : null,
    p_origin_location_id: input.origin.type === "location" ? input.origin.location_id : null,
    p_destination_type: input.destination.type,
    p_destination_employee_id:
      input.destination.type === "employee" ? input.destination.employee_id : null,
    p_destination_location_id:
      input.destination.type === "location" ? input.destination.location_id : null,
    p_transfer_date: input.transfer_date,
    p_transfer_time: input.transfer_time,
    p_signature_data: input.signature_data,
    p_observations: input.observations,
    p_items: input.items,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data as string };
}
