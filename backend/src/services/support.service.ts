import { PrismaClient, SupportStatus, SupportType, SupportPriority } from "@prisma/client";
import { createNotification } from "./notification.service";

const prisma = new PrismaClient();

export async function createSupportTicket(
  senderId: string,
  data: {
    contractId?: string;
    title: string;
    description: string;
    type: SupportType;
    priority?: SupportPriority;
  }
) {
  const ticket = await prisma.supportTicket.create({
    data: {
      senderId,
      contractId: data.contractId,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority || "MEDIUM",
      status: "OPEN",
    },
    include: {
      contract: {
        select: {
          id: true,
          job: { select: { title: true } },
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  await createNotification(senderId, "notification:ticket_created", {
    title: "Yêu cầu hỗ trợ đã được gửi",
    body: "Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi sớm nhất.",
    link: `/support/${ticket.id}`,
    category: "SUPPORT",
    referenceId: ticket.id,
  });

  return ticket;
}

export async function getUserTickets(userId: string) {
  return prisma.supportTicket.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      contract: {
        select: {
          id: true,
          job: { select: { title: true } },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}

export async function getTicketDetail(ticketId: string, userId?: string, isAdmin = false) {
  const whereClause: any = { id: ticketId };
  if (!isAdmin && userId) {
    // If user is neither admin nor sender, but might be part of the contract (client/freelancer)
    whereClause.OR = [
      { senderId: userId },
      {
        contract: {
          OR: [{ clientId: userId }, { freelancerId: userId }],
        },
      },
    ];
  }

  return prisma.supportTicket.findFirst({
    where: whereClause,
    include: {
      contract: {
        select: {
          id: true,
          status: true,
          job: { select: { id: true, title: true } },
          client: { select: { id: true, name: true, avatarUrl: true } },
          freelancer: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  message: string,
  attachments?: string[]
) {
  // Check if ticket exists
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket not found");

  const msg = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId,
      message,
      attachments: attachments || [],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  if (senderId !== ticket.senderId) {
    await createNotification(ticket.senderId, "notification:ticket_replied", {
      title: "Phản hồi mới từ bộ phận hỗ trợ",
      body: "Ticket của bạn đã có phản hồi mới từ quản trị viên.",
      link: `/support/${ticketId}`,
      category: "SUPPORT",
      referenceId: ticketId,
    });
  }

  // Automatically update ticket status if it was CLOSED or RESOLVED and someone replied?
  // We can leave this logic up to business requirements.
  return msg;
}

export async function getAllTickets(filters: { status?: SupportStatus; type?: SupportType; priority?: SupportPriority }) {
  const whereClause: any = {};
  if (filters.status) whereClause.status = filters.status;
  if (filters.type) whereClause.type = filters.type;
  if (filters.priority) whereClause.priority = filters.priority;

  return prisma.supportTicket.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { id: true, name: true, role: true, avatarUrl: true },
      },
      contract: {
        select: { id: true, job: { select: { title: true } } },
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}

export async function updateTicketStatus(
  ticketId: string,
  data: { status?: SupportStatus; priority?: SupportPriority }
) {
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
  });

  if (data.status) {
    await createNotification(updated.senderId, "notification:ticket_status_updated", {
      title: "Trạng thái khiếu nại được cập nhật",
      body: `Ticket của bạn đã được chuyển sang trạng thái: ${data.status}`,
      link: `/support/${ticketId}`,
      category: "SUPPORT",
      referenceId: ticketId,
    });
  }
  return updated;
}
