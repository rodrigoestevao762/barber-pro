
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  console.log("Fetching appointments...");
  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      status: "COMPLETED",
    },
    include: { service: true, barber: true }
  });
  console.log("Appointments:", appointments.length);

  console.log("Fetching closings...");
  const closings = await prisma.cashClosing.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { createdAt: 'desc' }
  });
  console.log("Closings:", closings.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
