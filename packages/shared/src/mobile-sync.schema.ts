import { z } from "zod";

const trimString = z.string().trim().min(1);

const entityTypeSchema = z.enum([
  "tool",
  "tool_group",
  "employee",
  "location",
  "transfer",
  "custom_field",
  "custom_field_value",
]);

const mutationOperationSchema = z.enum(["insert", "update", "delete"]);

export const mobileMutationSchema = z.object({
  client_mutation_id: trimString.max(128),
  entity: entityTypeSchema,
  operation: mutationOperationSchema,
  record_id: z.string().trim().max(128).optional().nullable(),
  payload: z.record(z.string(), z.unknown()).default({}),
  local_created_at: z.string().datetime({ offset: true }).optional().nullable(),
});

export type MobileMutationInput = z.infer<typeof mobileMutationSchema>;

export const mobileSyncPushSchema = z.object({
  device_id: trimString.max(128),
  base_revision: z.coerce.number().int().min(0).default(0),
  mutations: z.array(mobileMutationSchema).min(1).max(100),
});

export type MobileSyncPushInput = z.infer<typeof mobileSyncPushSchema>;

export const mobileSyncPullSchema = z.object({
  device_id: trimString.max(128),
  cursor: z.string().trim().max(256).optional().nullable(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type MobileSyncPullInput = z.infer<typeof mobileSyncPullSchema>;
