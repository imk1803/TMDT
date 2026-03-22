import type { NextApiRequest, NextApiResponse } from "next";
import { createProposalSchema, updateProposalSchema } from "../validators/proposal";
import {
  createProposal,
  deleteProposal,
  getProposalWithJob,
  listFreelancerProposals,
  updateProposalStatus,
} from "../services/proposal.service";
import { createContract } from "../services/contract.service";
import { createNotification } from "../services/notification.service";
import { sendJson, sendError } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withRole } from "../middleware/role";
import { withErrorHandler } from "../middleware/error";

export const create = withErrorHandler(withAuth(withRole(["FREELANCER"], async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createProposalSchema.parse(req.body);
  const proposal = await createProposal((req as any).user.id, payload as any);
  sendJson(res, 201, { proposal });
})));

export const my = withErrorHandler(withAuth(withRole(["FREELANCER"], async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const proposals = await listFreelancerProposals((req as any).user.id);
  sendJson(res, 200, { proposals });
})));

export const update = withErrorHandler(withAuth(withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const payload = updateProposalSchema.parse(req.body);

  const proposal = await getProposalWithJob(id);
  if (!proposal) return sendError(res, 404, "Proposal not found");
  if (proposal.job.clientId !== (req as any).user.id) {
    return sendError(res, 403, "Forbidden");
  }

  if (payload.status === "ACCEPTED") {
    try {
      const contract = await createContract((req as any).user.id, { proposalId: id });
      await createNotification(proposal.freelancerId, "notification:proposal_accepted", {
        title: "Đề xuất của bạn đã được chấp nhận",
        body: "Nhà tuyển dụng đã chấp nhận đề xuất và hợp đồng đã được tạo.",
        link: `/contracts/${contract.id}`,
        category: "SYSTEM",
        referenceId: proposal.id,
      });
      await createNotification(proposal.freelancerId, "notification:contract_started", {
        title: "Hợp đồng đã bắt đầu",
        body: "Hợp đồng mới của bạn đã được khởi tạo thành công.",
        link: `/contracts/${contract.id}`,
        category: "SYSTEM",
        referenceId: contract.id,
      });
      return sendJson(res, 200, { proposal: { ...proposal, status: "ACCEPTED" }, contract });
    } catch (err: any) {
      return sendError(res, 400, err?.message || "Cannot accept proposal");
    }
  }

  const updated = await updateProposalStatus(id, "REJECTED");
  await createNotification(proposal.freelancerId, "notification:proposal_rejected", {
    title: "Đề xuất của bạn đã bị từ chối",
    body: "Nhà tuyển dụng đã từ chối đề xuất của bạn cho công việc này.",
    link: `/jobs/${proposal.job.id}`,
    category: "SYSTEM",
    referenceId: proposal.id,
  });
  sendJson(res, 200, { proposal: updated });
})));

export const remove = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const proposal = await deleteProposal(id);
  sendJson(res, 200, { proposal });
}));
