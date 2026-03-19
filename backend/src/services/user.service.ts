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
      freelancerProfile: {
        include: {
          categories: {
            include: { category: true },
          },
        },
      },
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
  categories?: string[];
  companyName?: string;
  industry?: string;
  location?: string;
  tagline?: string;
}) {
  const hasFreelancerProfileData =
    data.title !== undefined ||
    data.bio !== undefined ||
    data.hourlyRate !== undefined ||
    data.categories !== undefined;
  const hasClientProfileData =
    data.companyName !== undefined ||
    data.industry !== undefined ||
    data.location !== undefined ||
    data.tagline !== undefined;

  return prisma.$transaction(async (tx) => {
    let categoryIds: string[] | undefined;

    if (data.categories) {
      const names = data.categories.map((c) => c.trim()).filter(Boolean);
      const unique = Array.from(new Set(names));
      const created = await Promise.all(
        unique.map((name) =>
          tx.category.upsert({
            where: { name },
            create: { name },
            update: {},
            select: { id: true },
          })
        )
      );
      categoryIds = created.map((c) => c.id);
    }

    const user = await tx.user.update({
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
                  categories: categoryIds
                    ? {
                        createMany: {
                          data: categoryIds.map((categoryId) => ({ categoryId })),
                          skipDuplicates: true,
                        },
                      }
                    : undefined,
                },
                update: {
                  title: data.title,
                  bio: data.bio,
                  hourlyRate: data.hourlyRate,
                  categories: categoryIds
                    ? {
                        deleteMany: {},
                        createMany: {
                          data: categoryIds.map((categoryId) => ({ categoryId })),
                          skipDuplicates: true,
                        },
                      }
                    : undefined,
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
        freelancerProfile: {
          include: {
            categories: {
              include: { category: true },
            },
          },
        },
        clientProfile: true,
      },
    });

    return user;
  });
}
