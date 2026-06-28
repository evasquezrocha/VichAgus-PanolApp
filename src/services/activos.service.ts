import "server-only";

import { ASSET_CATALOG_FIELD_KEYS } from "@/lib/activos";
import { deleteFileFromStorage, uploadFileToStorage } from "@/lib/storage";
import {
  createAssetForCurrentCompanyAdmin,
  createAssetDocumentForCurrentCompanyAdmin,
  deleteAssetDocumentForCurrentCompanyAdmin,
  ensureAssetCatalogOptionForCompany,
  ensureAssetDocumentTypeForCompany,
  getAssetByIdForCurrentCompanyAdmin,
  getAssetByIdForPublicQr,
  getAssetDocumentByIdForCurrentCompanyAdmin,
  listAssetCatalogOptionsForCurrentCompanyAdmin,
  listAssetDocumentTypesForCurrentCompanyAdmin,
  listAssetDocumentsForCurrentCompanyAdmin,
  listAssetsForCurrentCompanyAdmin,
  listVisibleAssetDocumentsForPublicQr,
  updateAssetDocumentForCurrentCompanyAdmin,
  updateAssetForCurrentCompanyAdmin,
} from "@/server/dal/activos.dal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type { AssetDocumentFormInput, AssetFormInput } from "@/schemas/activos.schema";
import type { AssetDocument } from "@/types/activos";

function getStorageBaseFolder() {
  return (process.env.STORAGE_BASE_FOLDER ?? "/PanolApp").replace(/\/$/, "");
}

function parseOptionalNumber(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Uno de los valores numericos es invalido.");
  }

  return parsed;
}

async function getAssetImagesFolder(companyId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Company slug could not be resolved.");
  }

  return `${getStorageBaseFolder()}/${data.slug}/Activos`;
}

async function getAssetDocumentsFolder(companyId: string, assetId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Company slug could not be resolved.");
  }

  const asset = await getAssetByIdForCurrentCompanyAdmin(assetId);

  if (!asset) {
    throw new Error("El activo no existe.");
  }

  return `${getStorageBaseFolder()}/${data.slug}/Activos/${asset.af}/Documentacion`;
}

export async function listAssets() {
  return listAssetsForCurrentCompanyAdmin();
}

export async function listAssetCatalogOptions() {
  return listAssetCatalogOptionsForCurrentCompanyAdmin();
}

export async function listAssetDocumentTypes() {
  return listAssetDocumentTypesForCurrentCompanyAdmin();
}

export async function listAssetDocuments(assetId: string): Promise<AssetDocument[]> {
  return listAssetDocumentsForCurrentCompanyAdmin(assetId);
}

export async function getAssetById(assetId: string) {
  return getAssetByIdForCurrentCompanyAdmin(assetId);
}

export async function getPublicAssetById(assetId: string) {
  return getAssetByIdForPublicQr(assetId);
}

export async function listVisibleAssetDocuments(assetId: string) {
  return listVisibleAssetDocumentsForPublicQr(assetId);
}

export async function createAsset(input: AssetFormInput, imageFile?: File | null) {
  const currentProfile = await requireCompanyAdmin();
  const companyId = currentProfile.company_id;

  if (!companyId) {
    throw new Error("Current user is not assigned to a company.");
  }

  let imageUrl: string | null = null;
  let imageStoragePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToStorage(imageFile, await getAssetImagesFolder(companyId));
    imageUrl = uploaded.url;
    imageStoragePath = uploaded.path;
  }

  await Promise.all(
    ASSET_CATALOG_FIELD_KEYS.map((fieldKey) =>
      ensureAssetCatalogOptionForCompany(companyId, fieldKey, input[fieldKey]),
    ),
  );

  return createAssetForCurrentCompanyAdmin({
    af: input.af.trim().toUpperCase(),
    patente: input.patente.trim().toUpperCase(),
    tipo: input.tipo.trim(),
    marca: input.marca.trim(),
    modelo: input.modelo.trim(),
    anio: input.anio.trim(),
    centro_costos: input.centro_costos.trim(),
    id_gps: input.id_gps?.trim() || null,
    horometro: parseOptionalNumber(input.horometro),
    kilometraje: parseOptionalNumber(input.kilometraje),
    image_url: imageUrl,
    image_storage_path: imageStoragePath,
  });
}

export async function updateAsset(
  input: AssetFormInput & {
    id: string;
    image_url: string | null;
    image_storage_path: string | null;
  },
  imageFile?: File | null,
) {
  const currentProfile = await requireCompanyAdmin();
  const companyId = currentProfile.company_id;

  if (!companyId) {
    throw new Error("Current user is not assigned to a company.");
  }

  let imageUrl = input.image_url;
  let imageStoragePath = input.image_storage_path;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToStorage(imageFile, await getAssetImagesFolder(companyId));
    imageUrl = uploaded.url;
    imageStoragePath = uploaded.path;
  }

  await Promise.all(
    ASSET_CATALOG_FIELD_KEYS.map((fieldKey) =>
      ensureAssetCatalogOptionForCompany(companyId, fieldKey, input[fieldKey]),
    ),
  );

  return updateAssetForCurrentCompanyAdmin({
    id: input.id,
    af: input.af.trim().toUpperCase(),
    patente: input.patente.trim().toUpperCase(),
    tipo: input.tipo.trim(),
    marca: input.marca.trim(),
    modelo: input.modelo.trim(),
    anio: input.anio.trim(),
    centro_costos: input.centro_costos.trim(),
    id_gps: input.id_gps?.trim() || null,
    horometro: parseOptionalNumber(input.horometro),
    kilometraje: parseOptionalNumber(input.kilometraje),
    image_url: imageUrl,
    image_storage_path: imageStoragePath,
  });
}

function parseAssetDocumentFormInput(input: AssetDocumentFormInput) {
  const noticeDays = Number(input.notice_days);

  if (!Number.isInteger(noticeDays) || noticeDays < 0) {
    throw new Error("El aviso previo debe ser un numero entero valido.");
  }

  const expirationDate = input.expiration_date.trim();

  if (expirationDate && !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    throw new Error("La fecha de vencimiento no es valida.");
  }

  return {
    document_type: input.document_type.trim(),
    category: input.category.trim(),
    visible_qr: input.visible_qr === "true",
    expiration_date: expirationDate || null,
    notice_days: noticeDays,
  };
}

export async function createAssetDocument(
  assetId: string,
  input: AssetDocumentFormInput,
  file: File | null,
) {
  const currentProfile = await requireCompanyAdmin();
  const companyId = currentProfile.company_id;

  if (!companyId) {
    throw new Error("Current user is not assigned to a company.");
  }

  if (!file || file.size === 0) {
    throw new Error("Debes seleccionar un archivo para el documento.");
  }

  const asset = await getAssetByIdForCurrentCompanyAdmin(assetId);

  if (!asset) {
    throw new Error("El activo no existe.");
  }

  const parsed = parseAssetDocumentFormInput(input);
  const documentType = await ensureAssetDocumentTypeForCompany(companyId, parsed.document_type);
  const uploaded = await uploadFileToStorage(file, await getAssetDocumentsFolder(companyId, assetId));

  return createAssetDocumentForCurrentCompanyAdmin({
    asset_id: assetId,
    document_type_id: documentType.id,
    category: parsed.category,
    visible_qr: parsed.visible_qr,
    expiration_date: parsed.expiration_date,
    notice_days: parsed.notice_days,
    file_url: uploaded.url ?? "",
    file_storage_path: uploaded.path,
    file_name: file.name,
  });
}

export async function updateAssetDocument(
  documentId: string,
  input: AssetDocumentFormInput,
  file?: File | null,
) {
  const currentProfile = await requireCompanyAdmin();
  const companyId = currentProfile.company_id;

  if (!companyId) {
    throw new Error("Current user is not assigned to a company.");
  }

  const existingDocument = await getAssetDocumentByIdForCurrentCompanyAdmin(documentId);

  if (!existingDocument) {
    throw new Error("El documento no existe.");
  }

  const asset = await getAssetByIdForCurrentCompanyAdmin(existingDocument.asset_id);

  if (!asset) {
    throw new Error("El activo no existe.");
  }

  const parsed = parseAssetDocumentFormInput(input);
  const documentType = await ensureAssetDocumentTypeForCompany(companyId, parsed.document_type);

  let fileUrl = existingDocument.file_url;
  let fileStoragePath = existingDocument.file_storage_path;
  let fileName = existingDocument.file_name;

  if (file && file.size > 0) {
    const uploaded = await uploadFileToStorage(file, await getAssetDocumentsFolder(companyId, asset.id));
    fileUrl = uploaded.url ?? "";
    fileStoragePath = uploaded.path;
    fileName = file.name;
    await deleteFileFromStorage(existingDocument.file_storage_path).catch(() => undefined);
  }

  return updateAssetDocumentForCurrentCompanyAdmin({
    id: documentId,
    document_type_id: documentType.id,
    category: parsed.category,
    visible_qr: parsed.visible_qr,
    expiration_date: parsed.expiration_date,
    notice_days: parsed.notice_days,
    file_url: fileUrl,
    file_storage_path: fileStoragePath,
    file_name: fileName,
  });
}

export async function deleteAssetDocument(documentId: string) {
  const existingDocument = await getAssetDocumentByIdForCurrentCompanyAdmin(documentId);

  if (!existingDocument) {
    throw new Error("El documento no existe.");
  }

  await deleteAssetDocumentForCurrentCompanyAdmin(documentId);
  await deleteFileFromStorage(existingDocument.file_storage_path).catch(() => undefined);
}
