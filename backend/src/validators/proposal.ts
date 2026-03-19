import { z } from "zod";

export const createProposalSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
  bidAmount: z.number().min(0),
});

export const updateProposalSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});
