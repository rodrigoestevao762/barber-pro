import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("DASHBOARD API SESSION:", session);
    if (session && (session.user as any).role === 'CLIENT') {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: {
          appointments: { include: { service: true }, orderBy: { date: 'asc' } }
        }
      });
      return NextResponse.json({ isClient: true, appointments: user?.appointments || [] });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. Faturamento Mensal (APENAS CONCLUÍDOS)
    const completedThisMonth = await prisma.appointment.findMany({
      where: { 
        status: 'COMPLETED',
        date: { gte: startOfMonth }
      },
      include: { service: true }
    });
    
    const revenue = completedThisMonth.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);

    // 2. Agendamentos de Hoje
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: { service: true, user: true },
      orderBy: { date: 'asc' }
    });

    // 3. Clientes Únicos
    const uniqueClients = await prisma.user.count({ where: { role: 'CLIENT' } });

    return NextResponse.json({
      revenue,
      todayCount: todayAppointments.length,
      clientsCount: uniqueClients,
      appointments: todayAppointments
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard' }, { status: 500 });
  }
}

// Atualizar status do agendamento
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

