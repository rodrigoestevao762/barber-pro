import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json({ error: 'Data não informada' }, { status: 400 });
    }

    // Horários de trabalho da barbearia (fixos por enquanto)
    const workHours = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

    // Pega o início e o fim do dia selecionado para buscar no banco
    const startOfDay = new Date(`${dateParam}T00:00:00Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59Z`);

    // Busca todos os agendamentos já marcados para aquele dia (exceto os CANCELADOS)
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      }
    });

    // Mapeia os horários ocupados (ex: "09:00")
    const bookedTimes = bookedAppointments.map(apt => {
      return apt.date.toISOString().substring(11, 16); // Pega o formato HH:mm do UTC
    });

    // Filtra os horários de trabalho, removendo os que já estão no banco
    const availableTimes = workHours.filter(time => !bookedTimes.includes(time));

    return NextResponse.json({ availableTimes });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 });
  }
}
