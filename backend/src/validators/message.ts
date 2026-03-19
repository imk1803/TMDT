import { z } from "zod";

export const createMessageSchema = z.object({
  conversationId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1),
});
