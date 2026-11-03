/**
 * Gerenciador de Disponibilidade dos Barbeiros (Escala Flexível / 4x4 do Dono).
 * Permite que o barbeiro proprietário ative/desative sua presença na lista pública de agendamento.
 */

declare global {
  var __barber_availabilities: Record<string, boolean> | undefined;
}

if (!global.__barber_availabilities) {
  global.__barber_availabilities = {
    "barbeiro-dono": true, // Mr. Bastos (Dono)
    "barbeiro-nando": true,
    "barbeiro-saul": true,
  };
}

export function isBarberAvailable(barberId: string): boolean {
  if (!global.__barber_availabilities) {
    global.__barber_availabilities = {
      "barbeiro-dono": true,
      "barbeiro-nando": true,
      "barbeiro-saul": true,
    };
  }

  // Se não estiver definido explicitamente, assume true por padrão
  return global.__barber_availabilities[barberId] ?? true;
}

export function setBarberAvailable(barberId: string, available: boolean): boolean {
  if (!global.__barber_availabilities) {
    global.__barber_availabilities = {};
  }

  global.__barber_availabilities[barberId] = available;
  return available;
}

export function getAllBarberAvailabilities(): Record<string, boolean> {
  return global.__barber_availabilities || {
    "barbeiro-dono": true,
    "barbeiro-nando": true,
    "barbeiro-saul": true,
  };
}

