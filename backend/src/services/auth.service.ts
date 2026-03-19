import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { HttpError } from "../utils/http";
import crypto from "crypto";
import { applyDailyLogin } from "../services/gamification.service";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function selectSafeUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "CLIENT" | "FREELANCER";
  categories?: string[];
}) {
  if (!input.name || !input.email || !input.password) {
    throw new HttpError(400, "Name, email and password are required");
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new HttpError(409, "Email already in use");
  }
  const passwordHash = await hashPassword(input.password);
  const role = input.role ?? "CLIENT";
  if (role === "FREELANCER" && (!input.categories || input.categories.length === 0)) {
    throw new HttpError(400, "Freelancer categories are required");
  }
  const categoryNames =
    role === "FREELANCER" && input.categories
      ? Array.from(new Set(input.categories.map((c) => c.trim()).filter(Boolean)))
      : [];

  const user = await prisma.$transaction(async (tx) => {
    const categoryIds =
      categoryNames.length > 0
        ? (
            await Promise.all(
              categoryNames.map((name) =>
                tx.category.upsert({
                  where: { name },
                  create: { name },
                  update: {},
                  select: { id: true },
                })
              )
            )
          ).map((c) => c.id)
        : [];

    return tx.user.create({
      data: {
        name: input.name,
        email: normalizedEmail,
        passwordHash,
        role,
        clientProfile: role === "CLIENT" ? { create: {} } : undefined,
        freelancerProfile:
          role === "FREELANCER"
            ? {
                create: {
                  categories: categoryIds.length
                    ? {
                        createMany: {
                          data: categoryIds.map((categoryId) => ({ categoryId })),
                          skipDuplicates: true,
                        },
                      }
                    : undefined,
                },
              }
            : undefined,
        gamificationProfile: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  return user;
}

export async function loginUser(input: { email?: string; password?: string }) {
  if (!input.email || !input.password) {
    throw new HttpError(400, "Email and password are required");
  }

  const normalizedEmail = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }
  if (user.isBanned) {
    throw new HttpError(403, "User is banned");
  }
  const ok = await comparePassword(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const safeUser = await selectSafeUser(user.id);

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  try {
    await applyDailyLogin(user.id);
  } catch {
    // do not block login on gamification
  }

  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshUserToken(input: { refreshToken?: string }) {
  if (!input.refreshToken) {
    throw new HttpError(400, "Refresh token is required");
  }
  const payload = verifyRefreshToken(input.refreshToken);
  const tokenHash = hashToken(input.refreshToken);

  const existing = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!existing) {
    throw new HttpError(401, "Invalid refresh token");
  }
  if (existing.user.isBanned) {
    throw new HttpError(403, "User is banned");
  }

  const nextAccessToken = signAccessToken({ sub: existing.userId, role: existing.user.role });
  const nextRefreshToken = signRefreshToken({ sub: existing.userId, role: existing.user.role });
  const nextRefreshTokenHash = hashToken(nextRefreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: nextRefreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const safeUser = await selectSafeUser(existing.userId);
  return { user: safeUser, accessToken: nextAccessToken, refreshToken: nextRefreshToken };
}

export async function logoutUser(refreshToken?: string) {
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token is required");
  }
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
