"use server"

import prisma from "@/lib/prisma"
export async function getFechamentoData() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      status: "COMPLETED",
    },
    include: {
      service: true,
      barber: true,
    }
  })

  let totalRevenue = 0;
  const barberRevenues: Record<string, { name: string, total: number, commission: number }> = {}

  appointments.forEach(app => {
    totalRevenue += app.service.price;
    if (app.barber) {
      if (!barberRevenues[app.barber.id]) {
        barberRevenues[app.barber.id] = { 
          name: app.barber.name, 
          total: 0, 
          commission: 0 
        }
      }
      barberRevenues[app.barber.id].total += app.service.price;
      barberRevenues[app.barber.id].commission += (app.service.price * app.barber.commissionRate);
    }
  })

  // Check if already closed today
  const closings = await prisma.cashClosing.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return {
    totalRevenue,
    barberRevenues: Object.values(barberRevenues),
    closings
  }
}

export async function closeCashRegister(data: { totalRevenue: number, barberRevenues: string, closedBy: string }) {
  const closing = await prisma.cashClosing.create({
    data: {
      totalRevenue: data.totalRevenue,
      barberRevenues: data.barberRevenues,
      closedBy: data.closedBy,
    }
  })
  return closing
}
