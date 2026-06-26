import "server-only";

import {
  createEmployeeForCurrentCompanyAdmin,
  deleteEmployeeForCurrentCompanyAdmin,
  getEmployeeDetailForCurrentCompanyAdmin,
  listEmployeeCompaniesForCurrentCompanyAdmin,
  listEmployeesForCurrentCompanyAdmin,
  updateEmployeeForCurrentCompanyAdmin,
} from "@/server/dal/empleados.dal";
import type { EmployeeInput } from "@/schemas/empleados.schema";

export async function listEmployeeCompanies() {
  return listEmployeeCompaniesForCurrentCompanyAdmin();
}

export async function listEmployees() {
  return listEmployeesForCurrentCompanyAdmin();
}

export async function getEmployeeDetail(employeeId: string) {
  return getEmployeeDetailForCurrentCompanyAdmin(employeeId);
}

export async function createEmployee(input: EmployeeInput) {
  return createEmployeeForCurrentCompanyAdmin(input);
}

export async function updateEmployee(input: EmployeeInput & { id: string }) {
  return updateEmployeeForCurrentCompanyAdmin(input);
}

export async function deleteEmployee(id: string) {
  return deleteEmployeeForCurrentCompanyAdmin(id);
}
