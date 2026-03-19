import cron from "node-cron";
import { getLeaderboardTop10 } from "../services/leaderboard.service";

type CronGlobalState = typeof globalThis & {
  __leaderboardCronStarted?: boolean;
  __leaderboardCronRunning?: boolean;
};

function isEnabled() {
  return (process.env.LEADERBOARD_CRON_ENABLED ?? "true").toLowerCase() !== "false";
}

function getSchedule() {
  return process.env.LEADERBOARD_CRON_SCHEDULE || "0 0 1 */3 *";
}

function getTimezone() {
  return process.env.LEADERBOARD_CRON_TZ || "Asia/Ho_Chi_Minh";
}

async function recalculateLeaderboard(trigger: "startup" | "schedule") {
  const state = globalThis as CronGlobalState;
  if (state.__leaderboardCronRunning) return;
  state.__leaderboardCronRunning = true;

  try {
    const top10 = await getLeaderboardTop10();
    // eslint-disable-next-line no-console
    console.info(
      `[leaderboard-cron] recalculated (${trigger}) - top entries: ${top10.length}`
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[leaderboard-cron] recalculation failed", error);
  } finally {
    state.__leaderboardCronRunning = false;
  }
}

export function ensureLeaderboardCronStarted() {
  if (typeof window !== "undefined") return;
  if (!isEnabled()) return;

  const state = globalThis as CronGlobalState;
  if (state.__leaderboardCronStarted) return;

  const schedule = getSchedule();
  if (!cron.validate(schedule)) {
    // eslint-disable-next-line no-console
    console.error(
      `[leaderboard-cron] invalid cron expression "${schedule}", scheduler not started`
    );
    return;
  }

  cron.schedule(
    schedule,
    () => {
      void recalculateLeaderboard("schedule");
    },
    { timezone: getTimezone() }
  );

  state.__leaderboardCronStarted = true;

  void recalculateLeaderboard("startup");
  // eslint-disable-next-line no-console
  console.info(
    `[leaderboard-cron] started with schedule "${schedule}" (${getTimezone()})`
  );
}

