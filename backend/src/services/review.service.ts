import { prisma } from "../lib/prisma";

export async function createReview(reviewerId: string, data: {
  contractId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}) {
  return prisma.review.create({
    data: {
      contractId: data.contractId,
      reviewerId,
      revieweeId: data.revieweeId,
      rating: data.rating,
      comment: data.comment,
    },
  });
}

export async function listReviewsForFreelancer(freelancerId: string) {
  return prisma.review.findMany({
    where: { revieweeId: freelancerId },
    orderBy: { createdAt: "desc" },
  });
}
