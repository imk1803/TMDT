import { prisma } from "../lib/prisma";

export async function listFreelancers() {
  return prisma.user.findMany({
    where: { role: "FREELANCER", isBanned: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      freelancerProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getFreelancer(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "FREELANCER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      freelancerProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getFreelancerReviews(id: string) {
  return prisma.review.findMany({
    where: { revieweeId: id },
    orderBy: { createdAt: "desc" },
  });
}
