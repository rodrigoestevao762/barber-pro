/**
 * Gerenciador de Disponibilidade Individual, Escala 4x4 e Pausa para Almoço da Mr. Bastos Barbearia.
 * Cada barbeiro (Mr. Bastos, Nando, Saul) possui configuração individual (Fixa ou por Data)
 * com persistência em memória e disco (/tmp em produção, src/data em dev).
 */

import { BARBERS, getBarberById } from "@/lib/barbers";

export const GLOBAL_SCHEDULE_KEY = "GLOBAL";
export const DEFAULT_SCHEDULE_KEY = "DEFAULT";
export const NO_LUNCH_OVERRIDE = "NONE";

declare global {
  var __barber_availabilities: Record<string, boolean> | undefined; // Chave: barberId (Escala 4x4 / Ativo global)
  var __mrbastos_closed_dates: Record<string, boolean> | undefined; // Chave: "{barberId}:{YYYY-MM-DD}"
  var __mrbastos_early_closings: Record<string, string> | undefined; // Chave: "{barberId}:{YYYY-MM-DD}" -> "17:00"
  var __mrbastos_lunch_breaks: Record<string, string> | undefined;   // Chave: "{barberId}:DEFAULT" ou "{barberId}:{YYYY-MM-DD}" -> "12:00" | "12:00-14:00" | "NONE"
}

export function normalizeBarberId(barberId?: string | null): string {
  const matched = getBarberById(barberId);
  return matched?.id || barberId || "barbeiro-dono";
}

export function makeScheduleId(barberId: string, dateKey: string): string {
  return `${normalizeBarberId(barberId)}:${dateKey}`;
}

function getAvailabilityFilePath(): string | null {
  if (typeof window !== "undefined") return null;
  try {
    const path = require("path");
    return process.env.VERCEL || process.env.NODE_ENV === "production"
      ? path.join("/tmp", "mrbastos_availability.json")
      : path.join(process.cwd(), "src", "data", "mrbastos_availability.json");
  } catch (_) {
    return null;
  }
}

function loadAvailabilityFromDisk(): void {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const filePath = getAvailabilityFilePath();
    if (filePath && fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (data && typeof data === "object") {
        if (data.globalAvailabilities) global.__barber_availabilities = data.globalAvailabilities;
        if (data.closedDates) global.__mrbastos_closed_dates = data.closedDates;
        if (data.earlyClosings) global.__mrbastos_early_closings = data.earlyClosings;
        if (data.lunchBreaks) global.__mrbastos_lunch_breaks = data.lunchBreaks;
      }
    }
  } catch (_) {}
}

function saveAvailabilityToDisk(): void {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = getAvailabilityFilePath();
    if (!filePath) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          globalAvailabilities: global.__barber_availabilities || {},
          closedDates: global.__mrbastos_closed_dates || {},
          earlyClosings: global.__mrbastos_early_closings || {},
          lunchBreaks: global.__mrbastos_lunch_breaks || {},
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch (_) {}
}

function ensureInitialized(): void {
  if (!global.__barber_availabilities) {
    global.__barber_availabilities = {};
    BARBERS.forEach((b) => {
      global.__barber_availabilities![b.id] = true;
    });
    global.__mrbastos_closed_dates = {};
    global.__mrbastos_early_closings = {};
    global.__mrbastos_lunch_breaks = {};
    loadAvailabilityFromDisk();
  }
  if (!global.__mrbastos_closed_dates) global.__mrbastos_closed_dates = {};
  if (!global.__mrbastos_early_closings) global.__mrbastos_early_closings = {};
  if (!global.__mrbastos_lunch_breaks) global.__mrbastos_lunch_breaks = {};
}

ensureInitialized();

/**
 * Converte uma string de pausa de almoço em slots HH:MM bloqueados.
 * Suporta:
 * - "12:00" -> ["12:00"]
 * - "12:00-14:00" -> ["12:00", "13:00"]
 * - "12:00,13:00" -> ["12:00", "13:00"]
 * - "NONE" / null -> []
 */
export function parseLunchBreakSlots(lunchTime: string | null | undefined): string[] {
  if (!lunchTime || lunchTime === NO_LUNCH_OVERRIDE) return [];

  if (lunchTime.includes("-")) {
    const [start, end] = lunchTime.split("-");
    const startHour = parseInt(start.split(":")[0], 10);
    const endHour = parseInt(end.split(":")[0], 10);
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) return [];
    const slots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
    return slots;
  }

  if (lunchTime.includes(",")) {
    return lunchTime.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return [lunchTime];
}

export function isBarberDateClosed(barberId: string, dateStr: string): boolean {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateStr.substring(0, 10));
  return !!global.__mrbastos_closed_dates![key];
}

export function setBarberDateClosed(barberId: string, dateStr: string, closed: boolean): boolean {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateStr.substring(0, 10));
  if (!closed) {
    delete global.__mrbastos_closed_dates![key];
  } else {
    global.__mrbastos_closed_dates![key] = true;
  }
  saveAvailabilityToDisk();
  return closed;
}

export function getBarberEarlyClosingTime(barberId: string, dateStr: string): string | null {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateStr.substring(0, 10));
  return global.__mrbastos_early_closings![key] || null;
}

export function setBarberEarlyClosingTime(barberId: string, dateStr: string, time: string | null): void {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateStr.substring(0, 10));
  if (!time) {
    delete global.__mrbastos_early_closings![key];
  } else {
    global.__mrbastos_early_closings![key] = time;
  }
  saveAvailabilityToDisk();
}

export function getBarberLunchBreakRaw(barberId: string, dateKey: string): string | null {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateKey);
  return global.__mrbastos_lunch_breaks![key] || null;
}

export function setBarberLunchBreak(barberId: string, dateKey: string, time: string | null): void {
  ensureInitialized();
  const key = makeScheduleId(barberId, dateKey);
  if (!time) {
    delete global.__mrbastos_lunch_breaks![key];
  } else {
    global.__mrbastos_lunch_breaks![key] = time;
  }
  saveAvailabilityToDisk();
}

export function getBarberLunchBreakTime(barberId: string, dateStr: string): string | null {
  ensureInitialized();
  const cleanDate = dateStr.substring(0, 10);
  const dayVal = getBarberLunchBreakRaw(barberId, cleanDate);
  if (dayVal === NO_LUNCH_OVERRIDE) return null;
  if (dayVal) return dayVal;
  return getBarberLunchBreakRaw(barberId, DEFAULT_SCHEDULE_KEY);
}

export function getBarberLunchBreakSlots(barberId: string, dateStr: string): string[] {
  return parseLunchBreakSlots(getBarberLunchBreakTime(barberId, dateStr));
}

/**
 * Escala Global / 4x4 do Barbeiro (Dono Mr. Bastos ou equipe).
 * Se `dateStr` for informada, valida também se o barbeiro marcou folga pontual naquele dia.
 */
export function isBarberAvailable(barberId: string, dateStr?: string): boolean {
  ensureInitialized();
  const normId = normalizeBarberId(barberId);
  if (global.__barber_availabilities![normId] === false) {
    return false;
  }
  if (dateStr) {
    return !isBarberDateClosed(normId, dateStr);
  }
  return true;
}

export function setBarberAvailable(barberId: string, available: boolean, dateStr?: string): boolean {
  ensureInitialized();
  const normId = normalizeBarberId(barberId);
  if (dateStr) {
    setBarberDateClosed(normId, dateStr, !available);
    return available;
  }
  global.__barber_availabilities![normId] = available;
  saveAvailabilityToDisk();
  return available;
}

export function getAllBarberAvailabilities(): Record<string, boolean> {
  ensureInitialized();
  return { ...global.__barber_availabilities! };
}
