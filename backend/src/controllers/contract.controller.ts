import { createContractSchema } from "../validators/contract";
import { createContract, listMyContracts, completeContract, cancelContract } from "../services/contract.service";
import { sendJson, sendError } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withRole } from "../middleware/role";
import { withErrorHandler } from "../middleware/error";

export const create = withErrorHandler(withAuth(withRole(["CLIENT"], async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createContractSchema.parse(req.body);
  try {
    const contract = await createContract((req as any).user.id, payload as any);
    sendJson(res, 201, { contract });
  } catch (err: any) {
    return sendError(res, 400, err?.message || "Cannot create contract");
  }
})));

export const my = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const contracts = await listMyContracts((req as any).user.id);
  sendJson(res, 200, { contracts });
}));

export const complete = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const contract = await completeContract(id);
  sendJson(res, 200, { contract });
}));

export const cancel = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const contract = await cancelContract(id);
  sendJson(res, 200, { contract });
}));


