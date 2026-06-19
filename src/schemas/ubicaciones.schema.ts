import { z } from "zod";

const trimString = z.string().trim().min(1);

export const ubicacionSchema = z.object({
  nombre: trimString.max(80),
  responsible_user_id: z.string().trim().min(1).nullable(),
});

export type UbicacionInput = z.infer<typeof ubicacionSchema>;
