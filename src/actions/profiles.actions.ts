"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import {
  createManagedCompanyUserSchema,
  createCompanyUserSchema,
  updateManagedUserSchema,
  updateUserTemporaryPasswordSchema,
} from "@/schemas/profile.schema";
import {
  createManagedCompanyUser,
  createCompanyUser,
  updateManagedCompanyUser,
  updateManagedPlatformUser,
  updateUserTemporaryPassword,
} from "@/services/profiles.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCompanyUserAction(formData: FormData) {
  const errorReturnTo = "/admin/users?create=1";
  let successReturnTo = "/admin/users";

  try {
    const parsed = createCompanyUserSchema.parse({
      company_id: formData.get("company_id"),
      role_id: formData.get("role_id"),
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      is_active: formData.get("is_active") === "true",
    });

    const profile = await createCompanyUser(parsed);
    successReturnTo = `/admin/users?user=${profile.id}`;
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el usuario."),
      ),
    );
  }

  revalidatePath("/admin/users");
  redirect(buildFlashPath(successReturnTo, "success", "Usuario creado correctamente."));
}

export async function updateUserTemporaryPasswordAction(formData: FormData) {
  try {
    const parsed = updateUserTemporaryPasswordSchema.parse({
      user_id: formData.get("user_id"),
      password: formData.get("password"),
    });

    await updateUserTemporaryPassword(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        "/admin/users",
        "error",
        getActionErrorMessage(error, "No se pudo actualizar la password."),
      ),
    );
  }

  revalidatePath("/admin/users");
  redirect(buildFlashPath("/admin/users", "success", "Password temporal actualizada correctamente."));
}

export async function createManagedCompanyUserAction(formData: FormData) {
  const errorReturnTo = "/company/settings/users?create=1";
  let successReturnTo = "/company/settings/users";

  try {
    const parsed = createManagedCompanyUserSchema.parse({
      role_id: formData.get("role_id"),
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      is_active: formData.get("is_active") === "true",
    });

    const profile = await createManagedCompanyUser(parsed);
    successReturnTo = `/company/settings/users?user=${profile.id}`;
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el usuario."),
      ),
    );
  }

  revalidatePath("/company/settings/users");
  redirect(buildFlashPath(successReturnTo, "success", "Usuario creado correctamente."));
}

export async function updateManagedPlatformUserAction(formData: FormData) {
  const successReturnTo =
    typeof formData.get("return_to") === "string"
      ? String(formData.get("return_to"))
      : "/admin/users";

  try {
    const parsed = updateManagedUserSchema.parse({
      user_id: formData.get("user_id"),
      role_id: formData.get("role_id"),
      full_name: formData.get("full_name") || null,
      email: formData.get("email") || undefined,
      is_active: formData.get("is_active") === "true",
    });

    await updateManagedPlatformUser(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        "/admin/users",
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el usuario."),
      ),
    );
  }

  revalidatePath("/admin/users");
  redirect(buildFlashPath(successReturnTo, "success", "Usuario actualizado correctamente."));
}

export async function updateManagedCompanyUserAction(formData: FormData) {
  const successReturnTo =
    typeof formData.get("return_to") === "string"
      ? String(formData.get("return_to"))
      : "/company/settings/users";

  try {
    const parsed = updateManagedUserSchema.parse({
      user_id: formData.get("user_id"),
      role_id: formData.get("role_id"),
      full_name: formData.get("full_name") || null,
      email: formData.get("email") || undefined,
      is_active: formData.get("is_active") === "true",
    });

    await updateManagedCompanyUser(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        "/company/settings/users",
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el usuario."),
      ),
    );
  }

  revalidatePath("/company/settings/users");
  redirect(buildFlashPath(successReturnTo, "success", "Usuario actualizado correctamente."));
}
