import { z } from "zod";

export const adminFreelancerCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  title: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  completedJobs: z.number().int().min(0).optional(),
  totalIncome: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  onTimeRate: z.number().min(0).max(100).optional(),
});

export const adminFreelancerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  completedJobs: z.number().int().min(0).optional(),
  totalIncome: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  onTimeRate: z.number().min(0).max(100).optional(),
});
