import { prisma } from "../lib/prisma";
import { createNotification } from "./notification.service";

export async function listMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(senderId: string, data: {
  conversationId: string;
  receiverId: string;
  content: string;
}) {
  return prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId,
      receiverId: data.receiverId,
      content: data.content,
    },
  });
}

export async function getContractForUser(contractId: string, userId: string) {
  return prisma.contract.findFirst({
    where: {
      id: contractId,
      OR: [{ clientId: userId }, { freelancerId: userId }],
    },
    select: {
      id: true,
      clientId: true,
      freelancerId: true,
    },
  });
}

export async function getOrCreateConversationByContract(contractId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { contractId },
  });
  if (existing) return existing;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { clientId: true, freelancerId: true },
  });
  if (!contract) {
    throw new Error("Contract not found");
  }

  return prisma.conversation.create({
    data: {
      contractId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
    },
  });
}

export async function listContractMessages(contractId: string, userId: string) {
  const contract = await getContractForUser(contractId, userId);
  if (!contract) {
    throw new Error("Forbidden");
  }
  const conversation = await getOrCreateConversationByContract(contractId);
  return prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
}

export async function createContractMessage(contractId: string, senderId: string, content: string) {
  const contract = await getContractForUser(contractId, senderId);
  if (!contract) {
    throw new Error("Forbidden");
  }
  const conversation = await getOrCreateConversationByContract(contractId);
  const receiverId = contract.clientId === senderId ? contract.freelancerId : contract.clientId;

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
    },
    include: {
      sender: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  await createNotification(receiverId, "notification:new_message", {
    title: `Có tin nhắn mới từ ${message.sender?.name || "đối tác"}`,
    body: typeof content === "string" ? (content.length > 50 ? content.substring(0, 50) + "..." : content) : "Bạn nhận được tin nhắn mới.",
    link: `/contracts/${contractId}`,
    category: "MESSAGE",
    referenceId: message.id,
  });

  return message;
}

export async function markContractMessagesRead(contractId: string, userId: string) {
  const contract = await getContractForUser(contractId, userId);
  if (!contract) {
    throw new Error("Forbidden");
  }
  const conversation = await getOrCreateConversationByContract(contractId);

  const unread = await prisma.message.findMany({
    where: {
      conversationId: conversation.id,
      receiverId: userId,
      readAt: null,
    },
    select: { id: true },
  });
  if (unread.length === 0) {
    return [];
  }

  const now = new Date();
  await prisma.message.updateMany({
    where: {
      id: { in: unread.map((m) => m.id) },
    },
    data: {
      readAt: now,
    },
  });

  return unread.map((m) => m.id);
}
