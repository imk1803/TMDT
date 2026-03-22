import { z } from "zod";

export const addLinkSchema = z.object({
  contractId: z.string(),
  url: z.string().url(),
  fileName: z.string().optional(),
});
