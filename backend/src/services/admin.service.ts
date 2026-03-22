import { prisma } from "../lib/prisma";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
      freelancerProfile: true,
      clientProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function banUser(id: string, banned: boolean) {
  return prisma.user.update({ where: { id }, data: { isBanned: banned } });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function listJobs() {
  return prisma.job.findMany({ orderBy: { createdAt: "desc" } });
}

export async function deleteJob(id: string) {
  return prisma.job.delete({ where: { id } });
}

export async function listReports() {
  return prisma.report.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateReport(id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED") {
  return prisma.report.update({ where: { id }, data: { status } });
}

export async function listSupportTickets() {
  return prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateSupportTicket(id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") {
  return prisma.supportTicket.update({ where: { id }, data: { status } });
}

export async function getDashboardStats() {
  const [totalUsers, totalJobs, activeContracts, platformRev] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    getPlatformRevenue()
  ]);
  
  return { totalUsers, totalJobs, activeContracts, totalRevenue: platformRev };
}

export async function getPlatformRevenue() {
  const result = await prisma.transaction.aggregate({
    where: { category: "PLATFORM" },
    _sum: { amount: true }
  });
  return Number(result._sum.amount || 0);
}

export async function getUserTransactionVolume() {
  const result = await prisma.transaction.aggregate({
    where: { category: "USER" },
    _sum: { amount: true }
  });
  return Number(result._sum.amount || 0);
}

export async function listAllContracts() {
  return prisma.contract.findMany({
    include: { client: { select: { name: true, email: true } }, freelancer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function listAllTransactions() {
  return prisma.transaction.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminLeaderboard() {
  return prisma.freelancerProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } }
    },
    orderBy: { completedJobs: 'desc' },
    take: 50
  });
}

export async function getAdminResources() {
  return prisma.resource.findMany({
    include: {
      uploader: { select: { name: true, email: true } },
      contract: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}
