import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAppointmentsForDate } from "@/lib/appointments-store";
import { normalizeBarberId } from "@/lib/barber-availability";
import {
  checkBarberDayStatusDB,
  getAllBarbersScheduleForDateDB,
  getBarberDayScheduleDB,
} from "@/lib/barber-schedule";
import { getBrazilNow, formatAptTimeToHHMM } from "@/lib/timezone";
import { checkDayStatus } from "@/lib/holidays";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

// Horário de funcionamento oficial Mr. Bastos: Segunda a Sábado 08h às 20h
const WORK_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const barberId = searchParams.get("barberId");

    if (!dateParam) {
      return NextResponse.json({ error: "Data não informada" }, { status: 400 });
    }

    const cleanDateStr = dateParam.substring(0, 10);

    // 1. Verificação de Domingo e Feriados Oficiais (Alagoinhas - BA e Nacionais)
    const dayStatus = checkDayStatus(cleanDateStr);
    if (dayStatus.isClosed) {
      return jsonNoStore({
        availableTimes: [],
        isClosed: true,
        isSunday: dayStatus.isSunday || false,
        isHoliday: dayStatus.isHoliday || false,
        isBarberOff: false,
        reason: dayStatus.reason,
      });
    }

    // 2. Se a data for no passado (antes de hoje no Brasil), não há horários livres
    const brazilNow = getBrazilNow();
    if (cleanDateStr < brazilNow.date) {
      return jsonNoStore({ availableTimes: [] });
    }

    // 3. Coleta todos os agendamentos ativos do dia (PostgreSQL + Store local em disco/memória)
    const startOfDay = new Date(`${cleanDateStr}T00:00:00-03:00`);
    const endOfDay = new Date(`${cleanDateStr}T23:59:59-03:00`);

    const bookedByBarber = new Map<string, Set<string>>();
    const recordBooking = (bId: string, timeStr: string) => {
      const norm = normalizeBarberId(bId);
      if (!bookedByBarber.has(norm)) bookedByBarber.set(norm, new Set());
      bookedByBarber.get(norm)!.add(timeStr);
    };

    try {
      const dbApts = await prisma.appointment.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ["CANCELLED"] },
        },
        select: { date: true, barberId: true },
      });
      for (const apt of dbApts) {
        recordBooking(apt.barberId || "barbeiro-dono", formatAptTimeToHHMM(apt.date));
      }
    } catch (_) {
      // Silencioso: fallback para store local abaixo
    }

    const storedApts = getAppointmentsForDate(cleanDateStr, null);
    for (const apt of storedApts) {
      if (apt.status !== "CANCELLED") {
        recordBooking(apt.barberId, formatAptTimeToHHMM(apt.date));
      }
    }

    // 4A. Barbeiro específico selecionado: aplica escala, saída antecipada e pausa de almoço INDIVIDUAIS
    if (barberId && barberId !== "qualquer" && barberId !== "all") {
      const normBarberId = normalizeBarberId(barberId);
      const barberDayCheck = await checkBarberDayStatusDB(normBarberId, cleanDateStr);
      if (barberDayCheck.isClosed) {
        return jsonNoStore({
          availableTimes: [],
          isClosed: true,
          isSunday: false,
          isHoliday: false,
          isBarberOff: true,
          barberId: normBarberId,
          reason: barberDayCheck.reason,
        });
      }

      const schedule = await getBarberDayScheduleDB(normBarberId, cleanDateStr);
      const barberBooked = bookedByBarber.get(normBarberId) || new Set<string>();

      let availableTimes = [...WORK_HOURS];

      if (schedule.earlyClosingTime) {
        availableTimes = availableTimes.filter((t) => t <= schedule.earlyClosingTime!);
      }

      if (schedule.lunchBreakSlots.length > 0) {
        availableTimes = availableTimes.filter((t) => !schedule.lunchBreakSlots.includes(t));
      }

      if (cleanDateStr === brazilNow.date) {
        availableTimes = availableTimes.filter((t) => t > brazilNow.time);
      }

      availableTimes = availableTimes.filter((t) => !barberBooked.has(t));

      return jsonNoStore({
        availableTimes,
        isClosed: false,
        isBarberOff: false,
        barberId: normBarberId,
        earlyClosingTime: schedule.earlyClosingTime,
        lunchBreakTime: schedule.lunchBreakTime,
        lunchBreakSlots: schedule.lunchBreakSlots,
        isLunchBreakFixed: schedule.isLunchBreakFixed,
      });
    }

    // 4B. "Qualquer Profissional": horário é livre se ao menos um barbeiro ativo não estiver em almoço, fora ou ocupado
    const allSchedules = await getAllBarbersScheduleForDateDB(cleanDateStr);
    const activeSchedules = allSchedules.filter((s) => s.isEffectiveAvailable);

    if (activeSchedules.length === 0) {
      return jsonNoStore({
        availableTimes: [],
        isClosed: true,
        isBarberOff: true,
        reason: "Nenhum profissional disponível para agendamentos nesta data.",
      });
    }

    const availableTimes = WORK_HOURS.filter((time) => {
      if (cleanDateStr === brazilNow.date && time <= brazilNow.time) {
        return false;
      }

      return activeSchedules.some((sched) => {
        if (sched.earlyClosingTime && time > sched.earlyClosingTime) return false;
        if (sched.lunchBreakSlots.includes(time)) return false;
        const barberBooked = bookedByBarber.get(sched.barberId);
        return !(barberBooked && barberBooked.has(time));
      });
    });

    return jsonNoStore({
      availableTimes,
      isClosed: false,
      isBarberOff: false,
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 });
  }
}
