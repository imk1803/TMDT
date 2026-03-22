import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

console.log("SEED START");

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Seeding: reset data...");
  await prisma.review.deleteMany();
  await prisma.milestone.deleteMany();
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
      name: "Admin Platform",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeding: creating clients...");
  const clients = await Promise.all(
    Array.from({ length: 15 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Client CEO ${i + 1}`,
          email: `client${i + 1}@example.com`,
          passwordHash,
          role: "CLIENT",
          avatarUrl: `https://i.pravatar.cc/150?img=${i + 50}`,
          clientProfile: { create: { companyName: `Tech Corp ${i + 1}` } },
        },
      })
    )
  );

  console.log("Seeding: creating categories and skills...");
  const categories = await prisma.category.createManyAndReturn({
    data: [{ name: "Web Development" }, { name: "Mobile Apps" }, { name: "Design & UX" }, { name: "AI & Machine Learning" }, { name: "Marketing & Truyền thông" }, { name: "Viết lách & Nội dung" }],
    skipDuplicates: true,
  });

  const skills = await prisma.skill.createManyAndReturn({
    data: [{ name: "React" }, { name: "Node.js" }, { name: "Python" }, { name: "Figma" }, { name: "SEO" }, { name: "Copywriting" }],
    skipDuplicates: true,
  });

  console.log("Seeding: creating freelancers...");
  const freelancers = await Promise.all(
    Array.from({ length: 30 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Freelancer Pro ${i + 1}`,
          email: `freelancer${i + 1}@example.com`,
          passwordHash,
          role: "FREELANCER",
          avatarUrl: `https://i.pravatar.cc/150?img=${i + 1}`,
          freelancerProfile: { 
            create: { 
              title: ["Senior Web Developer", "UI/UX Designer", "Marketing Expert", "AI Engineer", "Content Writer"][i % 5], 
              hourlyRate: 30 + (i % 5)*10,
              completedJobs: 50 + i * 2,
              totalIncome: 45000000 + i * 3000000,
              avgRating: 4.5 + (Math.random() * 0.5),
              onTimeRate: 90 + (Math.random() * 10),
              categories: {
                create: [
                  { categoryId: categories[i % categories.length].id }
                ]
              }
            } 
          },
        },
      })
    )
  );

  console.log("Seeding: Wallets...");
  const users = [...clients, ...freelancers];
  for (const u of users) {
    await prisma.wallet.create({
      data: { userId: u.id, availableBalance: Math.floor(Math.random() * 50000000), heldBalance: Math.floor(Math.random() * 10000000) }
    });
  }

  // Categories and Skills moved above

  console.log("Seeding: creating jobs...");
  const jobs = [];
  for (let i = 0; i < 40; i++) {
    const client = clients[i % clients.length];
    const job = await prisma.job.create({
      data: {
        clientId: client.id,
        title: `Project ${i + 1}: ${['Build E-commerce', 'Fix Bugs', 'Design Landing Page', 'Train AI Model'][i % 4]}`,
        description: "Need an expert to deliver high quality results fast.",
        budget: 5000000 + i * 500000,
        categoryId: categories[i % categories.length]?.id,
        status: i % 5 === 0 ? "CANCELLED" : "OPEN",
        skills: { create: [{ skillId: skills[i % skills.length].id }] },
      },
    });
    jobs.push(job);
  }

  console.log("Seeding: creating proposals...");
  const proposals = [];
  for (let i = 0; i < 100; i++) {
    const job = jobs[i % jobs.length];
    const freelancer = freelancers[i % freelancers.length];
    const proposal = await prisma.proposal.create({
      data: {
        jobId: job.id,
        freelancerId: freelancer.id,
        coverLetter: "I have 5 years of experience in this exact stack.",
        bidAmount: job.budget ? Number(job.budget) * 0.9 : 1000000,
        status: i % 10 === 0 ? "ACCEPTED" : (i % 5 === 0 ? "REJECTED" : "PENDING")
      },
    });
    proposals.push(proposal);
  }

  console.log("Seeding: creating contracts and milestones...");
  const contracts = [];
  for (let i = 0; i < 30; i++) {
    const proposal = proposals[i % proposals.length];
    const job = jobs.find((j) => j.id === proposal.jobId)!;
    const isCompleted = i % 3 === 0;
    const contract = await prisma.contract.create({
      data: {
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: proposal.freelancerId,
        price: proposal.bidAmount,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
      },
    });
    contracts.push(contract);

    // Milestones
    await prisma.milestone.create({
      data: {
        contractId: contract.id,
        title: "Phase 1: Setup & Design",
        amount: Number(contract.price) * 0.4,
        status: isCompleted ? "APPROVED" : "IN_PROGRESS"
      }
    });

    if (isCompleted) {
       await prisma.review.create({
         data: {
           contractId: contract.id,
           reviewerId: contract.clientId,
           revieweeId: contract.freelancerId,
           rating: 4 + Math.random(),
           comment: "Excellent work, highly recommend!",
         },
       });
    }
  }

  console.log("Seeding: Transactions (SaaS KPI Generator)...");
  const now = new Date();
  const past60Days = new Date();
  past60Days.setDate(now.getDate() - 60);

  const transactionsData = [];
  for (let i = 0; i < 300; i++) {
    const isPlatform = Math.random() > 0.4;
    const date = randomDate(past60Days, now);
    const user = users[Math.floor(Math.random() * users.length)];

    if (isPlatform) {
      const actions = ["POST_JOB", "ACCEPT_PROPOSAL", "RELEASE_PAYMENT", "BOOST_JOB"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      let amount = 0;
      if (action === "POST_JOB") amount = 10000;
      else if (action === "BOOST_JOB") amount = 50000;
      else if (action === "RELEASE_PAYMENT") amount = Math.floor(Math.random() * 5000000) * 0.1;
      else amount = 15000;

      transactionsData.push({
        userId: user.id,
        amount,
        type: "DEBIT" as any,
        category: "PLATFORM" as any,
        action,
        description: `Platform Fee: ${action}`,
        createdAt: date
      });
    } else {
      const actions = ["TOPUP", "WITHDRAW", "ESCROW_HOLD", "ESCROW_RELEASE"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const amount = Math.floor(Math.random() * 10000000) + 500000;
      transactionsData.push({
        userId: user.id,
        amount,
        type: action === "WITHDRAW" || action === "ESCROW_HOLD" ? "DEBIT" as any : "CREDIT" as any,
        category: "USER" as any,
        action,
        description: `User TX: ${action}`,
        createdAt: date
      });
    }
  }

  // Sort by date ascending to simulate real event stream
  transactionsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  for (const t of transactionsData) {
     await prisma.transaction.create({ data: t });
  }

  console.log("DONE! The UI will now shine.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
