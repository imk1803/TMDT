import type { NextApiRequest, NextApiResponse } from "next";
import { getUserById, updateUserProfile } from "../services/user.service";
import { updateProfileSchema } from "../validators/user";
import { sendError, sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const getUser = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const user = await getUserById(id);
  if (!user) return sendError(res, 404, "User not found");
  sendJson(res, 200, { user });
});

export const me = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const userId = (req as any).user.id;
  const user = await getUserById(userId);
  if (!user) return sendError(res, 404, "User not found");
  sendJson(res, 200, { user });
}));

export const updateProfile = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "PUT") {
    res.status(405).end();
    return;
  }
  if ((req as any).user?.role === "ADMIN") {
    return sendError(res, 403, "Admin cannot update profile here");
  }
  const userId = (req as any).user.id;
  const payload = updateProfileSchema.parse(req.body);
  const user = await updateUserProfile(userId, payload as any);
  sendJson(res, 200, { user });
}));


