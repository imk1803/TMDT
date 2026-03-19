import type { NextApiHandler, NextApiResponse } from "next";
import { sendError } from "../utils/http";
import type { AuthedRequest } from "./auth";

export function withRole(roles: string[], handler: NextApiHandler) {
  return async (req: AuthedRequest, res: NextApiResponse) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden");
    }
    return handler(req, res);
  };
}
