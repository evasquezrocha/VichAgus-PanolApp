import { z } from "zod";

const trimString = z.string().trim().min(1);
const customFieldTypeSchema = z.enum(["text", "number", "select", "date", "boolean"]);

export const toolGroupSchema = z.object({
  codigo: trimString.max(32),
  descripcion: trimString.max(120),
});

export type ToolGroupInput = z.infer<typeof toolGroupSchema>;

export const toolSchema = z.object({
  tool_group_id: trimString,
  ubicacion_id: trimString,
  codigo: trimString.max(32),
  descripcion: trimString.max(200),
  cantidad: z.coerce.number().int().min(0),
  unidad: trimString.max(24),
  marca: z.string().trim().max(80).optional().nullable(),
  modelo: z.string().trim().max(80).optional().nullable(),
});

export type ToolInput = z.infer<typeof toolSchema>;

export const toolCustomFieldSchema = z.object({
  codigo: trimString.max(32),
  nombre: trimString.max(120),
  field_type: customFieldTypeSchema,
  options: z.array(z.string().trim().min(1)).default([]),
  is_required: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ToolCustomFieldInput = z.infer<typeof toolCustomFieldSchema>;
