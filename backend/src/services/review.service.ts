import { prisma } from "../lib/prisma";
import { awardPoints } from "./gamification.service";

export async function createReview(reviewerId: string, data: {
  contractId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}) {
  const review = await prisma.review.create({
    data: {
      contractId: data.contractId,
      reviewerId,
      revieweeId: data.revieweeId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  if (data.rating === 5) {
    try {
      await awardPoints(data.revieweeId, 50, "five_star_review");
    } catch {
      // do not block review on gamification
    }
  }

  return review;
}

export async function listReviewsForFreelancer(freelancerId: string) {
  return prisma.review.findMany({
    where: { revieweeId: freelancerId },
    orderBy: { createdAt: "desc" },
  });
}
