export type AssetCatalogFieldKey =
  | "tipo"
  | "marca"
  | "modelo"
  | "anio"
  | "centro_costos";

export type AssetCatalogOption = {
  id: string;
  company_id: string;
  field_key: AssetCatalogFieldKey;
  value: string;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  company_id: string;
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
  created_at: string;
  updated_at: string;
};

export type AssetDetail = {
  asset: Asset;
};

export type AssetInput = {
  af: string;
  patente: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: string;
  centro_costos: string;
  id_gps?: string | null;
  horometro?: string | null;
  kilometraje?: string | null;
};
