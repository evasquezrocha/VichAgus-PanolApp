import "server-only";

import { uploadFileToDropbox } from "@/lib/dropbox";
import { ASSET_CATALOG_FIELD_KEYS } from "@/lib/activos";
import {
  createAssetForCurrentCompanyAdmin,
  ensureAssetCatalogOptionForCompany,
  getAssetByIdForCurrentCompanyAdmin,
  listAssetCatalogOptionsForCurrentCompanyAdmin,
  listAssetsForCurrentCompanyAdmin,
} from "@/server/dal/activos.dal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type { AssetFormInput } from "@/schemas/activos.schema";

function getDropboxBaseFolder() {
  return (process.env.DROPBOX_BASE_FOLDER ?? "/PanolApp").replace(/\/$/, "");
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

  return `${getDropboxBaseFolder()}/${data.slug}/Activos`;
}

export async function listAssets() {
  return listAssetsForCurrentCompanyAdmin();
}

export async function listAssetCatalogOptions() {
  return listAssetCatalogOptionsForCurrentCompanyAdmin();
}

export async function getAssetById(assetId: string) {
  return getAssetByIdForCurrentCompanyAdmin(assetId);
}

export async function createAsset(input: AssetFormInput, imageFile?: File | null) {
  const currentProfile = await requireCompanyAdmin();
  const companyId = currentProfile.company_id;

  if (!companyId) {
    throw new Error("Current user is not assigned to a company.");
  }

  let imageUrl: string | null = null;
  let imageDropboxPath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToDropbox(imageFile, await getAssetImagesFolder(companyId));
    imageUrl = uploaded.url;
    imageDropboxPath = uploaded.path;
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
    image_dropbox_path: imageDropboxPath,
  });
}
