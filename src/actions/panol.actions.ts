"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import {
  toolCustomFieldSchema,
  toolGroupSchema,
  toolSchema,
} from "@/schemas/panol.schema";
import {
  createTool,
  createToolCustomField,
  createToolGroup,
  deleteTool,
  deleteToolCustomField,
  reorderToolCustomField,
  updateTool,
  updateToolCustomField,
} from "@/services/panol.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function extractCustomFieldValues(formData: FormData) {
  const values: Record<string, string | null> = {};

  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("custom_field_")) {
      continue;
    }

    const fieldId = key.slice("custom_field_".length);
    const value = rawValue instanceof File ? null : String(rawValue).trim();
    values[fieldId] = value && value.length > 0 ? value : null;
  }

  return values;
}

export async function createToolGroupAction(formData: FormData) {
  const returnTo = "/company/panol/herramientas?tab=grupos";

  try {
    const parsed = toolGroupSchema.parse({
      codigo: formData.get("codigo"),
      descripcion: formData.get("descripcion"),
    });

    await createToolGroup(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el grupo de herramientas."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Grupo de herramientas creado correctamente."));
}

export async function createToolAction(formData: FormData) {
  const returnTo = "/company/panol/herramientas?tab=herramientas";

  try {
    const imageFile = formData.get("image_file");
    const parsed = toolSchema.parse({
      tool_group_id: formData.get("tool_group_id"),
      ubicacion_id: formData.get("ubicacion_id"),
      codigo: formData.get("codigo"),
      descripcion: formData.get("descripcion"),
      cantidad: formData.get("cantidad"),
      unidad: formData.get("unidad"),
      marca: String(formData.get("marca") ?? "").trim() || null,
      modelo: String(formData.get("modelo") ?? "").trim() || null,
    });

    await createTool(
      parsed,
      extractCustomFieldValues(formData),
      imageFile instanceof File ? imageFile : null,
    );
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear la herramienta."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Herramienta creada correctamente."));
}

export async function updateToolAction(formData: FormData) {
  const returnTo = "/company/panol/herramientas?tab=herramientas";

  try {
    const imageFile = formData.get("image_file");
    const parsed = toolSchema.parse({
      tool_group_id: formData.get("tool_group_id"),
      ubicacion_id: formData.get("ubicacion_id"),
      codigo: formData.get("codigo"),
      descripcion: formData.get("descripcion"),
      cantidad: formData.get("cantidad"),
      unidad: formData.get("unidad"),
      marca: String(formData.get("marca") ?? "").trim() || null,
      modelo: String(formData.get("modelo") ?? "").trim() || null,
    });

    await updateTool(
      {
        id: String(formData.get("tool_id") ?? ""),
        ...parsed,
        image_url: String(formData.get("current_image_url") ?? "").trim() || null,
        image_dropbox_path:
          String(formData.get("current_image_dropbox_path") ?? "").trim() || null,
      },
      extractCustomFieldValues(formData),
      imageFile instanceof File ? imageFile : null,
    );
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar la herramienta."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Herramienta actualizada correctamente."));
}

export async function deleteToolAction(formData: FormData) {
  const returnTo = "/company/panol/herramientas?tab=herramientas";

  try {
    const toolId = String(formData.get("tool_id") ?? "").trim();

    if (!toolId) {
      throw new Error("Tool id is required.");
    }

    await deleteTool(toolId);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo eliminar la herramienta."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Herramienta eliminada correctamente."));
}

export async function createToolCustomFieldAction(formData: FormData) {
  const returnTo = "/company/settings/campos-personalizados";

  try {
    const optionsRaw = String(formData.get("options") ?? "");
    const options = optionsRaw
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    const parsed = toolCustomFieldSchema.parse({
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      field_type: formData.get("field_type"),
      options,
      is_required: formData.get("is_required") === "true",
      is_active: formData.get("is_active") === "true",
      sort_order: formData.get("sort_order"),
    });

    await createToolCustomField(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el campo personalizado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(
    buildFlashPath(returnTo, "success", "Campo personalizado creado correctamente."),
  );
}

export async function updateToolCustomFieldAction(formData: FormData) {
  const fieldId = String(formData.get("field_id") ?? "").trim();
  const returnTo = `/company/settings/campos-personalizados${fieldId ? `?field=${fieldId}` : ""}`;

  try {
    const optionsRaw = String(formData.get("options") ?? "");
    const options = optionsRaw
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    const parsed = toolCustomFieldSchema.parse({
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      field_type: formData.get("field_type"),
      options,
      is_required: formData.get("is_required") === "true",
      is_active: formData.get("is_active") === "true",
      sort_order: formData.get("sort_order"),
    });

    if (!fieldId) {
      throw new Error("Field id is required.");
    }

    await updateToolCustomField({
      id: fieldId,
      ...parsed,
    });
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el campo personalizado."),
      ),
    );
  }

  revalidatePath("/company/settings/campos-personalizados");
  redirect(
    buildFlashPath(
      "/company/settings/campos-personalizados",
      "success",
      "Campo personalizado actualizado correctamente.",
    ),
  );
}

export async function deleteToolCustomFieldAction(formData: FormData) {
  const returnTo = "/company/settings/campos-personalizados";

  try {
    const fieldId = String(formData.get("field_id") ?? "").trim();

    if (!fieldId) {
      throw new Error("Field id is required.");
    }

    await deleteToolCustomField(fieldId);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo eliminar el campo personalizado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(
    buildFlashPath(returnTo, "success", "Campo personalizado eliminado correctamente."),
  );
}

export async function reorderToolCustomFieldAction(formData: FormData) {
  const returnTo = "/company/settings/campos-personalizados";

  try {
    const fieldId = String(formData.get("field_id") ?? "").trim();
    const direction = String(formData.get("direction") ?? "").trim();

    if (!fieldId) {
      throw new Error("Field id is required.");
    }

    if (direction !== "up" && direction !== "down") {
      throw new Error("Direction is required.");
    }

    await reorderToolCustomField(fieldId, direction);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo reordenar el campo personalizado."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(
    buildFlashPath(returnTo, "success", "Orden del campo actualizado correctamente."),
  );
}
