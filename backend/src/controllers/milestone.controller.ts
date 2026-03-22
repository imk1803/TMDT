import type { NextApiRequest, NextApiResponse } from "next";
import { createMilestoneSchema, updateMilestoneSchema } from "../validators/milestone";
import {
  createMilestone,
  listContractMilestones,
  submitMilestone,
  approveMilestone,
  updateMilestone,
} from "../services/milestone.service";
import { sendJson, sendError } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withRole } from "../middleware/role";
import { withErrorHandler } from "../middleware/error";
import { createNotification } from "../services/notification.service";

export const create = withErrorHandler(
  withAuth(
    withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== "POST") {
        res.status(405).end();
        return;
      }
      const payload = createMilestoneSchema.parse(req.body);
      try {
        const milestone = await createMilestone((req as any).user.id, payload as any);
        sendJson(res, 201, { milestone });
      } catch (err: any) {
        return sendError(res, 400, err?.message || "Cannot create milestone");
      }
    })
  )
);

export const listByContract = withErrorHandler(
  withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.status(405).end();
      return;
    }
    const contractId = req.query.id as string;
    try {
      const milestones = await listContractMilestones(contractId, (req as any).user.id);
      sendJson(res, 200, { milestones });
    } catch (err: any) {
      return sendError(res, 400, err?.message || "Cannot load milestones");
    }
  })
);

export const submit = withErrorHandler(
  withAuth(
    withRole(["FREELANCER"], async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== "POST") {
        res.status(405).end();
        return;
      }
      const id = req.query.id as string;
      try {
        const result = await submitMilestone(id, (req as any).user.id);
        const milestone = result.milestone;
        const contract = result.contract;
        await createNotification(contract.clientId, "notification:milestone_submitted", {
          title: "Milestone được gửi",
          body: `Freelancer đã gửi milestone: ${milestone.title}.`,
          link: `/contracts/${contract.id}`,
          category: "PAYMENT",
          referenceId: milestone.id,
        });
        sendJson(res, 200, { milestone });
      } catch (err: any) {
        return sendError(res, 400, err?.message || "Cannot submit milestone");
      }
    })
  )
);

export const approve = withErrorHandler(
  withAuth(
    withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== "POST") {
        res.status(405).end();
        return;
      }
      const id = req.query.id as string;
      try {
        const result = await approveMilestone(id, (req as any).user.id);
        const milestone = result.milestone;
        const contract = result.contract;
        await createNotification(contract.freelancerId, "notification:milestone_approved", {
          title: "Milestone được duyệt",
          body: `Milestone ${milestone.title} đã được duyệt và thanh toán.`,
          link: `/contracts/${contract.id}`,
          category: "PAYMENT",
          referenceId: milestone.id,
        });
        sendJson(res, 200, { milestone });
      } catch (err: any) {
        return sendError(res, 400, err?.message || "Cannot approve milestone");
      }
    })
  )
);

export const update = withErrorHandler(
  withAuth(
    withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== "PATCH") {
        res.status(405).end();
        return;
      }
      const id = req.query.id as string;
      const payload = updateMilestoneSchema.parse(req.body);
      try {
        const milestone = await updateMilestone(id, (req as any).user.id, payload as any);
        sendJson(res, 200, { milestone });
      } catch (err: any) {
        return sendError(res, 400, err?.message || "Cannot update milestone");
      }
    })
  )
);
