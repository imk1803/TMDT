import { prisma } from "../lib/prisma";

function validateMilestoneRules(
  milestones: Array<{ percent: number }> | undefined
) {
  if (!milestones) return;
  if (milestones.length < 1 || milestones.length > 5) {
    throw new Error("Milestones must be between 1 and 5");
  }
  const totalPercent = milestones.reduce((sum, item) => sum + item.percent, 0);
  if (totalPercent !== 100) {
    throw new Error("Total milestone percent must equal 100");
  }
}

function milestoneAmountFromPercent(budget: number, percent: number) {
  return Number(((budget * percent) / 100).toFixed(2));
}

export async function listJobs() {
  return prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      skills: { include: { skill: true } },
      milestones: true,
      client: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
          clientProfile: true,
        },
      },
    },
  });
}

export async function listMyJobs(clientId: string) {
  return prisma.job.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      skills: { include: { skill: true } },
      milestones: true,
      proposals: true,
    },
  });
}

export async function getJob(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      category: true,
      skills: { include: { skill: true } },
      milestones: true,
      proposals: true,
      client: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
          clientProfile: true,
        },
      },
    },
  });
}

export async function createJob(
  clientId: string,
  data: {
    title?: string;
    description?: string;
    budget?: number;
    location?: string;
    workMode?: string;
    experienceLevel?: string;
    deadlineAt?: string;
    categoryId?: string;
    categoryName?: string;
    skillIds?: string[];
    milestones?: { title: string; percent: number; dueDate?: string }[];
  }
) {
  if (!data.title || !data.description || data.budget === undefined || data.budget === null) {
    throw new Error("Title, description and budget are required");
  }
  validateMilestoneRules(data.milestones);

  let resolvedCategoryId = data.categoryId;
  const normalizedCategoryName = data.categoryName?.trim();
  if (!resolvedCategoryId && normalizedCategoryName) {
    const category = await prisma.category.upsert({
      where: { name: normalizedCategoryName },
      update: {},
      create: { name: normalizedCategoryName },
    });
    resolvedCategoryId = category.id;
  }

  return prisma.job.create({
    data: {
      clientId,
      title: data.title,
      description: data.description,
      budget: data.budget,
      location: data.location,
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : undefined,
      categoryId: resolvedCategoryId,
      skills: data.skillIds
        ? { create: data.skillIds.map((skillId) => ({ skillId })) }
        : undefined,
      milestones: data.milestones?.length
        ? {
            create: data.milestones.map((milestone) => ({
              title: milestone.title,
              amount: milestoneAmountFromPercent(data.budget as number, milestone.percent),
              dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
            })),
          }
        : undefined,
    },
  });
}

export async function updateJob(
  jobId: string,
  data: {
    title?: string;
    description?: string;
    budget?: number;
    location?: string;
    workMode?: string;
    experienceLevel?: string;
    deadlineAt?: string;
    categoryId?: string;
    categoryName?: string;
    skillIds?: string[];
    milestones?: { title: string; percent: number; dueDate?: string }[];
  }
) {
  validateMilestoneRules(data.milestones);

  let resolvedCategoryId = data.categoryId;
  const normalizedCategoryName = data.categoryName?.trim();
  if (!resolvedCategoryId && normalizedCategoryName) {
    const category = await prisma.category.upsert({
      where: { name: normalizedCategoryName },
      update: {},
      create: { name: normalizedCategoryName },
    });
    resolvedCategoryId = category.id;
  }

  const baseJob = await prisma.job.findUnique({
    where: { id: jobId },
    select: { budget: true },
  });
  if (!baseJob) {
    throw new Error("Job not found");
  }
  const effectiveBudget =
    data.budget !== undefined && data.budget !== null ? data.budget : Number(baseJob.budget);

  return prisma.job.update({
    where: { id: jobId },
    data: {
      title: data.title,
      description: data.description,
      budget: data.budget,
      location: data.location,
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : undefined,
      categoryId: resolvedCategoryId,
      skills: data.skillIds
        ? {
            deleteMany: {},
            create: data.skillIds.map((skillId) => ({ skillId })),
          }
        : undefined,
      milestones: data.milestones
        ? {
            deleteMany: {},
            create: data.milestones.map((milestone) => ({
              title: milestone.title,
              amount: milestoneAmountFromPercent(effectiveBudget, milestone.percent),
              dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
            })),
          }
        : undefined,
    },
  });
}

export async function deleteJob(jobId: string) {
  return prisma.job.delete({ where: { id: jobId } });
}

export async function getJobProposals(jobId: string) {
  return prisma.proposal.findMany({
    where: { jobId },
    include: {
      freelancer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          freelancerProfile: {
            select: {
              title: true,
              bio: true,
              hourlyRate: true,
              rating: true,
              completedJobs: true,
              onTimeRate: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
