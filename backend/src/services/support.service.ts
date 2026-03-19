import { prisma } from "../lib/prisma";

export async function createSupportTicket(userId: string, data: { subject: string; message: string }) {
  return prisma.supportTicket.create({
    data: { userId, subject: data.subject, message: data.message },
  });
}

export async function listMySupportTickets(userId: string) {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
