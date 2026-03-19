import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";
import { sendJson } from "../utils/http";
import {
  getGamification,
  LEVEL_RULES,
  GAMIFICATION_LIMITS,
  listPointHistory,
} from "../services/gamification.service";

export const meGamification = withErrorHandler(
  withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.status(405).end();
      return;
    }

    const userId = (req as any).user.id as string;
    const gamification = await getGamification(userId);
    const history = await listPointHistory(userId, 20);

    sendJson(res, 200, {
      gamification: {
        points: gamification.points,
        level: gamification.level,
        badges: gamification.badges,
        lastDailyLoginAt: gamification.lastDailyLoginAt,
        currentStreak: gamification.currentStreak,
        longestStreak: gamification.longestStreak,
        dailyPoints: gamification.dailyPoints,
        dailyPointsDate: gamification.dailyPointsDate,
      },
      levelRules: LEVEL_RULES,
      limits: GAMIFICATION_LIMITS,
      history,
    });
  })
);
