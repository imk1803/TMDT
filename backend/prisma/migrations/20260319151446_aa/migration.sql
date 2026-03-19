-- CreateTable
CREATE TABLE "JobMilestone" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobMilestone_jobId_idx" ON "JobMilestone"("jobId");

-- AddForeignKey
ALTER TABLE "JobMilestone" ADD CONSTRAINT "JobMilestone_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
