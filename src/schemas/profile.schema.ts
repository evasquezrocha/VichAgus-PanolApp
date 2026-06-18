import { ROLES } from "@/types/roles";
import { z } from "zod";

export const profileRoleSchema = z.enum(ROLES);

export const profileInputSchema = z.object({
  id: z.uuid(),
  company_id: z.uuid().nullable(),
  role_id: z.uuid().nullable(),
  full_name: z.string().trim().min(2).max(160).nullable(),
  email: z.email().toLowerCase(),
  role: z.string().trim().min(2),
  is_active: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const createCompanyUserSchema = z.object({
  company_id: z.uuid(),
  role_id: z.uuid(),
  full_name: z.string().trim().min(2).max(160),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  is_active: z.boolean().default(true),
});

export type CreateCompanyUserInput = z.infer<typeof createCompanyUserSchema>;

export const updateUserTemporaryPasswordSchema = z.object({
  user_id: z.uuid(),
  password: z.string().min(8).max(128),
});

export type UpdateUserTemporaryPasswordInput = z.infer<
  typeof updateUserTemporaryPasswordSchema
>;

export const createManagedCompanyUserSchema = z.object({
  role_id: z.uuid(),
  full_name: z.string().trim().min(2).max(160),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  is_active: z.boolean().default(true),
});

export type CreateManagedCompanyUserInput = z.infer<
  typeof createManagedCompanyUserSchema
>;

export const updateManagedUserSchema = z.object({
  user_id: z.uuid(),
  role_id: z.uuid(),
  full_name: z.string().trim().min(2).max(160).nullable().optional(),
  email: z.email().toLowerCase().optional(),
  is_active: z.boolean().default(true),
});

export type UpdateManagedUserInput = z.infer<typeof updateManagedUserSchema>;
