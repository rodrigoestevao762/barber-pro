import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BARBERS, getBarberById } from "@/lib/barbers";
import { normalizeBarberId } from "@/lib/barber-availability";
import {
  getAllBarbersScheduleForDateDB,
  getBarberDayScheduleDB,
  setBarberDateClosedDB,
  setBarberEarlyClosingTimeDB,
  setBarberGlobalAvailabilityDB,
  setBarberLunchBreakTimeDB,
} from "@/lib/barber-schedule";
import { getBrazilNow } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showAll = searchParams.get("all") === "true";
  const dateParam = searchParams.get("date") || getBrazilNow().date;
  const cleanDate = dateParam.substring(0, 10);

  const schedules = await getAllBarbersScheduleForDateDB(cleanDate);

  const barbersWithStatus = BARBERS.map((barber) => {
    const schedule = schedules.find((s) => s.barberId === barber.id);
    const isGlobalAvailable = schedule ? schedule.isGlobalAvailable : true;
    const isDateClosed = schedule ? schedule.isDateClosed : false;
    const isEffectiveAvailable = schedule ? schedule.isEffectiveAvailable : true;

    return {
      ...barber,
      isAvailable: isEffectiveAvailable,
      isGlobalAvailable,
      isDateClosed,
      earlyClosingTime: schedule?.earlyClosingTime || null,
      lunchBreakTime: schedule?.lunchBreakTime || null,
      defaultLunchBreakTime: schedule?.defaultLunchBreakTime || null,
      isLunchBreakFixed: schedule?.isLunchBreakFixed || false,
      hasLunchDateOverride: schedule?.hasLunchDateOverride || false,
      lunchBreakSlots: schedule?.lunchBreakSlots || [],
      queryDate: cleanDate,
    };
  });

  const payload = showAll
    ? barbersWithStatus
    : barbersWithStatus.filter((b) => b.isAvailable);

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const sessionBarberId = (session?.user as any)?.barberId as string | undefined;

    if (!session || (userRole !== "ADMIN" && userRole !== "BARBER")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const {
      barberId,
      isAvailable,
      isGlobalAvailable,
      isDateClosed,
      date,
      earlyClosingTime,
      lunchBreakTime,
      lunchBreakScope,
    } = body;

    const requestedBarberId = normalizeBarberId(barberId || sessionBarberId || "barbeiro-dono");
    const ownBarberId = sessionBarberId ? normalizeBarberId(sessionBarberId) : undefined;

    // RBAC: Barbeiro comum só pode gerenciar a própria escala e a própria pausa de almoço
    if (userRole === "BARBER") {
      if (!ownBarberId) {
        return NextResponse.json({ error: "Perfil de barbeiro não identificado." }, { status: 403 });
      }
      if (barberId && requestedBarberId !== ownBarberId) {
        return NextResponse.json(
          { error: "Você só pode alterar a sua própria escala e pausa para almoço." },
          { status: 403 }
        );
      }
    }

    const targetBarberId = userRole === "BARBER" && ownBarberId ? ownBarberId : requestedBarberId;
    const targetDate = (date || getBrazilNow().date).substring(0, 10);

    // 1. Escala global / 4x4 do profissional (ex: toggle explícito ou chamada legada sem date)
    if (typeof isGlobalAvailable === "boolean") {
      await setBarberGlobalAvailabilityDB(targetBarberId, isGlobalAvailable);
    } else if (typeof isAvailable === "boolean" && !date) {
      await setBarberGlobalAvailabilityDB(targetBarberId, isAvailable);
    }

    // 2. Folga / Fechamento pontual na data selecionada
    if (typeof isDateClosed === "boolean") {
      await setBarberDateClosedDB(targetBarberId, targetDate, isDateClosed);
    } else if (typeof isAvailable === "boolean" && date) {
      await setBarberDateClosedDB(targetBarberId, targetDate, !isAvailable);
    }

    // 3. Saída antecipada individual na data ("Sair antes")
    if (earlyClosingTime !== undefined) {
      await setBarberEarlyClosingTimeDB(targetBarberId, targetDate, earlyClosingTime || null);
    }

    // 4. Pausa para almoço individual ("default" = fixo diário, "date" = só na data)
    if (lunchBreakTime !== undefined) {
      const scope = lunchBreakScope === "date" ? "date" : "default";
      await setBarberLunchBreakTimeDB(targetBarberId, targetDate, lunchBreakTime || null, scope);
    }

    const schedule = await getBarberDayScheduleDB(targetBarberId, targetDate);
    const barberInfo = getBarberById(targetBarberId);
    const dateBr = targetDate.split("-").reverse().join("/");

    return NextResponse.json({
      success: true,
      barberId: targetBarberId,
      barberName: barberInfo?.name || "Profissional",
      date: targetDate,
      isAvailable: schedule.isEffectiveAvailable,
      isGlobalAvailable: schedule.isGlobalAvailable,
      isDateClosed: schedule.isDateClosed,
      earlyClosingTime: schedule.earlyClosingTime,
      lunchBreakTime: schedule.lunchBreakTime,
      defaultLunchBreakTime: schedule.defaultLunchBreakTime,
      isLunchBreakFixed: schedule.isLunchBreakFixed,
      hasLunchDateOverride: schedule.hasLunchDateOverride,
      lunchBreakSlots: schedule.lunchBreakSlots,
      message: schedule.isDateClosed
        ? `${barberInfo?.name || "Profissional"} fechado para o dia ${dateBr}.`
        : !schedule.isGlobalAvailable
        ? `${barberInfo?.name || "Profissional"} marcado como OFF na escala 4x4.`
        : `Escala individual de ${barberInfo?.name || "Profissional"} atualizada para ${dateBr}.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar escala do barbeiro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do profissional" },
      { status: 500 }
    );
  }
}
