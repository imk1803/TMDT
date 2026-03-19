import { z } from "zod";

export const createBookmarkSchema = z.object({
  jobId: z.string().optional(),
  freelancerId: z.string().optional(),
});
