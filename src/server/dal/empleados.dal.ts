import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCompanyAdmin, requireCurrentProfile } from "@/server/auth/guards";
import type { EmployeeInput } from "@/schemas/empleados.schema";
import type { Employee, EmployeeCompany } from "@/types/empleados";

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
