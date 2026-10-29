import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BARBERS } from "@/lib/barbers";
import { getAppointmentsForDate } from "@/lib/appointments-store";

const WORK_HOURS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const barberId = searchParams.get("barberId");

    if (!dateParam) {
      return NextResponse.json({ error: "Data não informada" }, { status: 400 });
    }

    const startOfDay = new Date(`${dateParam}T00:00:00Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59Z`);

    try {
      // Busca agendamentos do banco
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          status: { not: "CANCELLED" },
          ...(barberId && barberId !== "qualquer" ? { barberId } : {}),
        },
      });

      if (bookedAppointments && bookedAppointments.length > 0) {
        if (barberId && barberId !== "qualquer") {
          const bookedTimes = bookedAppointments.map((apt) =>
            apt.date.toISOString().substring(11, 16)
          );
          const availableTimes = WORK_HOURS.filter((time) => !bookedTimes.includes(time));
          return NextResponse.json({ availableTimes });
        } else {
          const timesCount: Record<string, number> = {};
          bookedAppointments.forEach((apt) => {
            const t = apt.date.toISOString().substring(11, 16);
            timesCount[t] = (timesCount[t] || 0) + 1;
          });
          const totalBarbers = BARBERS.length;
          const availableTimes = WORK_HOURS.filter(
            (time) => (timesCount[time] || 0) < totalBarbers
          );
          return NextResponse.json({ availableTimes });
        }
      } else {
        // Verifica no store em memória
        const storedApts = getAppointmentsForDate(dateParam, barberId);
        const bookedTimes = storedApts
          .filter((apt) => apt.status !== "CANCELLED")
          .map((apt) => apt.date.substring(11, 16));
        const availableTimes = WORK_HOURS.filter((time) => !bookedTimes.includes(time));
        return NextResponse.json({ availableTimes });
      }
    } catch (dbErr) {
      // Fallback em memória para teste offline
      const storedApts = getAppointmentsForDate(dateParam, barberId);
      const bookedTimes = storedApts
        .filter((apt) => apt.status !== "CANCELLED")
        .map((apt) => apt.date.substring(11, 16));
      const availableTimes = WORK_HOURS.filter((time) => !bookedTimes.includes(time));
      return NextResponse.json({ availableTimes });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 });
  }
}
