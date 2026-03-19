import type { NextApiRequest, NextApiResponse } from "next";
import { createJobSchema, updateJobSchema } from "../validators/job";
import { listJobs, listMyJobs, getJob, createJob, updateJob, deleteJob, getJobProposals } from "../services/job.service";
import { sendError, sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withRole } from "../middleware/role";
import { withErrorHandler } from "../middleware/error";

export const list = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const jobs = await listJobs();
  sendJson(res, 200, { jobs });
});

export const my = withErrorHandler(withAuth(withRole(["CLIENT"], async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const jobs = await listMyJobs((req as any).user.id);
  sendJson(res, 200, { jobs });
})));

export const get = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const job = await getJob(id);
  if (!job) return sendError(res, 404, "Job not found");
  sendJson(res, 200, { job });
});

export const create = withErrorHandler(withAuth(withRole(["CLIENT"], async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createJobSchema.parse(req.body);
  const job = await createJob((req as any).user.id, payload as any);
  sendJson(res, 201, { job });
})));

export const update = withErrorHandler(withAuth(withRole(["CLIENT", "ADMIN"], async (req, res) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const payload = updateJobSchema.parse(req.body);
  const job = await updateJob(id, payload as any);
  sendJson(res, 200, { job });
})));

export const remove = withErrorHandler(withAuth(withRole(["CLIENT", "ADMIN"], async (req, res) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const job = await deleteJob(id);
  sendJson(res, 200, { job });
})));

export const proposals = withErrorHandler(withAuth(withRole(["CLIENT", "FREELANCER", "ADMIN"], async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const job = await getJob(id);
  if (!job) return sendError(res, 404, "Job not found");
  const proposals = await getJobProposals(id);
  sendJson(res, 200, { proposals });
})));


