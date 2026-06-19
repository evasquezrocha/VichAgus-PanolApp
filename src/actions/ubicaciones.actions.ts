"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { ubicacionSchema } from "@/schemas/ubicaciones.schema";
import {
  createPanolLocation,
  updatePanolLocation,
} from "@/services/ubicaciones.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseResponsibleUserId(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createUbicacionAction(formData: FormData) {
  const returnTo = "/company/panol/ubicaciones";

  try {
    const parsed = ubicacionSchema.parse({
      nombre: formData.get("nombre"),
      responsible_user_id:
        parseResponsibleUserId(formData.get("responsible_user_id")) ?? null,
    });

    await createPanolLocation(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear la ubicación."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Ubicación creada correctamente."));
}

export async function updateUbicacionAction(formData: FormData) {
  const returnTo = "/company/panol/ubicaciones";

  try {
    const ubicacionId = String(formData.get("ubicacion_id") ?? "").trim();

    if (!ubicacionId) {
      throw new Error("Location id is required.");
    }

    const parsed = ubicacionSchema.parse({
      nombre: formData.get("nombre"),
      responsible_user_id:
        parseResponsibleUserId(formData.get("responsible_user_id")) ?? null,
    });

    await updatePanolLocation({
      id: ubicacionId,
      ...parsed,
    });
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar la ubicación."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Ubicación actualizada correctamente."));
}
