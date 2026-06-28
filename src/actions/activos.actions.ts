"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import {
  assetDocumentCategorySchema,
  assetDocumentFormSchema,
  assetFormSchema,
} from "@/schemas/activos.schema";
import {
  createAsset,
  createAssetDocumentCategory,
  createAssetDocument,
  deleteAssetDocument,
  deleteAssetDocumentCategory,
  updateAssetDocument,
  updateAssetDocumentCategory,
  updateAsset,
} from "@/services/activos.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAssetAction(formData: FormData) {
  const returnTo = "/company/activos/listado-de-activos";

  try {
    const parsed = assetFormSchema.parse({
      af: formData.get("af"),
      patente: formData.get("patente"),
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      anio: formData.get("anio"),
      centro_costos: formData.get("centro_costos"),
      id_gps: formData.get("id_gps"),
      horometro: formData.get("horometro"),
      kilometraje: formData.get("kilometraje"),
    });
    const imageFile = formData.get("image_file");

    await createAsset(parsed, imageFile instanceof File ? imageFile : null);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Activo creado correctamente."));
}

export async function updateAssetAction(formData: FormData) {
  const assetId = String(formData.get("asset_id") ?? "").trim();
  const returnTo = assetId ? `/company/activos/${assetId}` : "/company/activos/listado-de-activos";

  try {
    if (!assetId) {
      throw new Error("Asset id is required.");
    }

    const parsed = assetFormSchema.parse({
      af: formData.get("af"),
      patente: formData.get("patente"),
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      anio: formData.get("anio"),
      centro_costos: formData.get("centro_costos"),
      id_gps: formData.get("id_gps"),
      horometro: formData.get("horometro"),
      kilometraje: formData.get("kilometraje"),
    });
    const imageFile = formData.get("image_file");

    await updateAsset(
      {
        id: assetId,
        ...parsed,
        image_url: String(formData.get("current_image_url") ?? "").trim() || null,
        image_storage_path:
          String(formData.get("current_image_storage_path") ?? "").trim() || null,
      },
      imageFile instanceof File ? imageFile : null,
    );
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  revalidatePath("/company/activos/listado-de-activos");
  redirect(buildFlashPath(returnTo, "success", "Activo actualizado correctamente."));
}

export async function createAssetDocumentAction(formData: FormData) {
  const assetId = String(formData.get("asset_id") ?? "").trim();
  const returnTo = assetId
    ? `/company/activos/${assetId}?tab=documentacion`
    : "/company/activos/listado-de-activos";

  try {
    if (!assetId) {
      throw new Error("Asset id is required.");
    }

    const parsed = assetDocumentFormSchema.parse({
      document_type: formData.get("document_type"),
      category: formData.get("category"),
      visible_qr: String(formData.get("visible_qr") ?? "false"),
      expiration_date: formData.get("expiration_date"),
      notice_days: formData.get("notice_days"),
    });
    const file = formData.get("document_file");

    await createAssetDocument(assetId, parsed, file instanceof File ? file : null);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo subir el documento del activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  revalidatePath("/company/activos/listado-de-activos");
  revalidatePath(`/qr/activos/${assetId}`);
  redirect(buildFlashPath(returnTo, "success", "Documento cargado correctamente."));
}

export async function updateAssetDocumentAction(formData: FormData) {
  const assetId = String(formData.get("asset_id") ?? "").trim();
  const documentId = String(formData.get("document_id") ?? "").trim();
  const returnTo = assetId
    ? `/company/activos/${assetId}?tab=documentacion`
    : "/company/activos/listado-de-activos";

  try {
    if (!assetId || !documentId) {
      throw new Error("Document id is required.");
    }

    const parsed = assetDocumentFormSchema.parse({
      document_type: formData.get("document_type"),
      category: formData.get("category"),
      visible_qr: String(formData.get("visible_qr") ?? "false"),
      expiration_date: formData.get("expiration_date"),
      notice_days: formData.get("notice_days"),
    });
    const file = formData.get("document_file");

    await updateAssetDocument(documentId, parsed, file instanceof File ? file : null);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar el documento del activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  revalidatePath("/company/activos/listado-de-activos");
  revalidatePath(`/qr/activos/${assetId}`);
  redirect(buildFlashPath(returnTo, "success", "Documento actualizado correctamente."));
}

export async function deleteAssetDocumentAction(formData: FormData) {
  const assetId = String(formData.get("asset_id") ?? "").trim();
  const documentId = String(formData.get("document_id") ?? "").trim();
  const returnTo = assetId
    ? `/company/activos/${assetId}?tab=documentacion`
    : "/company/activos/listado-de-activos";

  try {
    if (!assetId || !documentId) {
      throw new Error("Document id is required.");
    }

    await deleteAssetDocument(documentId);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo eliminar el documento del activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  revalidatePath("/company/activos/listado-de-activos");
  revalidatePath(`/qr/activos/${assetId}`);
  redirect(buildFlashPath(returnTo, "success", "Documento eliminado correctamente."));
}

export async function createAssetDocumentCategoryAction(formData: FormData) {
  const returnTo = "/company/activos/ajustes/documentacion";

  try {
    const parsed = assetDocumentCategorySchema.parse({
      name: formData.get("name"),
    });

    await createAssetDocumentCategory(parsed.name);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear la categoria."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Categoria creada correctamente."));
}

export async function updateAssetDocumentCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const returnTo = "/company/activos/ajustes/documentacion";

  try {
    if (!categoryId) {
      throw new Error("Category id is required.");
    }

    const parsed = assetDocumentCategorySchema.parse({
      name: formData.get("name"),
    });

    await updateAssetDocumentCategory(categoryId, parsed.name);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo actualizar la categoria."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Categoria actualizada correctamente."));
}

export async function deleteAssetDocumentCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const returnTo = "/company/activos/ajustes/documentacion";

  try {
    if (!categoryId) {
      throw new Error("Category id is required.");
    }

    await deleteAssetDocumentCategory(categoryId);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo eliminar la categoria."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Categoria eliminada correctamente."));
}
