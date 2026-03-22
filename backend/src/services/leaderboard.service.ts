import { prisma } from "../lib/prisma";

const db = prisma as any;

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function meetsQualification(stats: {
  totalCompletedJobs: number;
  totalEarnings: number;
  averageRating: number;
  onTimeRate: number;
}) {
  return (
    stats.totalCompletedJobs >= 50 &&
    stats.totalEarnings >= 40_000_000 &&
    stats.averageRating >= 4.5 &&
    stats.onTimeRate >= 90
  );
}

function calculateScore(stats: {
  totalCompletedJobs: number;
  totalEarnings: number;
  averageRating: number;
  onTimeRate: number;
}) {
  return (
    stats.totalCompletedJobs * 2 +
    stats.totalEarnings / 1_000_000 +
    stats.averageRating * 20 +
    stats.onTimeRate * 1.5
  );
}

export async function getLeaderboardTop10() {
  const users = await db.user.findMany({
    where: {
      role: "FREELANCER",
      isBanned: false,
      freelancerProfile: { isNot: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      freelancerProfile: {
        select: {
          title: true,
          completedJobs: true,
          totalIncome: true,
          avgRating: true,
          onTimeRate: true,
          categories: {
            include: { category: true },
          },
        },
      },
    },
  });

  const scored: Array<{
    user: any;
    stats: {
      totalCompletedJobs: number;
      totalEarnings: number;
      averageRating: number;
      onTimeRate: number;
    };
    qualified: boolean;
    score: number;
  }> = users.map((user: any) => {
    const profile = user.freelancerProfile || {};
    const stats = {
      totalCompletedJobs: toNumber(profile.completedJobs),
      totalEarnings: toNumber(profile.totalIncome),
      averageRating: toNumber(profile.avgRating),
      onTimeRate: toNumber(profile.onTimeRate),
    };
    const qualified = meetsQualification(stats);
    const score = qualified ? calculateScore(stats) : 0;
    return {
      user,
      stats,
      qualified,
      score,
    };
  });

  await Promise.all(
    scored.map((row: { user: { id: string }; score: number }) =>
      db.freelancerProfile.updateMany({
        where: { userId: row.user.id },
        data: { leaderboardScore: row.score },
      })
    )
  );

  const top10 = scored
    .filter((row: { qualified: boolean }) => row.qualified)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 10)
    .map((row, index) => ({
      rank: index + 1,
      user: {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        avatarUrl: row.user.avatarUrl,
        title: row.user.freelancerProfile?.title || null,
        categories:
          row.user.freelancerProfile?.categories
            ?.map((c: any) => c.category?.name)
            .filter(Boolean) || [],
      },
      score: Number(row.score.toFixed(2)),
      stats: {
        total_completed_jobs: row.stats.totalCompletedJobs,
        total_earnings: row.stats.totalEarnings,
        average_rating: row.stats.averageRating,
        on_time_rate: row.stats.onTimeRate,
      },
    }));

  return top10;
}
