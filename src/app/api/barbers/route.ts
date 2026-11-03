import { NextResponse } from "next/server";
import { BARBERS } from "@/lib/barbers";
import { isBarberAvailable, setBarberAvailable, getAllBarberAvailabilities } from "@/lib/barber-availability";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get("all") === "true";

  const availabilities = getAllBarberAvailabilities();

  const barbersWithStatus = BARBERS.map((b) => ({
    ...b,
    isAvailable: availabilities[b.id] ?? true,
  }));

  if (includeAll) {
    return NextResponse.json(barbersWithStatus);
  }

  // Apenas barbeiros disponíveis para agendamento público
  const activeBarbers = barbersWithStatus.filter((b) => b.isAvailable !== false);
  return NextResponse.json(activeBarbers);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { barberId, isAvailable } = body;

    if (!barberId || typeof isAvailable !== "boolean") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    setBarberAvailable(barberId, isAvailable);

    return NextResponse.json({
      success: true,
      barberId,
      isAvailable,
      message: `Status do barbeiro atualizado para ${isAvailable ? "Disponível (Trabalhando)" : "Oculto (Folga / 4x4)"}.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar status do barbeiro" }, { status: 500 });
  }
}
