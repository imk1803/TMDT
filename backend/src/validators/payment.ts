import { z } from "zod";

export const topUpWalletSchema = z.object({
  amount: z.number().positive(),
});

export const holdEscrowSchema = z.object({
  contractId: z.string(),
  amount: z.number().positive(),
  provider: z.string().optional(),
});
