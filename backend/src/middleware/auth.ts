import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/http";
import { prisma } from "../lib/prisma";

const ROLES = new Set(["ADMIN", "CLIENT", "FREELANCER"]);

export interface AuthedRequest extends NextApiRequest {
  user?: { id: string; role: string };
}

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthedRequest, res: NextApiResponse) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        return sendError(res, 401, "Missing or invalid authorization header");
      }
      const token = auth.replace("Bearer ", "").trim();
      const payload = verifyAccessToken(token);

      const dbUser = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, isBanned: true },
      });

      if (!dbUser) {
        return sendError(res, 401, "Unauthorized");
      }
      if (dbUser.isBanned) {
        return sendError(res, 403, "User is banned");
      }
      if (!ROLES.has(dbUser.role)) {
        return sendError(res, 401, "Unauthorized");
      }

      req.user = { id: dbUser.id, role: dbUser.role };
      return handler(req, res);
    } catch {
      return sendError(res, 401, "Unauthorized");
    }
  };
}
