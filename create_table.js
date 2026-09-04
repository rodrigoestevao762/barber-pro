const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CashClosing" (
      "id" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "totalRevenue" DOUBLE PRECISION NOT NULL,
      "totalExpenses" DOUBLE PRECISION,
      "closedBy" TEXT,
      "notes" TEXT,
      "barberRevenues" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CashClosing_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Table created.");
}
main().catch(console.error).finally(() => prisma.$disconnect());

