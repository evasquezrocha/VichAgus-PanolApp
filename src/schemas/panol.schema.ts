import { z } from "zod";

const trimString = z.string().trim().min(1);

export const toolGroupSchema = z.object({
  codigo: trimString.max(32),
  descripcion: trimString.max(120),
});

export type ToolGroupInput = z.infer<typeof toolGroupSchema>;

export const toolSchema = z.object({
  tool_group_id: trimString,
  codigo: trimString.max(32),
  descripcion: trimString.max(200),
  cantidad: z.coerce.number().int().min(0),
  unidad: trimString.max(24),
  marca: z.string().trim().max(80).optional().nullable(),
  modelo: z.string().trim().max(80).optional().nullable(),
});

export type ToolInput = z.infer<typeof toolSchema>;
