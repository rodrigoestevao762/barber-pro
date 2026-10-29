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

// Helper para obter a data local no formato YYYY-MM-DD
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Inicializa dados realistas distribuídos entre hoje, ontem e amanhã
function createInitialAppointments(): StoredAppointment[] {
  const today = getLocalDateString();
  
  const dYesterday = new Date();
  dYesterday.setDate(dYesterday.getDate() - 1);
  const yesterday = getLocalDateString(dYesterday);

  const dTomorrow = new Date();
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrow = getLocalDateString(dTomorrow);

  return [
    // ── ATENDIMENTOS DE HOJE ──
    {
      id: "apt-today-1",
      date: `${today}T09:00:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)", role: "ADMIN" },
      service: { id: "corte", name: "Corte", price: 35, duration: 30 },
      user: { id: "u-1", name: "Marcos Vinicius", phone: "(75) 98811-2233", email: "marcos@gmail.com" },
      durationSpent: 28,
    },
    {
      id: "apt-today-2",
      date: `${today}T10:30:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)", role: "ADMIN" },
      service: { id: "combo-corte-barba", name: "Corte + Barba", price: 55, duration: 50 },
      user: { id: "u-2", name: "Guilherme Santos", phone: "(75) 98822-3344", email: "guilherme@gmail.com" },
      durationSpent: 48,
    },
    {
      id: "apt-today-3",
      date: `${today}T11:00:00.000Z`,
      status: "CONFIRMED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro", role: "BARBER" },
      service: { id: "corte", name: "Corte", price: 35, duration: 30 },
      user: { id: "u-3", name: "Thiago Lima", phone: "(75) 98833-4455", email: "thiago@gmail.com" },
    },
    {
      id: "apt-today-4",
      date: `${today}T14:00:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro", role: "BARBER" },
      service: { id: "corte", name: "Corte", price: 35, duration: 30 },
      user: { id: "u-4", name: "Rafael Silva", phone: "(75) 98844-5566", email: "rafael@gmail.com" },
      durationSpent: 26,
    },
    {
      id: "apt-today-5",
      date: `${today}T15:30:00.000Z`,
      status: "CONFIRMED",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro", role: "BARBER" },
      service: { id: "barba", name: "Barba", price: 25, duration: 25 },
      user: { id: "u-5", name: "Carlos Eduardo", phone: "(75) 98855-6677", email: "carlos@gmail.com" },
    },
    {
      id: "apt-today-6",
      date: `${today}T16:30:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro", role: "BARBER" },
      service: { id: "combo-corte-barba", name: "Corte + Barba", price: 55, duration: 50 },
      user: { id: "u-6", name: "André Matos", phone: "(75) 98866-7788", email: "andre@gmail.com" },
      durationSpent: 42,
    },

    // ── ATENDIMENTOS DE ONTEM (HISTÓRICO) ──
    {
      id: "apt-yest-1",
      date: `${yesterday}T10:00:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)", role: "ADMIN" },
      service: { id: "corte", name: "Corte", price: 35, duration: 30 },
      user: { id: "u-7", name: "Bruno Costa", phone: "(75) 98877-1122" },
      durationSpent: 30,
    },
    {
      id: "apt-yest-2",
      date: `${yesterday}T14:30:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro", role: "BARBER" },
      service: { id: "combo-corte-sobrancelha", name: "Corte + Sobrancelha", price: 45, duration: 40 },
      user: { id: "u-8", name: "Fábio Souza", phone: "(75) 98877-3344" },
      durationSpent: 38,
    },
    {
      id: "apt-yest-3",
      date: `${yesterday}T16:00:00.000Z`,
      status: "COMPLETED",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro", role: "BARBER" },
      service: { id: "pezinho-barba", name: "Pezinho + Barba", price: 40, duration: 35 },
      user: { id: "u-9", name: "Lucas Gabriel", phone: "(75) 98877-5566" },
      durationSpent: 32,
    },

    // ── AGENDAMENTOS FUTUROS (AMANHÃ) ──
    {
      id: "apt-tom-1",
      date: `${tomorrow}T09:30:00.000Z`,
      status: "CONFIRMED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)", role: "ADMIN" },
      service: { id: "combo-corte-barba", name: "Corte + Barba", price: 55, duration: 50 },
      user: { id: "u-10", name: "Daniel Rocha", phone: "(75) 98899-0011", email: "daniel@gmail.com" },
    },
    {
      id: "apt-tom-2",
      date: `${tomorrow}T11:00:00.000Z`,
      status: "CONFIRMED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro", role: "BARBER" },
      service: { id: "corte", name: "Corte", price: 35, duration: 30 },
      user: { id: "u-11", name: "Henrique Mendes", phone: "(75) 98899-2233", email: "henrique@gmail.com" },
    },
    {
      id: "apt-tom-3",
      date: `${tomorrow}T15:00:00.000Z`,
      status: "PENDING",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro", role: "BARBER" },
      service: { id: "barba", name: "Barba", price: 25, duration: 25 },
      user: { id: "u-12", name: "Rodrigo Estêvão", phone: "(75) 98888-7777", email: "cliente@mrbastos.com" },
    },
  ];
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
    // Extrai o YYYY-MM-DD da data do agendamento
    const aptDay = apt.date.substring(0, 10);
    const matchesDate = aptDay === dateStr;
    const matchesBarber = !barberId || barberId === "all" || apt.barberId === barberId;
    return matchesDate && matchesBarber;
  });
}

export function addStoredAppointment(aptData: Partial<StoredAppointment>): StoredAppointment {
  if (!global.__mrbastos_appointments) {
    global.__mrbastos_appointments = createInitialAppointments();
  }

  const barber = BARBERS.find((b) => b.id === aptData.barberId) || BARBERS[0];
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
