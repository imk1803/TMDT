import { prisma } from "../lib/prisma";

export async function listJobs() {
  return prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      skills: { include: { skill: true } },
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
    skillIds?: string[];
  }
) {
  if (!data.title || !data.description || data.budget === undefined || data.budget === null) {
    throw new Error("Title, description and budget are required");
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
      categoryId: data.categoryId,
      skills: data.skillIds
        ? { create: data.skillIds.map((skillId) => ({ skillId })) }
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
    skillIds?: string[];
  }
) {
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
      categoryId: data.categoryId,
      skills: data.skillIds
        ? {
            deleteMany: {},
            create: data.skillIds.map((skillId) => ({ skillId })),
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
