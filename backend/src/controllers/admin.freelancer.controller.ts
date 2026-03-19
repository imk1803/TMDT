import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../middleware/auth";
import { withAdmin } from "../middleware/admin";
import { withErrorHandler } from "../middleware/error";
import { adminFreelancerCreateSchema, adminFreelancerUpdateSchema } from "../validators/admin.freelancer";
import { listFreelancersAdmin, createFreelancerAdmin, updateFreelancerAdmin, deleteFreelancerAdmin } from "../services/admin.freelancer.service";
import { sendJson } from "../utils/http";

export const list = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const freelancers = await listFreelancersAdmin();
  sendJson(res, 200, { freelancers });
})));

export const create = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = adminFreelancerCreateSchema.parse(req.body);
  const freelancer = await createFreelancerAdmin(payload as any);
  sendJson(res, 201, { freelancer });
})));

export const update = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const payload = adminFreelancerUpdateSchema.parse(req.body);
  const freelancer = await updateFreelancerAdmin(id, payload as any);
  sendJson(res, 200, { freelancer });
})));

export const remove = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const freelancer = await deleteFreelancerAdmin(id);
  sendJson(res, 200, { freelancer });
})));


