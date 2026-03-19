import type { NextApiHandler, NextApiResponse } from "next";
import { sendError } from "../utils/http";
import type { AuthedRequest } from "./auth";

export function withAdmin(handler: NextApiHandler) {
  return async (req: AuthedRequest, res: NextApiResponse) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }
    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Admin access required");
    }
    return handler(req, res);
  };
}
