import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateStoredAppointment, getStoredAppointmentById } from "@/lib/appointments-store";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do agendamento não informado" }, { status: 400 });
    }

    // Busca o agendamento no banco ou no store
    let apt: any = null;
    try {
      apt = await prisma.appointment.findUnique({
        where: { id },
        include: { barber: true, service: true, user: true },
      });
    } catch (_) {}

    if (!apt) {
      apt = getStoredAppointmentById(id);
    }

    if (!apt) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    // Verifica a regra dos 30 minutos a partir da criação
    const createdAtTime = apt.createdAt ? new Date(apt.createdAt).getTime() : new Date(apt.date).getTime();
    const minutesSinceCreation = (Date.now() - createdAtTime) / (1000 * 60);
    const isWithin30Min = minutesSinceCreation <= 30;

    if (isWithin30Min) {
      // Cancelamento direto e liberação imediata do horário
      updateStoredAppointment(id, { status: "CANCELLED" });
      try {
        await prisma.appointment.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        directCancelled: true,
        status: "CANCELLED",
        message: "Agendamento cancelado com sucesso dentro do prazo de 30 minutos. O horário foi liberado.",
        barber: apt.barber,
        appointment: apt,
      });
    } else {
      // Passou dos 30 minutos: gera solicitação para o barbeiro aprovar
      updateStoredAppointment(id, { status: "CANCEL_REQUESTED" });
      try {
        await prisma.appointment.update({
          where: { id },
          data: { status: "CANCEL_REQUESTED" },
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        directCancelled: false,
        status: "CANCEL_REQUESTED",
        message: "O prazo de cancelamento direto (30 minutos) expirou. Uma solicitação foi enviada para o barbeiro aprovar no painel.",
        barber: apt.barber,
        appointment: apt,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar cancelamento" }, { status: 500 });
  }
}

