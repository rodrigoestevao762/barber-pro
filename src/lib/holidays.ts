/**
 * Calendário Oficial de Feriados Nacionais e Municipais de Alagoinhas - BA
 * e verificação de Domingos (dias em que a barbearia permanece fechada).
 */

export interface DayStatus {
  isClosed: boolean;
  isSunday: boolean;
  isHoliday: boolean;
  reason: string;
}

// Feriados fixos (formato MM-DD)
// Nacionais + Feriados Oficiais de Alagoinhas e Bahia
const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "Confraternização Universal (Ano Novo)",
  "04-21": "Tiradentes",
  "05-01": "Dia do Trabalhador",
  "06-13": "Santo Antônio (Padroeiro de Alagoinhas - BA)",
  "06-24": "São João (Feriado Municipal em Alagoinhas - BA)",
  "07-02": "Independência da Bahia e Emancipação de Alagoinhas",
  "09-07": "Independência do Brasil",
  "10-12": "Nossa Senhora Aparecida (Padroeira do Brasil)",
  "11-02": "Finados",
  "11-15": "Proclamação da República",
  "11-20": "Dia Nacional de Zumbi e da Consciência Negra",
  "12-25": "Natal",
};

/**
 * Calcula feriados móveis baseados na data da Páscoa (Algoritmo Meeus/Jones/Butcher)
 */
function getMobileHolidays(year: number): Record<string, string> {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(year, month - 1, day);

  const addDays = (base: Date, days: number): string => {
    const res = new Date(base);
    res.setDate(res.getDate() + days);
    const mStr = String(res.getMonth() + 1).padStart(2, "0");
    const dStr = String(res.getDate()).padStart(2, "0");
    return `${mStr}-${dStr}`;
  };

  const map: Record<string, string> = {};
  // Carnaval (Terça-feira): 47 dias antes da Páscoa
  map[addDays(easter, -47)] = "Carnaval";
  // Sexta-feira da Paixão: 2 dias antes da Páscoa
  map[addDays(easter, -2)] = "Sexta-feira da Paixão";
  // Páscoa
  map[addDays(easter, 0)] = "Domingo de Páscoa";
  // Corpus Christi: 60 dias após a Páscoa
  map[addDays(easter, 60)] = "Corpus Christi";

  return map;
}

/**
 * Verifica se uma data específica ("YYYY-MM-DD") está fechada (Domingo ou Feriado)
 */
export function checkDayStatus(dateStr: string): DayStatus {
  if (!dateStr || dateStr.length < 10) {
    return { isClosed: false, isSunday: false, isHoliday: false, reason: "" };
  }

  const [yStr, mStr, dStr] = dateStr.substring(0, 10).split("-");
  const year = parseInt(yStr, 10);
  const monthDay = `${mStr}-${dStr}`;

  // Verifica se é domingo no calendário civil (usando meio-dia UTC para evitar distorções de fuso)
  const dateObj = new Date(`${dateStr.substring(0, 10)}T12:00:00Z`);
  const isSunday = dateObj.getUTCDay() === 0;

  // Verifica feriado fixo nacional ou municipal de Alagoinhas
  let holidayName = FIXED_HOLIDAYS[monthDay] || null;

  // Verifica feriado móvel
  if (!holidayName && !isNaN(year)) {
    const mobile = getMobileHolidays(year);
    holidayName = mobile[monthDay] || null;
  }

  const isHoliday = !!holidayName;
  const isClosed = isSunday || isHoliday;

  let reason = "";
  if (isSunday) {
    reason = "A barbearia está fechada aos domingos.";
  } else if (isHoliday) {
    reason = `Feriado: ${holidayName} (Barbearia fechada).`;
  }

  return {
    isClosed,
    isSunday,
    isHoliday,
    reason,
  };
}

