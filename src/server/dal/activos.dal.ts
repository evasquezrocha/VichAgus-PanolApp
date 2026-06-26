import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin } from "@/server/auth/guards";
import type { Asset, AssetCatalogFieldKey, AssetCatalogOption } from "@/types/activos";

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
  image_dropbox_path: string | null;
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
      image_dropbox_path: input.image_dropbox_path,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el activo.");
  }

  return data as Asset;
}
