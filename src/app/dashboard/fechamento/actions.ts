"use server"

import prisma from "@/lib/prisma";
import { BARBERS } from "@/lib/barbers";
import { 
  getAppointmentsForDate, 
  getStoredClosingsForDate, 
  addStoredClosing,
  getLocalDateString 
} from "@/lib/appointments-store";

export async function getFechamentoData(dateStr?: string) {
  try {
    const targetDateStr = dateStr || getLocalDateString();
    const targetDate = new Date(targetDateStr + "T12:00:00");
    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    let appointments: any[] = [];
    let closings: any[] = [];

    try {
      appointments = await prisma.appointment.findMany({
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
      });

      closings = await prisma.cashClosing.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbErr) {
      // Fallback em memória dinâmico e 100% resiliente
      const storedApts = getAppointmentsForDate(targetDateStr, null);
      appointments = storedApts.filter(a => a.status === "COMPLETED" || a.status === "CONFIRMED");
      closings = getStoredClosingsForDate(targetDateStr);
    }

    let totalRevenue = 0;
    const barberRevenues: Record<string, { id: string, name: string, total: number, commission: number, rate: number, isOwner: boolean }> = {};

    // Inicializa todos os barbeiros oficiais
    BARBERS.forEach((b) => {
      const isOwner = b.role === "ADMIN";
      barberRevenues[b.id] = {
        id: b.id,
        name: b.name,
        total: 0,
        commission: 0,
        rate: isOwner ? 1.0 : 0.45,
        isOwner,
      };
    });

    appointments.forEach(app => {
      const price = app.service?.price || 0;
      totalRevenue += price;
      
      const bId = app.barber?.id || app.barberId || "barbeiro-dono";
      if (!barberRevenues[bId]) {
        const isOwner = app.barber?.name?.toLowerCase().includes("dono") || bId === "barbeiro-dono";
        barberRevenues[bId] = { 
          id: bId,
          name: app.barber?.name || "Barbeiro", 
          total: 0, 
          commission: 0,
          rate: isOwner ? 1.0 : 0.45,
          isOwner,
        };
      }
      
      barberRevenues[bId].total += price;
      // Regra oficial Mr. Bastos: Dono = 100%, Barbeiro Funcionário = 45%
      const effectiveRate = barberRevenues[bId].isOwner ? 1.0 : 0.45;
      barberRevenues[bId].commission += (price * effectiveRate);
    });

    return {
      success: true as const,
      data: {
        totalRevenue,
        barberRevenues: Object.values(barberRevenues),
        closings
      }
    };
  } catch (error: unknown) {
    console.error("Action error:", error);
    const targetDateStr = dateStr || getLocalDateString();
    const storedApts = getAppointmentsForDate(targetDateStr, null);
    const completedApts = storedApts.filter(a => a.status === "COMPLETED" || a.status === "CONFIRMED");
    const closings = getStoredClosingsForDate(targetDateStr);

    let totalRevenue = 0;
    const barberRevenues: Record<string, { id: string, name: string, total: number, commission: number, rate: number, isOwner: boolean }> = {};

    BARBERS.forEach((b) => {
      const isOwner = b.role === "ADMIN";
      barberRevenues[b.id] = {
        id: b.id,
        name: b.name,
        total: 0,
        commission: 0,
        rate: isOwner ? 1.0 : 0.45,
        isOwner,
      };
    });

    completedApts.forEach(app => {
      const price = app.service?.price || 0;
      totalRevenue += price;
      const bId = app.barberId || "barbeiro-dono";
      if (barberRevenues[bId]) {
        barberRevenues[bId].total += price;
        const rate = barberRevenues[bId].isOwner ? 1.0 : 0.45;
        barberRevenues[bId].commission += (price * rate);
      }
    });

    return {
      success: true as const,
      data: {
        totalRevenue,
        barberRevenues: Object.values(barberRevenues),
        closings
      }
    };
  }
}

export async function closeCashRegister(data: { totalRevenue: number, barberRevenues: string, closedBy: string, dateStr: string }) {
  try {
    const parsedRevenues = JSON.parse(data.barberRevenues);
    const totalCommissions = parsedRevenues.reduce((acc: number, b: any) => acc + b.commission, 0);

    const targetDate = new Date(data.dateStr + "T12:00:00");
    const closingDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    try {
      const closing = await prisma.cashClosing.create({
        data: {
          date: closingDate,
          totalRevenue: data.totalRevenue,
          totalExpenses: totalCommissions,
          barberRevenues: data.barberRevenues,
          closedBy: data.closedBy,
        }
      });
      return { success: true, data: closing };
    } catch (dbErr) {
      const storedClosing = addStoredClosing({
        id: `closing-${Date.now()}`,
        date: data.dateStr,
        totalRevenue: data.totalRevenue,
        totalExpenses: totalCommissions,
        barberRevenues: data.barberRevenues,
        closedBy: data.closedBy,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        data: storedClosing
      };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
