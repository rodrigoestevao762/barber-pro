const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cbskdvfwivtzcvkzwrtj:%40Familia435%23@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  const closings = await prisma.cashClosing.findMany();
  console.log("Closings count:", closings.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());

