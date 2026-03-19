-- CreateTable
CREATE TABLE "FreelancerCategory" (
    "freelancerProfileId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "FreelancerCategory_pkey" PRIMARY KEY ("freelancerProfileId","categoryId")
);

-- CreateIndex
CREATE INDEX "FreelancerCategory_categoryId_idx" ON "FreelancerCategory"("categoryId");

-- AddForeignKey
ALTER TABLE "FreelancerCategory" ADD CONSTRAINT "FreelancerCategory_freelancerProfileId_fkey" FOREIGN KEY ("freelancerProfileId") REFERENCES "FreelancerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerCategory" ADD CONSTRAINT "FreelancerCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
