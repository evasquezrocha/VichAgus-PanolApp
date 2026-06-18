"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { roleInputSchema, updateRoleInputSchema } from "@/schemas/role.schema";
import {
  createCompanyRole,
  createGlobalRole,
  updateCompanyRole,
  updateGlobalRole,
} from "@/services/roles.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function resolveSafeReturnTo(
  rawValue: FormDataEntryValue | null,
  fallback: string,
  allowedPrefixes: string[],
) {
  if (typeof rawValue !== "string") {
    return fallback;
  }

  if (allowedPrefixes.some((prefix) => rawValue.startsWith(prefix))) {
    return rawValue;
  }

  return fallback;
}

export async function createGlobalRoleAction(formData: FormData) {
  const errorReturnTo = resolveSafeReturnTo(
    formData.get("return_to"),
    "/admin/roles?create=1",
    ["/admin/roles"],
  );
  let successReturnTo = "/admin/roles";

  try {
    const parsed = roleInputSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      permissions: formData.getAll("permissions"),
      is_active: formData.get("is_active") === "true",
    });

    const role = await createGlobalRole(parsed);
    successReturnTo = `/admin/roles?role=${role.id}`;
    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    revalidatePath("/company/settings/users");
    revalidatePath("/company/settings/roles");
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el rol."),
      ),
    );
  }

  redirect(
    buildFlashPath(successReturnTo, "success", "Rol creado correctamente."),
  );
}

export async function updateGlobalRoleAction(formData: FormData) {
  const roleId =
    typeof formData.get("role_id") === "string"
      ? String(formData.get("role_id"))
      : "";
  const successReturnTo = roleId
    ? `/admin/roles?role=${roleId}`
    : "/admin/roles";
  const errorReturnTo = resolveSafeReturnTo(
    formData.get("return_to"),
    successReturnTo,
    ["/admin/roles"],
  );

  try {
    const parsed = updateRoleInputSchema.parse({
      role_id: formData.get("role_id"),
      name: formData.get("name"),
      description: formData.get("description") || null,
      permissions: formData.getAll("permissions"),
      is_active: formData.get("is_active") === "true",
    });

    await updateGlobalRole(parsed);
    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    revalidatePath("/company/settings/users");
    revalidatePath("/company/settings/roles");
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el rol."),
      ),
    );
  }

  redirect(
    buildFlashPath(
      successReturnTo,
      "success",
      "Rol actualizado correctamente.",
    ),
  );
}

export async function createCompanyRoleAction(formData: FormData) {
  const errorReturnTo = resolveSafeReturnTo(
    formData.get("return_to"),
    "/company/settings/roles?create=1",
    ["/company/settings/roles"],
  );
  let successReturnTo = "/company/settings/roles";

  try {
    const parsed = roleInputSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      permissions: formData.getAll("permissions"),
      is_active: formData.get("is_active") === "true",
    });

    const role = await createCompanyRole(parsed);
    successReturnTo = `/company/settings/roles?role=${role.id}`;
    revalidatePath("/company/settings/roles");
    revalidatePath("/company/settings/users");
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el rol."),
      ),
    );
  }

  redirect(
    buildFlashPath(
      successReturnTo,
      "success",
      "Rol creado correctamente.",
    ),
  );
}

export async function updateCompanyRoleAction(formData: FormData) {
  const roleId =
    typeof formData.get("role_id") === "string"
      ? String(formData.get("role_id"))
      : "";
  const successReturnTo = roleId
    ? `/company/settings/roles?role=${roleId}`
    : "/company/settings/roles";
  const errorReturnTo = resolveSafeReturnTo(
    formData.get("return_to"),
    successReturnTo,
    ["/company/settings/roles"],
  );

  try {
    const parsed = updateRoleInputSchema.parse({
      role_id: formData.get("role_id"),
      name: formData.get("name"),
      description: formData.get("description") || null,
      permissions: formData.getAll("permissions"),
      is_active: formData.get("is_active") === "true",
    });

    await updateCompanyRole(parsed);
    revalidatePath("/company/settings/roles");
    revalidatePath("/company/settings/users");
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el rol."),
      ),
    );
  }

  redirect(
    buildFlashPath(
      successReturnTo,
      "success",
      "Rol actualizado correctamente.",
    ),
  );
}
