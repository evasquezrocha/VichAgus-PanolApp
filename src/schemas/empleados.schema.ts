import { z } from "zod";

const trimString = z.string().trim().min(1);

export const employeeSchema = z.object({
  rut: trimString.max(20),
  nombres: trimString.max(80),
  apellidos: trimString.max(120),
  empresa: trimString.max(120),
  email: z.string().trim().email().max(120).optional().nullable(),
  telefono: z.string().trim().max(32).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
