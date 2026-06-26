import { z } from "zod";

const trimString = z.string().trim().min(1);

export const transferHeaderSchema = z.object({
  origin_endpoint: trimString,
  destination_endpoint: trimString,
  transfer_date: trimString,
  transfer_time: trimString,
  signature_data: trimString,
  observations: z.string().trim().optional().default(""),
});

export type TransferHeaderInput = z.infer<typeof transferHeaderSchema>;
