import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http";

export async function listCompanies() {
  return prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true,
      name: true,
      email: true,
      clientProfile: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCompany(data: {
  name?: string;
  location?: string;
  industry?: string;
  employees?: string;
  tagline?: string;
  logoUrl?: string;
}) {
  if (!data.name) {
    throw new HttpError(400, "Company name is required");
  }

  return prisma.user.create({
    data: {
      name: data.name,
      email: `company_${Date.now()}@example.com`,
      passwordHash: "TEMP_DISABLED",
      role: "CLIENT",
      clientProfile: {
        create: {
          companyName: data.name,
          companyLogoUrl: data.logoUrl,
          companySize: data.employees,
          industry: data.industry,
          location: data.location,
          tagline: data.tagline,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      clientProfile: true,
      createdAt: true,
    },
  });
}

export async function updateCompany(id: string, data: {
  name?: string;
  location?: string;
  industry?: string;
  employees?: string;
  tagline?: string;
  logoUrl?: string;
}) {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      clientProfile: {
        upsert: {
          create: {
            companyName: data.name,
            companyLogoUrl: data.logoUrl,
            companySize: data.employees,
            industry: data.industry,
            location: data.location,
            tagline: data.tagline,
          },
          update: {
            companyName: data.name,
            companyLogoUrl: data.logoUrl,
            companySize: data.employees,
            industry: data.industry,
            location: data.location,
            tagline: data.tagline,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      clientProfile: true,
      createdAt: true,
    },
  });
}

export async function deleteCompany(id: string) {
  return prisma.user.delete({ where: { id } });
}
