"use server"

import prisma from "@/lib/prisma"
export async function getFechamentoData(dateStr?: string) {
  try {
    const targetDate = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

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
      success: true as const,
      data: {
        totalRevenue,
        barberRevenues: Object.values(barberRevenues),
        closings
      }
    }
  } catch (error: unknown) {
    console.error("Action error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false as const,
      error: msg
    }
  }
}

export async function closeCashRegister(data: { totalRevenue: number, barberRevenues: string, closedBy: string, dateStr: string }) {
  try {
    const parsedRevenues = JSON.parse(data.barberRevenues);
    const totalCommissions = parsedRevenues.reduce((acc: number, b: any) => acc + b.commission, 0);

    const targetDate = new Date(data.dateStr + "T12:00:00");
    const closingDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    const closing = await prisma.cashClosing.create({
      data: {
        date: closingDate,
        totalRevenue: data.totalRevenue,
        totalExpenses: totalCommissions,
        barberRevenues: data.barberRevenues,
        closedBy: data.closedBy,
      }
    })
    return { success: true, data: closing }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg }
  }
}
