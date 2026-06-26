import type { AssetCatalogFieldKey } from "@/types/activos";

export const ASSET_CATALOG_FIELD_KEYS: AssetCatalogFieldKey[] = [
  "tipo",
  "marca",
  "modelo",
  "anio",
  "centro_costos",
];

export const ASSET_CATALOG_FIELD_LABELS: Record<AssetCatalogFieldKey, string> = {
  tipo: "Tipo",
  marca: "Marca",
  modelo: "Modelo",
  anio: "Año",
  centro_costos: "Centro de Costos",
};

export function buildAssetYearSuggestions(existingYears: string[] = []) {
  const currentYear = new Date().getFullYear();
  const defaults = Array.from({ length: 35 }, (_, index) => String(currentYear + 1 - index));
  return Array.from(new Set([...defaults, ...existingYears.filter(Boolean)]));
}

export function formatAssetNumericValue(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 2,
  }).format(value);
}

