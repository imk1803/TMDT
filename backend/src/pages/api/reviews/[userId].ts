import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendJson, sendError } from "../../../utils/http";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return sendError(res, 400, "User ID missing");
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        contract: {
          select: {
            id: true,
            job: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return sendJson(res, 200, { reviews });
  } catch (err: any) {
    return sendError(res, 500, err?.message || "Internal server error");
  }
}
