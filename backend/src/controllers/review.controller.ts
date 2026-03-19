import type { NextApiRequest, NextApiResponse } from "next";
import { createReviewSchema } from "../validators/review";
import { createReview, listReviewsForFreelancer } from "../services/review.service";
import { sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const create = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createReviewSchema.parse(req.body);
  const review = await createReview((req as any).user.id, payload as any);
  sendJson(res, 201, { review });
}));

export const listForFreelancer = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const freelancerId = req.query.freelancerId as string;
  const reviews = await listReviewsForFreelancer(freelancerId);
  sendJson(res, 200, { reviews });
});


