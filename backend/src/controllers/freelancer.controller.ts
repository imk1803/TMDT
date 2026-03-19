import type { NextApiRequest, NextApiResponse } from "next";
import { listFreelancers, getFreelancer, getFreelancerReviews } from "../services/freelancer.service";
import { sendError, sendJson } from "../utils/http";
import { withErrorHandler } from "../middleware/error";

export const list = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const freelancers = await listFreelancers();
  sendJson(res, 200, { freelancers });
});

export const get = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const freelancer = await getFreelancer(id);
  if (!freelancer) return sendError(res, 404, "Freelancer not found");
  sendJson(res, 200, { freelancer });
});

export const reviews = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const reviews = await getFreelancerReviews(id);
  sendJson(res, 200, { reviews });
});


