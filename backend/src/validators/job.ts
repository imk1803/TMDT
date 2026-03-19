import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  budget: z.number().min(0),
  location: z.string().optional(),
  workMode: z.string().optional(),
  experienceLevel: z.string().optional(),
  deadlineAt: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
});

export const updateJobSchema = createJobSchema.partial();
