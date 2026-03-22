import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";
import { HttpError } from "../utils/http";

export async function listFreelancersAdmin() {
  return prisma.user.findMany({
    where: { role: "FREELANCER" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      freelancerProfile: {
        include: {
          categories: {
            include: { category: true },
          },
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateFreelancerAdmin(
  id: string,
  data: {
    name?: string;
    title?: string;
    hourlyRate?: number;
    completedJobs?: number;
    totalIncome?: number;
    rating?: number;
    onTimeRate?: number;
  },
) {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      freelancerProfile: {
        upsert: {
          create: {
            title: data.title,
            hourlyRate: data.hourlyRate,
            completedJobs: data.completedJobs ?? 0,
            totalIncome: data.totalIncome ?? 0,
            avgRating: data.rating ?? 0,
            onTimeRate: data.onTimeRate ?? 0,
          },
          update: {
            title: data.title,
            hourlyRate: data.hourlyRate,
            completedJobs: data.completedJobs,
            totalIncome: data.totalIncome,
            avgRating: data.rating,
            onTimeRate: data.onTimeRate,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      freelancerProfile: {
        include: {
          categories: {
            include: { category: true },
          },
        },
      },
      createdAt: true,
    },
  });
}

export async function createFreelancerAdmin(data: {
  name?: string;
  email?: string;
  password?: string;
  title?: string;
  hourlyRate?: number;
  completedJobs?: number;
  totalIncome?: number;
  rating?: number;
  onTimeRate?: number;
}) {
  if (!data.name || !data.email || !data.password) {
    throw new HttpError(400, "Name, email and password are required");
  }

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          title: data.title,
          hourlyRate: data.hourlyRate,
          completedJobs: data.completedJobs ?? 0,
          totalIncome: data.totalIncome ?? 0,
          avgRating: data.rating ?? 0,
          onTimeRate: data.onTimeRate ?? 0,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      freelancerProfile: {
        include: {
          categories: {
            include: { category: true },
          },
        },
      },
      createdAt: true,
    },
  });
}

export async function deleteFreelancerAdmin(id: string) {
  return prisma.user.delete({ where: { id } });
}
