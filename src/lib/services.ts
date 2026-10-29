export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isCombo?: boolean;
}

export const OFFICIAL_SERVICES: ServiceItem[] = [
  { 
    id: "corte", 
    name: "Corte", 
    description: "Corte clássico ou degradê contemporâneo com finalização profissional.", 
    price: 35, 
    duration: 30 
  },
  { 
    id: "barba", 
    name: "Barba", 
    description: "Barboterapia completa, toalha quente, desenho na navalha e hidratação.", 
    price: 25, 
    duration: 25 
  },
  { 
    id: "cabeca-navalha", 
    name: "Cabeça raspada navalha", 
    description: "Raspagem lisa na navalha com tratamento refrescante para o couro cabeludo.", 
    price: 25, 
    duration: 30 
  },
  { 
    id: "pezinho", 
    name: "Pezinho", 
    description: "Acabamento de nuca, costeletas e contorno impecável.", 
    price: 20, 
    duration: 15 
  },
  { 
    id: "barba-maquina", 
    name: "Barba raspada na máquina", 
    description: "Aparação e alinhamento rápido da barba na máquina.", 
    price: 20, 
    duration: 20 
  },
  { 
    id: "sobrancelha", 
    name: "Sobrancelha", 
    description: "Design e alinhamento milimétrico na lâmina para homens.", 
    price: 15, 
    duration: 15 
  },
  { 
    id: "combo-corte-barba", 
    name: "Corte + Barba", 
    description: "Combo completo: corte de cabelo + barba com toalha quente e massagem.", 
    price: 55, 
    duration: 50,
    isCombo: true 
  },
  { 
    id: "combo-pezinho-barba", 
    name: "Pezinho + Barba", 
    description: "Contorno limpo de pezinho combinado com o alinhamento total da barba.", 
    price: 40, 
    duration: 35,
    isCombo: true 
  },
  { 
    id: "combo-corte-sobrancelha", 
    name: "Corte + Sobrancelha", 
    description: "Corte completo com sobrancelha alinhada para um visual marcante.", 
    price: 45, 
    duration: 40,
    isCombo: true 
  },
];

export function getServiceById(id?: string | null): ServiceItem | undefined {
  if (!id) return undefined;
  return OFFICIAL_SERVICES.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
}
