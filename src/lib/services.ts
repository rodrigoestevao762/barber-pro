export type ServiceCategory = "combo" | "corte" | "barba" | "estetica";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isCombo?: boolean;
  index: string;
  category: ServiceCategory;
  categoryLabel: string;
  image: string;
  badge?: string;
  tags?: string[];
}

export const OFFICIAL_SERVICES: ServiceItem[] = [
  {
    id: "combo-corte-barba",
    index: "01",
    name: "Corte + Barba",
    description: "Combo completo: corte de cabelo + barba com toalha quente, alinhamento na navalha e finalização.",
    price: 55,
    duration: 50,
    isCombo: true,
    category: "combo",
    categoryLabel: "Combos Especiais",
    image: "/experiencia-corte-1.jpg",
    badge: "Mais Pedido",
    tags: ["combo", "corte", "barba", "navalha", "toalha quente"],
  },
  {
    id: "corte",
    index: "02",
    name: "Corte",
    description: "Corte clássico na tesoura ou degradê contemporâneo com acabamento impecável.",
    price: 35,
    duration: 30,
    category: "corte",
    categoryLabel: "Cortes & Acabamento",
    image: "/hero-mrbastos-corte.jpg",
    badge: "O Clássico",
    tags: ["corte", "degradê", "fade", "tesoura", "social"],
  },
  {
    id: "barba",
    index: "03",
    name: "Barba",
    description: "Barboterapia completa, toalha quente, desenho na navalha e hidratação.",
    price: 25,
    duration: 25,
    category: "barba",
    categoryLabel: "Barba & Navalha",
    image: "/experiencia-corte-2.jpg",
    badge: "Tradição",
    tags: ["barba", "barboterapia", "navalha", "toalha quente"],
  },
  {
    id: "combo-corte-sobrancelha",
    index: "04",
    name: "Corte + Sobrancelha",
    description: "Corte completo com design e alinhamento de sobrancelha para um visual marcante.",
    price: 45,
    duration: 40,
    isCombo: true,
    category: "combo",
    categoryLabel: "Combos Especiais",
    image: "/nossa-area/area-01.jpg",
    badge: "Visual Completo",
    tags: ["combo", "corte", "sobrancelha", "visagismo"],
  },
  {
    id: "combo-pezinho-barba",
    index: "05",
    name: "Pezinho + Barba",
    description: "Contorno limpo de pezinho combinado com o alinhamento total da barba na navalha.",
    price: 40,
    duration: 35,
    isCombo: true,
    category: "combo",
    categoryLabel: "Combos Especiais",
    image: "/nossa-area/area-04.jpg",
    badge: "Praticidade",
    tags: ["combo", "pezinho", "barba", "contorno"],
  },
  {
    id: "cabeca-navalha",
    index: "06",
    name: "Cabeça raspada navalha",
    description: "Raspagem lisa na navalha com tratamento refrescante para o couro cabeludo.",
    price: 25,
    duration: 30,
    category: "corte",
    categoryLabel: "Cortes & Acabamento",
    image: "/nossa-area/area-02.jpg",
    tags: ["cabeça", "navalha", "raspado", "acabamento"],
  },
  {
    id: "pezinho",
    index: "07",
    name: "Pezinho",
    description: "Acabamento milimétrico de nuca, costeletas e contorno impecável.",
    price: 20,
    duration: 15,
    category: "corte",
    categoryLabel: "Cortes & Acabamento",
    image: "/nossa-area/area-03.jpg",
    tags: ["pezinho", "nuca", "contorno", "acabamento"],
  },
  {
    id: "barba-maquina",
    index: "08",
    name: "Barba raspada na máquina",
    description: "Aparação e alinhamento rápido e uniforme da barba na máquina.",
    price: 20,
    duration: 20,
    category: "barba",
    categoryLabel: "Barba & Navalha",
    image: "/nossa-area/area-05.jpg",
    tags: ["barba", "máquina", "rápido"],
  },
  {
    id: "sobrancelha",
    index: "09",
    name: "Sobrancelha",
    description: "Design e alinhamento milimétrico na lâmina para homens.",
    price: 15,
    duration: 15,
    category: "estetica",
    categoryLabel: "Estética & Visagismo",
    image: "/nossa-area/area-06.jpg",
    tags: ["sobrancelha", "design", "navalha", "estética"],
  },
];

export function getServiceById(id?: string | null): ServiceItem | undefined {
  if (!id) return undefined;
  return OFFICIAL_SERVICES.find(
    (s) => s.id === id || s.name.toLowerCase() === id.toLowerCase()
  );
}
