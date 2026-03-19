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
