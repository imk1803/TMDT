import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  tagline: z.string().optional(),
});
