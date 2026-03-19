import { z } from "zod";

export const createMilestoneSchema = z.object({
  contractId: z.string().min(1),
  title: z.string().min(3),
  amount: z.number().min(0),
  dueDate: z.string().datetime().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(3).optional(),
  amount: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "SUBMITTED", "APPROVED"]).optional(),
});
