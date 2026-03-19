import type { NextApiRequest, NextApiResponse } from "next";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth";
import { registerUser, loginUser, logoutUser, refreshUserToken } from "../services/auth.service";
import { sendJson } from "../utils/http";
import { withErrorHandler } from "../middleware/error";
import { withAuth } from "../middleware/auth";

export const register = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = registerSchema.parse(req.body);
  const user = await registerUser(payload as any);
  sendJson(res, 201, { user });
});

export const login = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await loginUser(payload as any);
  sendJson(res, 200, { user, accessToken, refreshToken });
});

export const logout = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = refreshSchema.parse(req.body);
  await logoutUser(payload.refreshToken);
  sendJson(res, 200, { ok: true });
});

export const refresh = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = refreshSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await refreshUserToken(payload as any);
  sendJson(res, 200, { user, accessToken, refreshToken });
});

export const me = withErrorHandler(withAuth(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  sendJson(res, 200, { user: (req as any).user });
}));


