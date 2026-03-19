import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/http";
import { createNotification } from "./notification.service";

export async function createProposal(freelancerId: string, data: {
  jobId: string;
  coverLetter?: string;
  bidAmount: number;
}) {
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    select: { id: true, clientId: true, status: true },
  });

  if (!job) {
    throw new HttpError(404, "Job not found");
  }
  if (job.status !== "OPEN") {
    throw new HttpError(400, "Job is not open for proposals");
  }
  if (job.clientId === freelancerId) {
    throw new HttpError(400, "You cannot apply to your own job");
  }

  const existing = await prisma.proposal.findFirst({
    where: { jobId: data.jobId, freelancerId },
    select: { id: true },
  });

  if (existing) {
    throw new HttpError(409, "You have already submitted a proposal for this job");
  }

  const proposal = await prisma.proposal.create({
    data: {
      jobId: data.jobId,
      freelancerId,
      coverLetter: data.coverLetter,
      bidAmount: data.bidAmount,
    },
  });

  await createNotification({
    userId: job.clientId,
    type: "PROPOSAL",
    title: "Bạn có đề xuất mới",
    body: "Một freelancer vừa ứng tuyển vào tin tuyển dụng của bạn.",
    link: `/jobs/${job.id}`,
  });

  return proposal;
}

export async function getProposalWithJob(proposalId: string) {
  return prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { job: true },
  });
}

export async function updateProposalStatus(proposalId: string, status: "ACCEPTED" | "REJECTED") {
  return prisma.proposal.update({
    where: { id: proposalId },
    data: { status },
  });
}

export async function deleteProposal(proposalId: string) {
  return prisma.proposal.delete({ where: { id: proposalId } });
}

export async function listFreelancerProposals(freelancerId: string) {
  return prisma.proposal.findMany({
    where: { freelancerId },
    include: {
      job: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              clientProfile: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
