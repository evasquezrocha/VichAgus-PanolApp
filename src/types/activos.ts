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
  image_storage_path: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetDocumentType = {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type AssetDocument = {
  id: string;
  company_id: string;
  asset_id: string;
  document_type_id: string;
  category: string;
  visible_qr: boolean;
  expiration_date: string | null;
  notice_days: number;
  file_url: string;
  file_storage_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  document_type: AssetDocumentType | null;
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

export type AssetDocumentInput = {
  document_type: string;
  category: string;
  visible_qr: boolean;
  expiration_date: string | null;
  notice_days: number;
};

export type AssetDocumentFilter = "all" | "with-expiration" | "expired" | "without-expiration";
