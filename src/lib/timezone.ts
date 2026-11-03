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
  if (!dateInput) return "00:00";

  if (typeof dateInput === "string") {
    // Se a string tem offset -03:00 explícito (ex: "2026-11-02T10:00:00-03:00")
    if (dateInput.includes("-03:00")) {
      const tIndex = dateInput.indexOf("T");
      if (tIndex !== -1 && dateInput.length >= tIndex + 6) {
        return dateInput.substring(tIndex + 1, tIndex + 6);
      }
    }
  }

  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  // Auto-correção para agendamentos antigos salvos indevidamente como UTC ingênuo
  // A barbearia só abre às 08:00. Qualquer horário resultante entre 04:00 e 07:59
  // sofreu atraso de 3 horas (-3h). Somamos 3 horas para restaurar o horário real!
  const [hStr, mStr] = formatted.split(":");
  const hour = parseInt(hStr, 10);
  if (hour >= 4 && hour < 8) {
    const fixedHour = String(hour + 3).padStart(2, "0");
    return `${fixedHour}:${mStr}`;
  }

  return formatted;
}

/**
 * Converte data e hora para Date com offset brasileiro (-03:00) explícito,
 * evitando que servidores em UTC interpretem como horário de Londres.
 */
export function parseBrazilDateTime(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date();

  if (timeStr) {
    return new Date(`${dateStr.split("T")[0]}T${timeStr}:00-03:00`);
  }

  let combined = dateStr.trim();

  // Se já possui offset explícito (+/-HH:MM)
  if (/[+-]\d{2}:?\d{2}$/.test(combined)) {
    return new Date(combined);
  }

  // Se veio terminando com Z (ex: "2026-11-02T10:00:00Z"), esse Z foi enviado por clientes ou bibliotecas
  // mas o horário digitado é local de Alagoinhas-BA. Removemos o Z e forçamos o offset -03:00.
  if (combined.endsWith("Z")) {
    const withoutZ = combined.slice(0, -1);
    const clean = withoutZ.split(".")[0];
    return new Date(`${clean}-03:00`);
  }

  if (!combined.includes("T")) {
    return new Date(`${combined}T12:00:00-03:00`);
  }

  return new Date(`${combined}-03:00`);
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
