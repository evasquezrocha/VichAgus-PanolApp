"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { toolGroupSchema, toolSchema } from "@/schemas/panol.schema";
import { createTool, createToolGroup, deleteTool, updateTool } from "@/services/panol.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
      codigo: formData.get("codigo"),
      descripcion: formData.get("descripcion"),
      cantidad: formData.get("cantidad"),
      unidad: formData.get("unidad"),
      marca: String(formData.get("marca") ?? "").trim() || null,
      modelo: String(formData.get("modelo") ?? "").trim() || null,
    });

    await createTool(parsed, imageFile instanceof File ? imageFile : null);
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
