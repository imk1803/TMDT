import { z } from "zod";

export const topUpWalletSchema = z.object({
  amount: z.number().positive(),
  method: z.string().optional(),
});

export const withdrawWalletSchema = z.object({
  amount: z.number().positive(),
  method: z.string().optional(),
});

export const holdEscrowSchema = z.object({
  contractId: z.string(),
  amount: z.number().positive(),
  provider: z.string().optional(),
});
