import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session && (session.user as any).role === 'CLIENT') {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: {
          appointments: { include: { service: true }, orderBy: { date: 'asc' } }
        }
      });
      return NextResponse.json({ isClient: true, appointments: user?.appointments || [] });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const now = dateParam ? new Date(dateParam + 'T12:00:00Z') : new Date();
    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 2. Agendamentos do Dia Selecionado
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: { service: true, user: true },
      orderBy: { date: 'asc' }
    });

    // 1. Faturamento do Dia (APENAS CONCLUÍDOS)
    const completedTodayList = todayAppointments.filter(apt => apt.status === 'COMPLETED');
    const revenue = completedTodayList.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);

    // 3. Clientes Atendidos no Dia
    const clientIds = new Set();
    let anonymousClients = 0;
    
    todayAppointments.forEach(apt => {
      if (apt.user?.role === 'ADMIN') {
        anonymousClients += 1; // Walk-in
      } else if (apt.userId) {
        clientIds.add(apt.userId);
      }
    });
    const uniqueClients = clientIds.size + anonymousClients;

    // 4. Tempo Médio de Cortes Hoje
    const completedToday = todayAppointments.filter(apt => apt.status === 'COMPLETED');
    const totalDurationToday = completedToday.reduce((acc, apt) => {
       const durationMinutes = Math.floor((apt.updatedAt.getTime() - apt.date.getTime()) / 60000);
       return acc + (durationMinutes > 0 ? durationMinutes : 1);
    }, 0);
    const averageDuration = completedToday.length > 0 ? Math.round(totalDurationToday / completedToday.length) : 0;
    
    // Populate individual durations so the frontend can display them
    const appointmentsWithDuration = todayAppointments.map(apt => {
       if (apt.status === 'COMPLETED') {
          const dur = Math.floor((apt.updatedAt.getTime() - apt.date.getTime()) / 60000);
          return { ...apt, durationSpent: dur > 0 ? dur : 1 };
       }
       return apt;
    });

    return NextResponse.json({
      revenue,
      todayCount: todayAppointments.length,
      clientsCount: uniqueClients,
      averageDuration,
      appointments: appointmentsWithDuration
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

