import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../middleware/auth";
import { withAdmin } from "../middleware/admin";
import { withErrorHandler } from "../middleware/error";
import { adminCompanyCreateSchema, adminCompanyUpdateSchema } from "../validators/admin.company";
import { createCompany, deleteCompany, listCompanies, updateCompany } from "../services/company.service";
import { sendJson } from "../utils/http";

export const list = withErrorHandler(withAuth(withAdmin(async (_req: NextApiRequest, res: NextApiResponse) => {
  const companies = await listCompanies();
  sendJson(res, 200, { companies });
})));

export const create = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = adminCompanyCreateSchema.parse(req.body);
  const company = await createCompany(payload as any);
  sendJson(res, 201, { company });
})));

export const update = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const payload = adminCompanyUpdateSchema.parse(req.body);
  const company = await updateCompany(id, payload as any);
  sendJson(res, 200, { company });
})));

export const remove = withErrorHandler(withAuth(withAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const company = await deleteCompany(id);
  sendJson(res, 200, { company });
})));


