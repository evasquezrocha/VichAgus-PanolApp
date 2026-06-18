export type ToolGroup = {
  id: string;
  company_id: string;
  codigo: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
};

export type Tool = {
  id: string;
  company_id: string;
  tool_group_id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  marca: string | null;
  modelo: string | null;
  image_url: string | null;
  image_dropbox_path: string | null;
  created_at: string;
  updated_at: string;
};
