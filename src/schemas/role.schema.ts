import { PERMISSIONS } from "@/types/permission";
import { z } from "zod";

export const rolePermissionSchema = z.enum(PERMISSIONS);

export const roleInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).nullable(),
  permissions: z.array(rolePermissionSchema).min(1),
  is_active: z.boolean().default(true),
});

export type RoleInput = z.infer<typeof roleInputSchema>;

export const updateRoleInputSchema = roleInputSchema.extend({
  role_id: z.uuid(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;
