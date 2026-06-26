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

