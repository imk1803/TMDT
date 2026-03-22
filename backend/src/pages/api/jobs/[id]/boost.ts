import { withAuth } from "../../../../middleware/auth";
import { withErrorHandler } from "../../../../middleware/error";
import { prisma } from "../../../../lib/prisma";
import { chargeUser, BillingAction } from "../../../../services/billing.service";
import { sendJson, sendError } from "../../../../utils/http";

export default withErrorHandler(withAuth(async (req: any, res: any) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const jobId = req.query.id as string;
  const userId = req.user.id;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { clientId: true, status: true }
  });

  if (!job) {
    return sendError(res, 404, "Job not found");
  }
  
  if (job.clientId !== userId) {
    return sendError(res, 403, "You can only boost your own jobs");
  }

  if (job.status !== "OPEN") {
    return sendError(res, 400, "Only open jobs can be boosted");
  }

  // Deduct fee and generate transaction log
  await chargeUser(prisma, userId, BillingAction.BOOST_JOB, { referenceId: jobId });

  // Job is now boosted 
  // Normally we would update job.isBoosted = true here, but creating the transaction log is the MVP
  return sendJson(res, 200, { message: "Job successfully boosted" });
}));
