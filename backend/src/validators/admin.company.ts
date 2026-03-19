import { z } from "zod";

export const adminCompanyCreateSchema = z.object({
  name: z.string().min(2),
  location: z.string().optional(),
  industry: z.string().optional(),
  employees: z.string().optional(),
  tagline: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const adminCompanyUpdateSchema = adminCompanyCreateSchema.partial();
