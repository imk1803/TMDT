-- Ensure one freelancer can only submit one proposal per job.
CREATE UNIQUE INDEX "Proposal_jobId_freelancerId_key" ON "Proposal"("jobId", "freelancerId");
