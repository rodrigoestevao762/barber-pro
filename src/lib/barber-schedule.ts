/**
 * Serviço persistente de escala por barbeiro (Prisma PostgreSQL + fallback em disco/memória)
 * para a Mr. Bastos Barbearia.
 *
 * Isolamento individual:
 * - Cada barbeiro (barbeiro-dono / Mr. Bastos, barbeiro-nando, barbeiro-saul)
 *   possui seus próprios registros independentes usando ID composto `${barberId}:${dateKey}`:
 *   - dateKey = "GLOBAL"     -> isClosed = true significa barbeiro pausado na escala 4x4/global
 *   - dateKey = "DEFAULT"    -> lunchBreakTime = Pausa fixa diária do barbeiro (ex: "12:00", "12:00-14:00")
 *   - dateKey = "YYYY-MM-DD" -> Folga pontual (isClosed), "Sair antes" (earlyClosingTime) e
 *                               exceção de almoço só nessa data (ou "NONE" para liberar o dia)
 */

import prisma from "@/lib/prisma";
import { BARBERS } from "@/lib/barbers";
import { checkDayStatus, DayStatus } from "@/lib/holidays";
import {
  DEFAULT_SCHEDULE_KEY,
  GLOBAL_SCHEDULE_KEY,
  NO_LUNCH_OVERRIDE,
  getBarberEarlyClosingTime,
  getBarberLunchBreakRaw,
  isBarberAvailable,
  isBarberDateClosed,
  makeScheduleId,
  normalizeBarberId,
  parseLunchBreakSlots,
  setBarberAvailable,
  setBarberDateClosed,
  setBarberEarlyClosingTime,
  setBarberLunchBreak,
} from "@/lib/barber-availability";

export interface ResolvedBarberSchedule {
  barberId: string;
  date: string;
  isGlobalAvailable: boolean;
  isDateClosed: boolean;
  isEffectiveAvailable: boolean;
  earlyClosingTime: string | null;
  lunchBreakTime: string | null;
  defaultLunchBreakTime: string | null;
  dayOverrideLunchBreakTime: string | null;
  isLunchBreakFixed: boolean;
  hasLunchDateOverride: boolean;
  lunchBreakSlots: string[];
}

export interface BarberDayStatus extends DayStatus {
  isBarberOff?: boolean;
}

function buildResolvedSchedule(
  barberId: string,
  cleanDate: string,
  opts: {
    isGlobalAvailable: boolean;
    isDateClosed: boolean;
    earlyClosingTime: string | null;
    defaultLunchBreakTime: string | null;
    dayOverrideLunchBreakTime: string | null;
  }
): ResolvedBarberSchedule {
  const {
    isGlobalAvailable,
    isDateClosed,
    earlyClosingTime,
    defaultLunchBreakTime,
    dayOverrideLunchBreakTime,
  } = opts;

  const hasLunchDateOverride =
    dayOverrideLunchBreakTime !== null && dayOverrideLunchBreakTime !== undefined;

  let lunchBreakTime: string | null = null;
  if (dayOverrideLunchBreakTime === NO_LUNCH_OVERRIDE) {
    lunchBreakTime = null;
  } else if (dayOverrideLunchBreakTime) {
    lunchBreakTime = dayOverrideLunchBreakTime;
  } else if (defaultLunchBreakTime && defaultLunchBreakTime !== NO_LUNCH_OVERRIDE) {
    lunchBreakTime = defaultLunchBreakTime;
  }

  const isLunchBreakFixed =
    !hasLunchDateOverride && Boolean(defaultLunchBreakTime && defaultLunchBreakTime !== NO_LUNCH_OVERRIDE);

  return {
    barberId,
    date: cleanDate,
    isGlobalAvailable,
    isDateClosed,
    isEffectiveAvailable: isGlobalAvailable && !isDateClosed,
    earlyClosingTime: earlyClosingTime || null,
    lunchBreakTime,
    defaultLunchBreakTime: defaultLunchBreakTime || null,
    dayOverrideLunchBreakTime: dayOverrideLunchBreakTime ?? null,
    isLunchBreakFixed,
    hasLunchDateOverride,
    lunchBreakSlots: parseLunchBreakSlots(lunchBreakTime),
  };
}

/**
 * Obtém a configuração individual completa de um barbeiro para uma data (DB com fallback em disco/memória).
 */
export async function getBarberDayScheduleDB(
  barberId: string,
  dateStr: string
): Promise<ResolvedBarberSchedule> {
  const normId = normalizeBarberId(barberId);
  const cleanDate = dateStr.substring(0, 10);

  const globalId = makeScheduleId(normId, GLOBAL_SCHEDULE_KEY);
  const defaultId = makeScheduleId(normId, DEFAULT_SCHEDULE_KEY);
  const dayId = makeScheduleId(normId, cleanDate);

  try {
    const records = await prisma.barberSchedule.findMany({
      where: { id: { in: [globalId, defaultId, dayId] } },
    });

    const globalRec = records.find((r) => r.dateKey === GLOBAL_SCHEDULE_KEY);
    const defaultRec = records.find((r) => r.dateKey === DEFAULT_SCHEDULE_KEY);
    const dayRec = records.find((r) => r.dateKey === cleanDate);

    // Se ainda não existe registro GLOBAL no banco, usa o estado local atual (padrão true)
    const isGlobalAvailable = globalRec ? !globalRec.isClosed : isBarberAvailable(normId);

    return buildResolvedSchedule(normId, cleanDate, {
      isGlobalAvailable,
      isDateClosed: Boolean(dayRec?.isClosed),
      earlyClosingTime: dayRec?.earlyClosingTime ?? null,
      defaultLunchBreakTime: defaultRec?.lunchBreakTime ?? null,
      dayOverrideLunchBreakTime: dayRec?.lunchBreakTime ?? null,
    });
  } catch (err) {
    console.warn(`[BarberSchedule] DB indisponível para ${normId}, usando fallback local:`, err);
    return buildResolvedSchedule(normId, cleanDate, {
      isGlobalAvailable: isBarberAvailable(normId),
      isDateClosed: isBarberDateClosed(normId, cleanDate),
      earlyClosingTime: getBarberEarlyClosingTime(normId, cleanDate),
      defaultLunchBreakTime: getBarberLunchBreakRaw(normId, DEFAULT_SCHEDULE_KEY),
      dayOverrideLunchBreakTime: getBarberLunchBreakRaw(normId, cleanDate),
    });
  }
}

/**
 * Obtém a escala de todos os barbeiros oficiais da Mr. Bastos para uma data.
 */
export async function getAllBarbersScheduleForDateDB(
  dateStr: string
): Promise<ResolvedBarberSchedule[]> {
  return Promise.all(BARBERS.map((b) => getBarberDayScheduleDB(b.id, dateStr)));
}

/**
 * Verifica feriados/domingos + disponibilidade individual do barbeiro (4x4 global e folga na data).
 */
export async function checkBarberDayStatusDB(
  barberId: string,
  dateStr: string
): Promise<BarberDayStatus> {
  const holidayCheck = checkDayStatus(dateStr);
  if (holidayCheck.isClosed) return holidayCheck;

  const normId = normalizeBarberId(barberId);
  const barberInfo = BARBERS.find((b) => b.id === normId);
  const barberName = barberInfo?.name || "Este profissional";

  const schedule = await getBarberDayScheduleDB(normId, dateStr);
  if (!schedule.isGlobalAvailable) {
    return {
      isClosed: true,
      isSunday: false,
      isHoliday: false,
      reason: `${barberName} não está disponível na escala atual.`,
      isBarberOff: true,
    };
  }
  if (schedule.isDateClosed) {
    return {
      isClosed: true,
      isSunday: false,
      isHoliday: false,
      reason: `${barberName} fechou a agenda para esta data.`,
      isBarberOff: true,
    };
  }

  return {
    isClosed: false,
    isSunday: false,
    isHoliday: false,
    reason: "",
    isBarberOff: false,
  };
}

/**
 * Alterna disponibilidade global (Escala 4x4 / Ativo) de um barbeiro específico.
 */
export async function setBarberGlobalAvailabilityDB(
  barberId: string,
  available: boolean
): Promise<boolean> {
  const normId = normalizeBarberId(barberId);
  setBarberAvailable(normId, available);

  try {
    const id = makeScheduleId(normId, GLOBAL_SCHEDULE_KEY);
    await prisma.barberSchedule.upsert({
      where: { id },
      update: { isClosed: !available },
      create: {
        id,
        barberId: normId,
        dateKey: GLOBAL_SCHEDULE_KEY,
        isClosed: !available,
      },
    });
  } catch (err) {
    console.warn(`[BarberSchedule] Falha ao gravar GLOBAL de ${normId} no PostgreSQL:`, err);
  }

  return available;
}

/**
 * Fecha ou reabre a agenda de um barbeiro específico em uma data pontual.
 */
export async function setBarberDateClosedDB(
  barberId: string,
  dateStr: string,
  closed: boolean
): Promise<boolean> {
  const normId = normalizeBarberId(barberId);
  const cleanDate = dateStr.substring(0, 10);
  setBarberDateClosed(normId, cleanDate, closed);

  try {
    const id = makeScheduleId(normId, cleanDate);
    await prisma.barberSchedule.upsert({
      where: { id },
      update: { isClosed: closed },
      create: {
        id,
        barberId: normId,
        dateKey: cleanDate,
        isClosed: closed,
      },
    });
  } catch (err) {
    console.warn(`[BarberSchedule] Falha ao gravar folga na data de ${normId} no PostgreSQL:`, err);
  }

  return closed;
}

/**
 * Define ou remove o horário de saída antecipada ("Sair antes") individual de um barbeiro na data.
 */
export async function setBarberEarlyClosingTimeDB(
  barberId: string,
  dateStr: string,
  time: string | null
): Promise<string | null> {
  const normId = normalizeBarberId(barberId);
  const cleanDate = dateStr.substring(0, 10);
  const cleanTime = time && time.trim() ? time.trim() : null;
  setBarberEarlyClosingTime(normId, cleanDate, cleanTime);

  try {
    const id = makeScheduleId(normId, cleanDate);
    await prisma.barberSchedule.upsert({
      where: { id },
      update: { earlyClosingTime: cleanTime },
      create: {
        id,
        barberId: normId,
        dateKey: cleanDate,
        earlyClosingTime: cleanTime,
      },
    });
  } catch (err) {
    console.warn(`[BarberSchedule] Falha ao gravar saída antecipada de ${normId} no PostgreSQL:`, err);
  }

  return cleanTime;
}

/**
 * Define, altera ou remove a pausa de almoço individual de um barbeiro.
 * - scope === "default": salva em dateKey = "DEFAULT" (todo dia até ser alterado) e limpa eventual exceção da data.
 * - scope === "date" (padrão): salva apenas em dateKey = YYYY-MM-DD (suporta "NONE" para liberar um dia quando existe fixo).
 */
export async function setBarberLunchBreakTimeDB(
  barberId: string,
  dateStr: string,
  time: string | null,
  scope: "default" | "date" = "date"
): Promise<ResolvedBarberSchedule> {
  const normId = normalizeBarberId(barberId);
  const cleanDate = dateStr.substring(0, 10);
  const cleanTime = time && time.trim() ? time.trim() : null;

  if (scope === "default") {
    const storedDefault = cleanTime === NO_LUNCH_OVERRIDE ? null : cleanTime;
    setBarberLunchBreak(normId, DEFAULT_SCHEDULE_KEY, storedDefault);
    setBarberLunchBreak(normId, cleanDate, null);

    try {
      const defaultId = makeScheduleId(normId, DEFAULT_SCHEDULE_KEY);
      await prisma.barberSchedule.upsert({
        where: { id: defaultId },
        update: { lunchBreakTime: storedDefault },
        create: {
          id: defaultId,
          barberId: normId,
          dateKey: DEFAULT_SCHEDULE_KEY,
          lunchBreakTime: storedDefault,
        },
      });

      // Remove override de almoço do dia selecionado ao atualizar o padrão fixo
      const dayId = makeScheduleId(normId, cleanDate);
      await prisma.barberSchedule.updateMany({
        where: { id: dayId },
        data: { lunchBreakTime: null },
      });
    } catch (err) {
      console.warn(`[BarberSchedule] Falha ao gravar almoço fixo de ${normId} no PostgreSQL:`, err);
    }
  } else {
    setBarberLunchBreak(normId, cleanDate, cleanTime);

    try {
      const dayId = makeScheduleId(normId, cleanDate);
      await prisma.barberSchedule.upsert({
        where: { id: dayId },
        update: { lunchBreakTime: cleanTime },
        create: {
          id: dayId,
          barberId: normId,
          dateKey: cleanDate,
          lunchBreakTime: cleanTime,
        },
      });
    } catch (err) {
      console.warn(`[BarberSchedule] Falha ao gravar almoço pontual de ${normId} no PostgreSQL:`, err);
    }
  }

  return getBarberDayScheduleDB(normId, cleanDate);
}
