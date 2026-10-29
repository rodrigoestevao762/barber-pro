export interface BarberData {
  id: string;
  name: string;
  email: string;
  phone: string; // WhatsApp com DDI e DDD (ex: 5575999990001)
  phoneDisplay: string;
  role: "ADMIN" | "BARBER";
  specialty: string;
  avatar: string;
  bio: string;
  commissionRate: number; // 0.45 para barbeiros funcionários (45%), 1.0 para o Dono (100%)
}

export const BARBERS: BarberData[] = [
  {
    id: "barbeiro-dono",
    name: "Mr. Bastos (Dono)",
    email: "dono@mrbastos.com",
    phone: "5575999990001",
    phoneDisplay: "(75) 99999-0001",
    role: "ADMIN",
    specialty: "Cortes Clássicos, Barboterapia & Visagismo",
    avatar: "/nossa-area/area-01.jpg",
    bio: "Mestre barbeiro e proprietário da Mr. Bastos Barbearia. Tradição e excelência em Alagoinhas.",
    commissionRate: 1.0, // Dono recebe 100% de seus cortes + 55% da equipe
  },
  {
    id: "barbeiro-nando",
    name: "Nando Barbeiro",
    email: "nando@mrbastos.com",
    phone: "5575999990002",
    phoneDisplay: "(75) 99999-0002",
    role: "BARBER",
    specialty: "Fade, Degradê Navalhado & Freestyle",
    avatar: "/nossa-area/area-04.jpg",
    bio: "Especialista em transições de degradê, cortes modernos e acabamento milimétrico na lâmina.",
    commissionRate: 0.45, // Comissão oficial de 45% (55% repasse para a casa)
  },
  {
    id: "barbeiro-saul",
    name: "Saul Barbeiro",
    email: "saul@mrbastos.com",
    phone: "5575999990003",
    phoneDisplay: "(75) 99999-0003",
    role: "BARBER",
    specialty: "Barba Terapia, Alinhamento & Navalha",
    avatar: "/nossa-area/area-07.jpg",
    bio: "Especialista em desenho e escultura de barba na navalha, toalha quente e tratamentos faciais.",
    commissionRate: 0.45, // Comissão oficial de 45% (55% repasse para a casa)
  },
];

export function getBarberById(id?: string | null): BarberData | undefined {
  if (!id) return undefined;
  // Compatibilidade caso algum ID antigo esteja em cache
  if (id === "barbeiro-lucas") return BARBERS[1]; // Nando
  if (id === "barbeiro-felipe") return BARBERS[2]; // Saul
  return BARBERS.find((b) => b.id === id);
}

export function getBarberByEmail(email?: string | null): BarberData | undefined {
  if (!email) return undefined;
  const lower = email.toLowerCase().trim();
  if (lower === "lucas@mrbastos.com") return BARBERS[1];
  if (lower === "felipe@mrbastos.com") return BARBERS[2];
  if (lower === "admin@mrbastos.com") return BARBERS[0];
  return BARBERS.find((b) => b.email.toLowerCase() === lower);
}
