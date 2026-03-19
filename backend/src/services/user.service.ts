import { prisma } from "../lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
      freelancerProfile: true,
      clientProfile: true,
    },
  });
}

export async function updateUserProfile(userId: string, data: {
  name?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  companyName?: string;
  industry?: string;
  location?: string;
  tagline?: string;
}) {
  const hasFreelancerProfileData =
    data.title !== undefined || data.bio !== undefined || data.hourlyRate !== undefined;
  const hasClientProfileData =
    data.companyName !== undefined ||
    data.industry !== undefined ||
    data.location !== undefined ||
    data.tagline !== undefined;

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      avatarUrl: data.avatarUrl,
      freelancerProfile: hasFreelancerProfileData
        ? {
            upsert: {
              create: {
                title: data.title,
                bio: data.bio,
                hourlyRate: data.hourlyRate,
              },
              update: {
                title: data.title,
                bio: data.bio,
                hourlyRate: data.hourlyRate,
              },
            },
          }
        : undefined,
      clientProfile: hasClientProfileData
        ? {
            upsert: {
              create: {
                companyName: data.companyName,
                industry: data.industry,
                location: data.location,
                tagline: data.tagline,
              },
              update: {
                companyName: data.companyName,
                industry: data.industry,
                location: data.location,
                tagline: data.tagline,
              },
            },
          }
        : undefined,
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
      freelancerProfile: true,
      clientProfile: true,
    },
  });
}
