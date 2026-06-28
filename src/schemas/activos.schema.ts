import { z } from "zod";

const trimString = z.string().trim().min(1);

export const assetFormSchema = z.object({
  af: trimString,
  patente: trimString,
  tipo: trimString,
  marca: trimString,
  modelo: trimString,
  anio: z.string().trim().regex(/^\d{4}$/, "El año debe tener cuatro digitos."),
  centro_costos: trimString,
  id_gps: z.string().trim().optional().default(""),
  horometro: z.string().trim().optional().default(""),
  kilometraje: z.string().trim().optional().default(""),
});

export type AssetFormInput = z.infer<typeof assetFormSchema>;

export const assetDocumentFormSchema = z.object({
  document_type: trimString,
  category: trimString,
  visible_qr: z.enum(["true", "false"]).default("false"),
  expiration_date: z.string().trim().optional().default(""),
  notice_days: z.string().trim().regex(/^\d+$/, "El aviso previo debe ser un numero entero."),
});

export type AssetDocumentFormInput = z.infer<typeof assetDocumentFormSchema>;

export const assetDocumentCategorySchema = z.object({
  name: trimString,
});

export type AssetDocumentCategoryInput = z.infer<typeof assetDocumentCategorySchema>;
