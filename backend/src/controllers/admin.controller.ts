import type { NextApiRequest, NextApiResponse } from "next";
import {
  listUsers,
  banUser,
  deleteUser,
  listJobs,
  deleteJob,
  listReports,
  updateReport,
  listSupportTickets,
  updateSupportTicket,
  getDashboardStats,
  listAllContracts,
  listAllTransactions,
  getAdminLeaderboard,
  getAdminResources,
  getPlatformRevenue,
  getUserTransactionVolume
} from "../services/admin.service";
import { sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withAdmin } from "../middleware/admin";
import { withErrorHandler } from "../middleware/error";

export const users = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const users = await listUsers();
  sendJson(res, 200, { users });
})));

export const ban = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const isBanned = req.body?.isBanned === true;
  const user = await banUser(id, isBanned);
  sendJson(res, 200, { user });
})));

export const removeUser = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const user = await deleteUser(id);
  sendJson(res, 200, { user });
})));

export const jobs = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const jobs = await listJobs();
  sendJson(res, 200, { jobs });
})));

export const removeJob = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const job = await deleteJob(id);
  sendJson(res, 200, { job });
})));

export const reports = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const reports = await listReports();
  sendJson(res, 200, { reports });
})));

export const updateReportStatus = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const status = (req.body?.status as any) || "IN_PROGRESS";
  const report = await updateReport(id, status);
  sendJson(res, 200, { report });
})));

export const support = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const tickets = await listSupportTickets();
  sendJson(res, 200, { tickets });
})));

export const updateSupport = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const status = (req.body?.status as any) || "IN_PROGRESS";
  const ticket = await updateSupportTicket(id, status);
  sendJson(res, 200, { ticket });
})));

export const stats = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const data = await getDashboardStats();
  sendJson(res, 200, data);
})));

export const allContracts = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const contracts = await listAllContracts();
  sendJson(res, 200, { contracts });
})));

export const transactions = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const transactions = await listAllTransactions();
  sendJson(res, 200, { transactions });
})));

export const revenue = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const [platformRevenue, userVolume] = await Promise.all([
    getPlatformRevenue(),
    getUserTransactionVolume()
  ]);
  sendJson(res, 200, { platformRevenue, userVolume });
})));

export const leaderboard = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const data = await getAdminLeaderboard();
  sendJson(res, 200, { leaderboard: data });
})));

export const resources = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const data = await getAdminResources();
  sendJson(res, 200, { resources: data });
})));
