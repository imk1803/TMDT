import { z } from "zod";

export const createReviewSchema = z.object({
  contractId: z.string(),
  revieweeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
