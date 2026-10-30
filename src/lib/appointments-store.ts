import { BARBERS } from "@/lib/barbers";
import { OFFICIAL_SERVICES } from "@/lib/services";

export interface StoredAppointment {
  id: string;
  date: string; // ISO string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  barberId: string;
  barber: { id: string; name: string; phone?: string; role?: string };
  service: { id: string; name: string; price: number; duration: number };
  user: { id: string; name: string; phone?: string; email?: string };
  durationSpent?: number;
}

export interface StoredClosing {
  id: string;
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  barberRevenues: string;
  closedBy: string;
  createdAt: string;
}

export interface StoredExpense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: "FIXO" | "VALE";
  barberId?: string;
}

// Helper para obter a data local no formato YYYY-MM-DD (fuso Brasil UTC-3)
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Inicializa armazenamento limpo para uso oficial real (sem agendamentos de teste)
function createInitialAppointments(): StoredAppointment[] {
  return [];
}

// Singleton global para persistência em memória entre chamadas de API
declare global {
  var __mrbastos_appointments: StoredAppointment[] | undefined;
  var __mrbastos_closings: StoredClosing[] | undefined;
  var __mrbastos_expenses: StoredExpense[] | undefined;
}

if (!global.__mrbastos_appointments) {
  global.__mrbastos_appointments = createInitialAppointments();
}

if (!global.__mrbastos_closings) {
  global.__mrbastos_closings = [];
}

if (!global.__mrbastos_expenses) {
  global.__mrbastos_expenses = [];
}

export function getAllStoredAppointments(): StoredAppointment[] {
  return global.__mrbastos_appointments || [];
}

export function getAppointmentsForDate(dateStr: string, barberId?: string | null): StoredAppointment[] {
  const all = global.__mrbastos_appointments || [];
  return all.filter((apt) => {
    const aptDay = apt.date.substring(0, 10);
    const matchesDate = aptDay === dateStr;
    const matchesBarber = !barberId || barberId === "all" || apt.barberId === barberId ||
      (barberId === "barbeiro-nando" && apt.barberId === "barbeiro-lucas") ||
      (barberId === "barbeiro-saul" && apt.barberId === "barbeiro-felipe");
    return matchesDate && matchesBarber;
  });
}

export function addStoredAppointment(aptData: Partial<StoredAppointment>): StoredAppointment {
  if (!global.__mrbastos_appointments) {
    global.__mrbastos_appointments = createInitialAppointments();
  }

  let barber = BARBERS.find((b) => b.id === aptData.barberId);
  if (!barber) {
    if (aptData.barberId === "barbeiro-lucas") barber = BARBERS[1];
    else if (aptData.barberId === "barbeiro-felipe") barber = BARBERS[2];
    else barber = BARBERS[0];
  }

  const service = OFFICIAL_SERVICES.find((s) => s.id === aptData.service?.id) || {
    id: "corte",
    name: "Corte",
    price: 35,
    duration: 30,
  };

  const newApt: StoredAppointment = {
    id: aptData.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date: aptData.date || `${getLocalDateString()}T10:00:00.000Z`,
    status: aptData.status || "CONFIRMED",
    barberId: barber.id,
    barber: { id: barber.id, name: barber.name, phone: barber.phone, role: barber.role },
    service: { id: service.id, name: service.name, price: service.price, duration: service.duration },
    user: aptData.user || {
      id: `u-${Date.now()}`,
      name: "Cliente Balcão",
      phone: "(75) 98888-0000",
    },
    durationSpent: aptData.durationSpent,
  };

  global.__mrbastos_appointments.unshift(newApt);
  return newApt;
}

export function updateStoredAppointmentStatus(id: string, newStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"): boolean {
  if (!global.__mrbastos_appointments) return false;
  const apt = global.__mrbastos_appointments.find((a) => a.id === id);
  if (apt) {
    apt.status = newStatus;
    if (newStatus === "COMPLETED" && !apt.durationSpent) {
      apt.durationSpent = apt.service.duration;
    }
    return true;
  }
  return false;
}

export function getStoredClosingsForDate(dateStr: string): StoredClosing[] {
  const all = global.__mrbastos_closings || [];
  return all.filter((c) => c.date.substring(0, 10) === dateStr);
}

export function addStoredClosing(closingData: StoredClosing): StoredClosing {
  if (!global.__mrbastos_closings) {
    global.__mrbastos_closings = [];
  }
  global.__mrbastos_closings.unshift(closingData);
  return closingData;
}

export function clearAllStoredData(): void {
  global.__mrbastos_appointments = [];
  global.__mrbastos_closings = [];
  global.__mrbastos_expenses = [];
}
