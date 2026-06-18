import { z } from "zod";

export const companyInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  is_active: z.boolean().default(true),
});

export type CompanyInput = z.infer<typeof companyInputSchema>;

const colorHexSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Ingresa un color hexadecimal valido.");

export const companySettingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  rut: z.string().trim().min(3).max(32).nullable(),
  logo_url: z.string().trim().max(500).nullable(),
  sidebar_bg_color: colorHexSchema,
  sidebar_text_color: colorHexSchema,
  sidebar_active_bg_color: colorHexSchema,
  sidebar_active_text_color: colorHexSchema,
  platform_background_color: colorHexSchema,
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
