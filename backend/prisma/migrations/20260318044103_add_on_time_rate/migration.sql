-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "location" TEXT,
ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "FreelancerProfile" ADD COLUMN     "onTimeRate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "FreelancerProfile_onTimeRate_idx" ON "FreelancerProfile"("onTimeRate");
