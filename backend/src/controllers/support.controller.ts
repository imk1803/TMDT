import { NextApiResponse } from "next";
import { withAuth, AuthedRequest } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";
import * as supportService from "../services/support.service";
import { SupportType, SupportPriority, SupportStatus } from "@prisma/client";

export const createTicket = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();
  
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { contractId, title, description, type, priority } = req.body;
  if (!title || !description || !type) {
    return res.status(400).json({ error: "Thiếu trường bắt buộc (title, description, type)" });
  }

  const ticket = await supportService.createSupportTicket(userId, {
    contractId,
    title,
    description,
    type: type as SupportType,
    priority: (priority as SupportPriority) || "MEDIUM",
  });

  return res.status(201).json({ ticket });
}));

export const getMyTickets = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405).end();
  
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const tickets = await supportService.getUserTickets(userId);
  return res.json({ tickets });
}));

export const getTicketDetail = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405).end();

  const ticketId = req.query.id as string;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === "ADMIN";

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const ticket = await supportService.getTicketDetail(ticketId, userId, isAdmin);
  if (!ticket) return res.status(404).json({ error: "Ticket not found or unauthorized access." });

  return res.json({ ticket });
}));

export const replyToTicket = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const ticketId = req.query.id as string;
  const senderId = req.user?.id;
  const { message, attachments } = req.body;

  if (!senderId) return res.status(401).json({ error: "Unauthorized" });
  if (!message) return res.status(400).json({ error: "Message content required." });

  const msg = await supportService.addTicketMessage(ticketId, senderId, message, attachments);
  return res.status(201).json({ message: msg });
}));

// Admin Endpoints
export const getAllTickets = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.status(405).end();

  const { status, type, priority } = req.query;
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const tickets = await supportService.getAllTickets({
    status: status as SupportStatus,
    type: type as SupportType,
    priority: priority as SupportPriority,
  });
  return res.json({ tickets });
}));

export const updateTicket = withErrorHandler(withAuth(async (req: AuthedRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") return res.status(405).end();

  const ticketId = req.query.id as string;
  const { status, priority } = req.body;

  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const ticket = await supportService.updateTicketStatus(ticketId, {
    status: status as SupportStatus,
    priority: priority as SupportPriority,
  });
  
  return res.json({ ticket });
}));
