-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "dueAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Contract_dueAt_idx" ON "Contract"("dueAt");
