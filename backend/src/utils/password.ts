import bcrypt from "bcryptjs";
import { env } from "./env";
import crypto from "crypto";

function normalizePassword(password: string) {
  // Avoid visually confusable representations being treated as distinct values.
  return password.normalize("NFKC");
}

function preparePassword(password: string) {
  const normalized = normalizePassword(password);
  if (!env.PASSWORD_PEPPER) return normalized;
  return crypto.createHmac("sha256", env.PASSWORD_PEPPER).update(normalized).digest("hex");
}

export async function hashPassword(password: string) {
  const prepared = preparePassword(password);
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(prepared, salt);
}

export function comparePassword(password: string, hash: string) {
  const prepared = preparePassword(password);
  return bcrypt.compare(prepared, hash);
}
