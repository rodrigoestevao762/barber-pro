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
    bio: "Mestre barbeiro e fundador da Mr. Bastos Barbearia. Mais de 8 anos de excelência.",
    commissionRate: 1.0, // Dono recebe 100% de seus cortes + 55% da equipe
  },
  {
    id: "barbeiro-lucas",
    name: "Lucas Barbeiro",
    email: "lucas@mrbastos.com",
    phone: "5575999990002",
    phoneDisplay: "(75) 99999-0002",
    role: "BARBER",
    specialty: "Fade, Degradê Navalhado & Freestyle",
    avatar: "/nossa-area/area-04.jpg",
    bio: "Especialista em cortes modernos, transições de degradê e acabamento milimétrico.",
    commissionRate: 0.45, // Comissão de 45% (55% repasse para a casa)
  },
  {
    id: "barbeiro-felipe",
    name: "Felipe Barbeiro",
    email: "felipe@mrbastos.com",
    phone: "5575999990003",
    phoneDisplay: "(75) 99999-0003",
    role: "BARBER",
    specialty: "Barba Terapia, Alinhamento & Navalha",
    avatar: "/nossa-area/area-07.jpg",
    bio: "Especialista em desenho de barba na navalha, hidratação e cuidados faciais.",
    commissionRate: 0.45, // Comissão de 45% (55% repasse para a casa)
  },
];

export function getBarberById(id?: string | null): BarberData | undefined {
  if (!id) return undefined;
  return BARBERS.find((b) => b.id === id);
}

export function getBarberByEmail(email?: string | null): BarberData | undefined {
  if (!email) return undefined;
  return BARBERS.find((b) => b.email.toLowerCase() === email.toLowerCase());
}
