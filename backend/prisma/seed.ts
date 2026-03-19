import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

console.log("SEED START");

async function main() {
  console.log("Seeding: reset data...");
  // Reset data in correct order
  await prisma.review.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.freelancerSkill.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.report.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.job.deleteMany();
  await prisma.category.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.freelancerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding: creating admin...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  console.log("Seeding: creating clients...");
  const clients = await Promise.all(
    ["client1", "client2", "client3"].map((name, i) =>
      prisma.user.create({
        data: {
          name: `Client ${i + 1}`,
          email: `${name}@example.com`,
          passwordHash,
          role: "CLIENT",
          clientProfile: { create: { companyName: `Company ${i + 1}` } },
        },
      })
    )
  );
  console.log("Clients created:", clients.length);

  console.log("Seeding: creating freelancers...");
  const freelancers = await Promise.all(
    ["freelancer1", "freelancer2", "freelancer3", "freelancer4", "freelancer5"].map(
      (name, i) =>
        prisma.user.create({
          data: {
            name: `Freelancer ${i + 1}`,
            email: `${name}@example.com`,
            passwordHash,
            role: "FREELANCER",
            freelancerProfile: { create: { title: "Full-stack Dev", hourlyRate: 25 + i } },
          },
        })
    )
  );
  console.log("Freelancers created:", freelancers.length);

  console.log("Seeding: creating categories...");
  const categories = await prisma.category.createMany({
    data: [
      { name: "Web Development" },
      { name: "Design" },
      { name: "Marketing" },
    ],
    skipDuplicates: true,
  });
  console.log("Categories created:", categories.count);

  console.log("Seeding: creating skills...");
  const skills = await prisma.skill.createMany({
    data: [
      { name: "React" },
      { name: "Node.js" },
      { name: "UI/UX" },
      { name: "SEO" },
    ],
    skipDuplicates: true,
  });
  console.log("Skills created:", skills.count);

  const categoryList = await prisma.category.findMany();
  const skillList = await prisma.skill.findMany();

  console.log("Seeding: creating jobs...");
  const jobs = [] as any[];
  for (let i = 0; i < 10; i++) {
    const client = clients[i % clients.length];
    const job = await prisma.job.create({
      data: {
        clientId: client.id,
        title: `Project ${i + 1}`,
        description: "Build a feature for the marketplace",
        budget: 500 + i * 50,
        categoryId: categoryList[i % categoryList.length]?.id,
        skills: {
          create: [{ skillId: skillList[i % skillList.length].id }],
        },
      },
    });
    jobs.push(job);
  }
  console.log("Jobs created:", jobs.length);

  console.log("Seeding: creating proposals...");
  const proposals = [] as any[];
  for (let i = 0; i < 20; i++) {
    const job = jobs[i % jobs.length];
    const freelancer = freelancers[i % freelancers.length];
    const proposal = await prisma.proposal.create({
      data: {
        jobId: job.id,
        freelancerId: freelancer.id,
        coverLetter: "I can deliver fast and high quality.",
        bidAmount: 400 + i * 20,
      },
    });
    proposals.push(proposal);
  }
  console.log("Proposals created:", proposals.length);

  console.log("Seeding: creating contracts...");
  const contracts = [] as any[];
  for (let i = 0; i < 5; i++) {
    const proposal = proposals[i];
    const job = jobs.find((j) => j.id === proposal.jobId)!;
    const contract = await prisma.contract.create({
      data: {
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: proposal.freelancerId,
        price: proposal.bidAmount,
        status: "ACTIVE",
      },
    });
    contracts.push(contract);
  }
  console.log("Contracts created:", contracts.length);

  console.log("Seeding: creating reviews...");
  for (let i = 0; i < 10; i++) {
    const contract = contracts[i % contracts.length];
    await prisma.review.create({
      data: {
        contractId: contract.id,
        reviewerId: contract.clientId,
        revieweeId: contract.freelancerId,
        rating: 4,
        comment: "Great work",
      },
    });
  }
  console.log("Reviews created: 10");

  console.log("Seeding: creating admin action...");
  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "OTHER",
      targetType: "USER",
      targetId: clients[0].id,
      note: "Seeded admin action",
    },
  });
  console.log("Admin action created");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
