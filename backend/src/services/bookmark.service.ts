import { prisma } from "../lib/prisma";

export async function createBookmark(userId: string, data: {
  jobId?: string;
  freelancerId?: string;
}) {
  return prisma.bookmark.create({
    data: {
      userId,
      jobId: data.jobId,
      freelancerId: data.freelancerId,
    },
  });
}

export async function listBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: { job: true, freelancer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteBookmark(id: string) {
  return prisma.bookmark.delete({ where: { id } });
}
