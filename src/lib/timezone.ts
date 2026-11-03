/**
 * Utilitários para tratamento seguro de fuso horário brasileiro (America/Sao_Paulo / UTC-3).
 * Garante consistência tanto em servidores (Vercel UTC) quanto no navegador do cliente.
 */

export function getBrazilNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const obj = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${obj.year}-${obj.month}-${obj.day}`,
    time: `${obj.hour}:${obj.minute}`,
  };
}

export function getBrazilDateAndTimeString(d: Date | string): { date: string; time: string } {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(dateObj);

  const obj = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${obj.year}-${obj.month}-${obj.day}`,
    time: `${obj.hour}:${obj.minute}`,
  };
}

export function formatAptTimeToHHMM(d: Date | string): string {
  return getDisplayTime(d);
}

/**
 * Retorna o horário formatado seguro em "HH:MM",
 * tratando tanto strings com 'Z' salvas incorretamente quanto datas UTC sem distorção.
 */
export function getDisplayTime(dateInput: string | Date): string {
  if (typeof dateInput === "string") {
    const tIndex = dateInput.indexOf("T");
    if (tIndex !== -1 && dateInput.length >= tIndex + 6) {
      const timePart = dateInput.substring(tIndex + 1, tIndex + 6);
      // Se a string termina com Z e não possui milissegundos (.000Z), foi salva diretamente com o horário digitado
      if (dateInput.endsWith("Z") && !dateInput.includes(".")) {
        return timePart;
      }
    }
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * Converte data e hora para Date com offset brasileiro (-03:00) explícito,
 * evitando que servidores em UTC interpretem como horário de Londres.
 */
export function parseBrazilDateTime(dateStr: string, timeStr?: string): Date {
  const combined = timeStr ? `${dateStr}T${timeStr}:00` : dateStr;
  if (!combined.includes("-03:00") && !combined.endsWith("Z") && !combined.includes("+")) {
    return new Date(`${combined}-03:00`);
  }
  return new Date(combined);
}

/**
 * Verifica se um determinado horário em uma data é estritamente no futuro no Brasil.
 */
export function isDateTimeInFuture(dateStr: string, timeStr: string): boolean {
  const brazilNow = getBrazilNow();
  if (dateStr < brazilNow.date) return false;
  if (dateStr > brazilNow.date) return true;
  // dateStr === brazilNow.date
  return timeStr > brazilNow.time;
}
