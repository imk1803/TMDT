import jwt from "jsonwebtoken";
import { env } from "./env";

const ROLES = ["ADMIN", "CLIENT", "FREELANCER"] as const;

export interface JwtPayload {
  sub: string;
  role: string;
  tokenType?: "access" | "refresh";
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign({ ...payload, tokenType: "access" }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign({ ...payload, tokenType: "refresh" }, env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

function normalizePayload(decoded: unknown, expectedType: "access" | "refresh"): JwtPayload {
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload");
  }
  const payload = decoded as Record<string, unknown>;
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  const role = typeof payload.role === "string" ? payload.role : "";
  const tokenType = typeof payload.tokenType === "string" ? payload.tokenType : undefined;

  if (!sub) throw new Error("Invalid token subject");
  if (!ROLES.includes(role as (typeof ROLES)[number])) throw new Error("Invalid token role");

  // Backward-compatible: allow legacy tokens without tokenType claim.
  if (tokenType && tokenType !== expectedType) {
    throw new Error("Invalid token type");
  }

  return {
    sub,
    role,
    tokenType: tokenType as JwtPayload["tokenType"] | undefined,
  };
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return normalizePayload(decoded, "access");
}

export function verifyRefreshToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return normalizePayload(decoded, "refresh");
}
