import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../lib/prisma";
import { sendJson, sendError } from "../utils/http";

export async function getActivities(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contractId = req.query.contractId as string;
    const userId = (req as any).user.id;

    if (!contractId) {
      return sendError(res, 400, "Missing contractId");
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { clientId: true, freelancerId: true }
    });

    if (!contract) return sendError(res, 404, "Contract not found");
    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return sendError(res, 403, "Not allowed");
    }

    const activities = await prisma.contractActivity.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return sendJson(res, 200, { activities });
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
}
