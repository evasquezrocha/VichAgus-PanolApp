import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type {
  Asset,
  AssetCatalogFieldKey,
  AssetCatalogOption,
  AssetDocument,
  AssetDocumentType,
} from "@/types/activos";

async function getCurrentCompanyIdForCurrentCompanyAdmin() {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current user is not assigned to a company.");
  }

  return currentProfile.company_id;
}

export async function listAssetsForCurrentCompanyAdmin(): Promise<Asset[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("assets")
    .select("*")
    .eq("company_id", companyId)
    .order("af", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Asset[];
}

export async function getAssetByIdForCurrentCompanyAdmin(assetId: string): Promise<Asset | null> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("assets")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as Asset | null;
}

export async function getAssetByIdForPublicQr(assetId: string): Promise<Asset | null> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as Asset | null;
}

export async function listAssetCatalogOptionsForCurrentCompanyAdmin(): Promise<
  Record<AssetCatalogFieldKey, string[]>
> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_catalog_options")
    .select("*")
    .eq("company_id", companyId)
    .order("value", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const grouped: Record<AssetCatalogFieldKey, string[]> = {
    tipo: [],
    marca: [],
    modelo: [],
    anio: [],
    centro_costos: [],
  };

  for (const option of (data ?? []) as AssetCatalogOption[]) {
    grouped[option.field_key].push(option.value);
  }

  return grouped;
}

export async function ensureAssetCatalogOptionForCurrentCompanyAdmin(
  fieldKey: AssetCatalogFieldKey,
  value: string,
) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  return ensureAssetCatalogOptionForCompany(companyId, fieldKey, value);
}

export async function ensureAssetCatalogOptionForCompany(
  companyId: string,
  fieldKey: AssetCatalogFieldKey,
  value: string,
) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return;
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("asset_catalog_options").upsert(
    {
      company_id: companyId,
      field_key: fieldKey,
      value: normalizedValue,
    },
    {
      onConflict: "company_id,field_key,value",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function listAssetDocumentTypesForCurrentCompanyAdmin(): Promise<AssetDocumentType[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_document_types")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssetDocumentType[];
}

export async function ensureAssetDocumentTypeForCompany(companyId: string, name: string) {
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    throw new Error("El tipo de documento es obligatorio.");
  }

  const admin = createSupabaseAdminClient();
  const existing = await admin
    .from("asset_document_types")
    .select("*")
    .eq("company_id", companyId)
    .eq("name", normalizedName)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data) {
    return existing.data as AssetDocumentType;
  }

  const { data, error } = await admin
    .from("asset_document_types")
    .insert({
      company_id: companyId,
      name: normalizedName,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo guardar el tipo de documento.");
  }

  return data as AssetDocumentType;
}

export async function listAssetDocumentsForCurrentCompanyAdmin(
  assetId: string,
): Promise<AssetDocument[]> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_documents")
    .select("*, document_type:asset_document_types(*)")
    .eq("company_id", companyId)
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssetDocument[];
}

export async function listVisibleAssetDocumentsForPublicQr(
  assetId: string,
): Promise<AssetDocument[]> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_documents")
    .select("*, document_type:asset_document_types(*)")
    .eq("asset_id", assetId)
    .eq("visible_qr", true)
    .order("category", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssetDocument[];
}

export async function createAssetDocumentForCurrentCompanyAdmin(input: {
  asset_id: string;
  document_type_id: string;
  category: string;
  visible_qr: boolean;
  expiration_date: string | null;
  notice_days: number;
  file_url: string;
  file_storage_path: string;
  file_name: string;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_documents")
    .insert({
      company_id: companyId,
      asset_id: input.asset_id,
      document_type_id: input.document_type_id,
      category: input.category,
      visible_qr: input.visible_qr,
      expiration_date: input.expiration_date,
      notice_days: input.notice_days,
      file_url: input.file_url,
      file_storage_path: input.file_storage_path,
      file_name: input.file_name,
    })
    .select("*, document_type:asset_document_types(*)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo guardar el documento del activo.");
  }

  return data as AssetDocument;
}

export async function getAssetDocumentByIdForCurrentCompanyAdmin(
  documentId: string,
): Promise<AssetDocument | null> {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_documents")
    .select("*, document_type:asset_document_types(*)")
    .eq("company_id", companyId)
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as AssetDocument | null;
}

export async function updateAssetDocumentForCurrentCompanyAdmin(input: {
  id: string;
  document_type_id: string;
  category: string;
  visible_qr: boolean;
  expiration_date: string | null;
  notice_days: number;
  file_url: string;
  file_storage_path: string;
  file_name: string;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("asset_documents")
    .update({
      document_type_id: input.document_type_id,
      category: input.category,
      visible_qr: input.visible_qr,
      expiration_date: input.expiration_date,
      notice_days: input.notice_days,
      file_url: input.file_url,
      file_storage_path: input.file_storage_path,
      file_name: input.file_name,
    })
    .eq("company_id", companyId)
    .eq("id", input.id)
    .select("*, document_type:asset_document_types(*)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el documento del activo.");
  }

  return data as AssetDocument;
}

export async function deleteAssetDocumentForCurrentCompanyAdmin(documentId: string) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("asset_documents")
    .delete()
    .eq("company_id", companyId)
    .eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createAssetForCurrentCompanyAdmin(input: {
  af: string;
  patente: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: string;
  centro_costos: string;
  id_gps: string | null;
  horometro: number | null;
  kilometraje: number | null;
  image_url: string | null;
  image_storage_path: string | null;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("assets")
    .insert({
      company_id: companyId,
      af: input.af,
      patente: input.patente,
      tipo: input.tipo,
      marca: input.marca,
      modelo: input.modelo,
      anio: input.anio,
      centro_costos: input.centro_costos,
      id_gps: input.id_gps,
      horometro: input.horometro,
      kilometraje: input.kilometraje,
      image_url: input.image_url,
      image_storage_path: input.image_storage_path,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el activo.");
  }

  return data as Asset;
}

export async function updateAssetForCurrentCompanyAdmin(input: {
  id: string;
  af: string;
  patente: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: string;
  centro_costos: string;
  id_gps: string | null;
  horometro: number | null;
  kilometraje: number | null;
  image_url: string | null;
  image_storage_path: string | null;
}) {
  const companyId = await getCurrentCompanyIdForCurrentCompanyAdmin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("assets")
    .update({
      af: input.af,
      patente: input.patente,
      tipo: input.tipo,
      marca: input.marca,
      modelo: input.modelo,
      anio: input.anio,
      centro_costos: input.centro_costos,
      id_gps: input.id_gps,
      horometro: input.horometro,
      kilometraje: input.kilometraje,
      image_url: input.image_url,
      image_storage_path: input.image_storage_path,
    })
    .eq("company_id", companyId)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el activo.");
  }

  return data as Asset;
}
