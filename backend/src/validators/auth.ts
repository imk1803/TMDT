import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // bcrypt ignores bytes after 72 chars; constrain to avoid silent truncation.
  password: z.string().min(6).max(72),
  role: z.enum(["CLIENT", "FREELANCER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});
