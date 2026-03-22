const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const txCount = await prisma.transaction.count();
  console.log('Total transactions:', txCount);
  
  const allTx = await prisma.transaction.findMany({ take: 2 });
  console.log('Sample:', allTx);
}

main().catch(console.error).finally(() => prisma.$disconnect());
