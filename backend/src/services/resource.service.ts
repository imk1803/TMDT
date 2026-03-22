import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http";

export async function createResource(userId: string, data: { contractId: string; type: "FILE" | "IMAGE" | "LINK"; url: string; fileName?: string; fileSize?: number }) {
  const contract = await prisma.contract.findUnique({
    where: { id: data.contractId },
    select: { clientId: true, freelancerId: true }
  });
  if (!contract) throw new HttpError(404, "Contract not found");
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new HttpError(403, "Not part of this contract");
  }

  const resource = await prisma.resource.create({
    data: {
      contractId: data.contractId,
      uploaderId: userId,
      type: data.type,
      url: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
    }
  });

  await prisma.contractActivity.create({
    data: {
      contractId: data.contractId,
      userId,
      message: `đã tải lên ${data.type === 'LINK' ? 'liên kết' : 'tệp'} ${data.fileName || 'không tên'}`,
    }
  });

  return resource;
}

export async function listResources(userId: string, contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { clientId: true, freelancerId: true }
  });
  if (!contract) throw new HttpError(404, "Contract not found");
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new HttpError(403, "Not part of this contract");
  }

  const resources = await prisma.resource.findMany({
    where: { contractId },
    orderBy: { createdAt: 'desc' },
    include: { uploader: { select: { id: true, name: true, email: true } } }
  });
  return resources;
}

export async function deleteResource(userId: string, resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      contract: { select: { clientId: true } }
    }
  });

  if (!resource) throw new HttpError(404, "Resource not found");
  
  if (resource.uploaderId !== userId) {
    throw new HttpError(403, "Only uploader can delete this resource");
  }

  await prisma.resource.delete({
    where: { id: resourceId }
  });

  await prisma.contractActivity.create({
    data: {
      contractId: resource.contractId,
      userId,
      message: `đã xóa ${resource.type === 'LINK' ? 'liên kết' : 'tệp'} ${resource.fileName || 'không tên'}`,
    }
  });

  return true;
}
