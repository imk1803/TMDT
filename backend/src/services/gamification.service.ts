import { prisma } from "../lib/prisma";

const LEVEL_THRESHOLDS = [
  { level: "BRONZE" as const, minPoints: 0 },
  { level: "SILVER" as const, minPoints: 500 },
  { level: "GOLD" as const, minPoints: 1500 },
  { level: "PLATINUM" as const, minPoints: 3000 },
];

const DAILY_POINTS_CAP = 200;
const DESIGN_HERO_MIN_JOBS = 10;
const IT_HERO_MIN_JOBS = 10;
const MARKETING_HERO_MIN_JOBS = 10;
const CONTENT_HERO_MIN_JOBS = 10;

export const LEVEL_RULES = LEVEL_THRESHOLDS.map((t) => ({
  level: t.level,
  minPoints: t.minPoints,
}));

export type GamificationLevel = (typeof LEVEL_THRESHOLDS)[number]["level"];

function calculateLevel(points: number): GamificationLevel {
  const sorted = [...LEVEL_THRESHOLDS].sort((a, b) => b.minPoints - a.minPoints);
  const found = sorted.find((t) => points >= t.minPoints);
  return found ? found.level : "BRONZE";
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function getOrCreateProfile(userId: string) {
  const existing = await prisma.gamificationProfile.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  return prisma.gamificationProfile.create({
    data: { userId },
  });
}

async function computeIndustryBadges(userId: string) {
  const completed = await prisma.contract.findMany({
    where: { freelancerId: userId, status: "COMPLETED" },
    select: {
      job: {
        select: {
          category: {
            select: { name: true },
          },
        },
      },
    },
  });

  const counts = new Map<string, number>();
  for (const item of completed) {
    const name = item.job?.category?.name?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const badges: string[] = [];
  for (const [name, count] of Array.from(counts.entries())) {
    const key = normalizeText(name);
    if (count >= DESIGN_HERO_MIN_JOBS && key.includes("thiet ke")) {
      badges.push("Design Hero");
    }
    if (count >= IT_HERO_MIN_JOBS && (key.includes("cong nghe") || key.includes("it"))) {
      badges.push("IT Hero");
    }
    if (count >= MARKETING_HERO_MIN_JOBS && key.includes("marketing")) {
      badges.push("Marketing Hero");
    }
    if (
      count >= CONTENT_HERO_MIN_JOBS &&
      (key.includes("noi dung") || key.includes("viet") || key.includes("copy"))
    ) {
      badges.push("Content Hero");
    }
  }

  return badges;
}

async function computeBadges(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
    select: { completedJobs: true, avgRating: true, onTimeRate: true },
  });

  const badges: string[] = [];

  if (profile) {
    if (profile.completedJobs >= 50 && profile.avgRating >= 4.5) {
      badges.push("Top Performer");
    }
    if (profile.onTimeRate >= 95) {
      badges.push("Fast Responder");
    }
  }

  const industryBadges = await computeIndustryBadges(userId);
  badges.push(...industryBadges);

  return badges.sort();
}

async function addPointHistory(userId: string, points: number, reason: string, source: string) {
  if (points <= 0) return;
  await prisma.pointHistory.create({
    data: { userId, points, reason, source },
  });
}

async function addPoints(
  userId: string,
  points: number,
  reason: string,
  source: string,
  extraUpdates: Record<string, any> = {}
) {
  const profile = await getOrCreateProfile(userId);
  const now = new Date();
  const dailySame = profile.dailyPointsDate && sameDay(profile.dailyPointsDate, now);
  const currentDaily = dailySame ? profile.dailyPoints : 0;
  const dailyDate = dailySame ? profile.dailyPointsDate : now;
  const remaining = Math.max(0, DAILY_POINTS_CAP - currentDaily);
  const granted = Math.max(0, Math.min(points, remaining));

  const nextPoints = profile.points + granted;
  const nextDailyPoints = currentDaily + granted;
  const nextLevel = calculateLevel(nextPoints);
  const nextBadges = await computeBadges(userId);

  const updated = await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      points: nextPoints,
      level: nextLevel,
      badges: nextBadges,
      dailyPoints: nextDailyPoints,
      dailyPointsDate: dailyDate,
      ...extraUpdates,
    },
  });

  await addPointHistory(userId, granted, reason, source);
  return { profile: updated, granted };
}

export async function awardPoints(userId: string, points: number, reason = "activity") {
  return addPoints(userId, points, reason, "SYSTEM");
}

export async function applyDailyLogin(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const now = new Date();

  if (profile.lastDailyLoginAt && sameDay(profile.lastDailyLoginAt, now)) {
    return profile;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const nextStreak =
    profile.lastDailyLoginAt && sameDay(profile.lastDailyLoginAt, yesterday)
      ? profile.currentStreak + 1
      : 1;
  const nextLongest = Math.max(profile.longestStreak, nextStreak);

  let bonus = 0;
  if (nextStreak === 7) bonus = 20;
  if (nextStreak === 14) bonus = 40;
  if (nextStreak === 30) bonus = 80;

  const result = await addPoints(userId, 10 + bonus, "daily_login", "DAILY_LOGIN", {
    lastDailyLoginAt: now,
    currentStreak: nextStreak,
    longestStreak: nextLongest,
  });

  return result.profile;
}

export async function getGamification(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const nextLevel = calculateLevel(profile.points);
  const nextBadges = await computeBadges(userId);

  if (
    profile.level !== nextLevel ||
    JSON.stringify(profile.badges ?? []) !== JSON.stringify(nextBadges)
  ) {
    return prisma.gamificationProfile.update({
      where: { userId },
      data: { level: nextLevel, badges: nextBadges },
    });
  }

  return profile;
}

export async function listPointHistory(userId: string, limit = 20) {
  return prisma.pointHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function calculateLevelFromPoints(points: number) {
  return calculateLevel(points);
}

export const GAMIFICATION_LIMITS = {
  dailyPointsCap: DAILY_POINTS_CAP,
};
