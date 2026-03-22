import { addLinkSchema } from "../validators/resource";
import { createResource, listResources, deleteResource } from "../services/resource.service";
import { sendJson, sendError } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const addLink = withErrorHandler(withAuth(async (req: any, res: any) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = addLinkSchema.parse(req.body);
  const resource = await createResource(req.user.id, {
    contractId: payload.contractId,
    type: "LINK",
    url: payload.url,
    fileName: payload.fileName || payload.url,
  });
  return sendJson(res, 201, { resource });
}));

export const getResources = withErrorHandler(withAuth(async (req: any, res: any) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const { contractId } = req.query;
  const resources = await listResources(req.user.id, contractId as string);
  return sendJson(res, 200, { resources });
}));

export const removeResource = withErrorHandler(withAuth(async (req: any, res: any) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const { id } = req.query;
  await deleteResource(req.user.id, id as string);
  return sendJson(res, 200, { success: true });
}));
