import { z } from "zod";

const milestonePercentSchema = z
  .number()
  .int()
  .min(10)
  .max(100)
  .refine((value) => value % 10 === 0, "Percent must be in 10% steps");

const milestoneSchema = z.object({
  title: z.string().min(3),
  percent: milestonePercentSchema,
  dueDate: z.string().datetime().optional(),
});

function validateMilestonePercentTotal(
  milestones: Array<{ percent: number }> | undefined,
  ctx: z.RefinementCtx
) {
  if (!milestones) return;
  const totalPercent = milestones.reduce((sum, item) => sum + item.percent, 0);
  if (totalPercent !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Total milestone percent must equal 100",
      path: ["milestones"],
    });
  }
}

export const createJobSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().min(10),
    budget: z.number().min(0),
    location: z.string().optional(),
    workMode: z.string().optional(),
    experienceLevel: z.string().optional(),
    deadlineAt: z.string().datetime().optional(),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    skillIds: z.array(z.string()).optional(),
    milestones: z.array(milestoneSchema).min(1).max(5),
  })
  .superRefine((data, ctx) => {
    validateMilestonePercentTotal(data.milestones, ctx);
  });

export const updateJobSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    budget: z.number().min(0).optional(),
    location: z.string().optional(),
    workMode: z.string().optional(),
    experienceLevel: z.string().optional(),
    deadlineAt: z.string().datetime().optional(),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    skillIds: z.array(z.string()).optional(),
    milestones: z.array(milestoneSchema).min(1).max(5).optional(),
  })
  .superRefine((data, ctx) => {
    validateMilestonePercentTotal(data.milestones, ctx);
  });
