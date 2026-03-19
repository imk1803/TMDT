import { z } from "zod";

export const createContractSchema = z.object({
  proposalId: z.string(),
  price: z.number().min(0).optional(),
  dueAt: z.string().datetime().optional(),
});
