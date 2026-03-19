import type { NextApiRequest, NextApiResponse } from "next";
import { withErrorHandler } from "../middleware/error";
import { sendJson } from "../utils/http";
import { getLeaderboardTop10 } from "../services/leaderboard.service";

export const list = withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const leaderboard = await getLeaderboardTop10();
  sendJson(res, 200, { leaderboard });
});
