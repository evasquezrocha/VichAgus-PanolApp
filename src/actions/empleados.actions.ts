"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { employeeSchema } from "@/schemas/empleados.schema";
import { createEmployee, deleteEmployee, updateEmployee } from "@/services/empleados.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseOptionalString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim() || null;
}

function parseBooleanField(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .some((value) => value === "true" || value === "on");
}

export async function createEmployeeAction(formData: FormData) {
  const returnTo = "/company/panol/empleados";

  try {
    const parsed = employeeSchema.parse({
      rut: formData.get("rut"),
      nombres: formData.get("nombres"),
      apellidos: formData.get("apellidos"),
      empresa: formData.get("empresa"),
      email: parseOptionalString(formData.get("email")),
      telefono: parseOptionalString(formData.get("telefono")),
      is_active: parseBooleanField(formData, "is_active"),
    });

    await createEmployee(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el empleado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Empleado creado correctamente."));
}

export async function updateEmployeeAction(formData: FormData) {
  const returnTo = "/company/panol/empleados";

  try {
    const employeeId = String(formData.get("employee_id") ?? "").trim();

    if (!employeeId) {
      throw new Error("Employee id is required.");
    }

    const parsed = employeeSchema.parse({
      rut: formData.get("rut"),
      nombres: formData.get("nombres"),
      apellidos: formData.get("apellidos"),
      empresa: formData.get("empresa"),
      email: parseOptionalString(formData.get("email")),
      telefono: parseOptionalString(formData.get("telefono")),
      is_active: parseBooleanField(formData, "is_active"),
    });

    await updateEmployee({
      id: employeeId,
      ...parsed,
    });
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el empleado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Empleado actualizado correctamente."));
}

export async function deleteEmployeeAction(formData: FormData) {
  const returnTo = "/company/panol/empleados";

  try {
    const employeeId = String(formData.get("employee_id") ?? "").trim();

    if (!employeeId) {
      throw new Error("Employee id is required.");
    }

    await deleteEmployee(employeeId);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo eliminar el empleado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Empleado eliminado correctamente."));
}
