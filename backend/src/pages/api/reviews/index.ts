import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { withAuth, AuthedRequest } from "../../../middleware/auth";
import { withErrorHandler } from "../../../middleware/error";
import { sendJson, sendError } from "../../../utils/http";
import { createNotification } from "../../../services/notification.service";

async function handler(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { contractId, rating, comment } = req.body;
    const reviewerId = req.user!.id;

    if (!contractId || !rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return sendError(res, 400, "Invalid rating parameters");
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { id: true, clientId: true, freelancerId: true, status: true }
    });

    if (!contract) return sendError(res, 404, "Contract not found");
    // if (contract.status !== "COMPLETED") return sendError(res, 400, "Contract must be COMPLETED to leave a review");

    let role: "CLIENT" | "FREELANCER";
    let revieweeId: string;

    if (contract.clientId === reviewerId) {
      role = "CLIENT";
      revieweeId = contract.freelancerId;
    } else if (contract.freelancerId === reviewerId) {
      role = "FREELANCER";
      revieweeId = contract.clientId;
    } else {
      return sendError(res, 403, "Forbidden - not part of contract");
    }

    const existingReview = await prisma.review.findFirst({
      where: { contractId, reviewerId }
    });

    if (existingReview) {
      return sendError(res, 400, "You have already reviewed this contract");
    }

    const review = await prisma.review.create({
      data: {
        contractId,
        reviewerId,
        revieweeId,
        role,
        rating,
        comment
      }
    });

    // Calculate strict math average
    const allReviewsForReviewee = await prisma.review.findMany({
      where: { revieweeId }
    });

    const totalReviews = allReviewsForReviewee.length;
    const avgRating = allReviewsForReviewee.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    if (role === "CLIENT") {
      // Client reviewed freelancer -> update freelancer profile
      await prisma.freelancerProfile.update({
        where: { userId: revieweeId },
        data: { totalReviews, avgRating }
      });
    } else {
      // Freelancer reviewed client -> update client profile
      await prisma.clientProfile.update({
        where: { userId: revieweeId },
        data: { totalReviews, avgRating }
      });
    }

    // Create notification
    await createNotification(revieweeId, "notification:review_received", {
      title: "Nhận được đánh giá mới",
      body: `Bạn vừa nhận được 1 đánh giá ${rating} sao từ đối tác.`,
      link: `/contracts/${contractId}`,
      category: "SYSTEM",
      referenceId: review.id,
    });

    return sendJson(res, 201, { message: "Review submitted", review });
  } catch (error: any) {
    return sendError(res, 500, error.message || "Internal server error");
  }
}

export default withErrorHandler(withAuth(handler));
