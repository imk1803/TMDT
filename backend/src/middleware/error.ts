import type { NextApiHandler, NextApiResponse } from "next";
import { ZodError } from "zod";
import { HttpError, sendError } from "../utils/http";
import type { AuthedRequest } from "./auth";
import { ensureLeaderboardCronStarted } from "../lib/leaderboard-cron";

export function withErrorHandler(handler: NextApiHandler) {
  return async (req: AuthedRequest, res: NextApiResponse) => {
    ensureLeaderboardCronStarted();

    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    try {
      await handler(req, res);
      return;
    } catch (err) {
      // Log for server-side debugging
      // eslint-disable-next-line no-console
      console.error(err);

      if (err instanceof HttpError) {
        sendError(res, err.status, err.message);
        return;
      }
      if (err instanceof ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: err.flatten(),
        });
        return;
      }
      // Prisma unique constraint
      if ((err as any)?.code === "P2002") {
        sendError(res, 409, "Duplicate value");
        return;
      }
      sendError(res, 500, "Internal server error");
      return;
    }
  };
}
