-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "companyLogoUrl" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "deadlineAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Job_deadlineAt_idx" ON "Job"("deadlineAt");
