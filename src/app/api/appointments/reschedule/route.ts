import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateStoredAppointment, getStoredAppointmentById } from "@/lib/appointments-store";
import { checkDayStatus } from "@/lib/holidays";
import { getBrazilNow, parseBrazilDateTime } from "@/lib/timezone";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { id, requestedDate, requestedTime } = body;

    if (!id || !requestedDate || !requestedTime) {
      return NextResponse.json({ error: "Dados incompletos para reagendamento" }, { status: 400 });
    }

    // 1. Valida se a nova data é domingo ou feriado
    const dayCheck = checkDayStatus(requestedDate);
    if (dayCheck.isClosed) {
      return NextResponse.json({ error: dayCheck.reason }, { status: 400 });
    }

    // 2. Valida se o novo horário não está no passado
    const brazilNow = getBrazilNow();
    if (requestedDate < brazilNow.date || (requestedDate === brazilNow.date && requestedTime <= brazilNow.time)) {
      return NextResponse.json({ error: "Não é possível reagendar para um horário que já passou." }, { status: 400 });
    }

    // 3. Monta data ISO com fuso brasileiro
    const newDateTime = parseBrazilDateTime(requestedDate, requestedTime);

    // 4. Busca o agendamento
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

    // 5. Registra a solicitação de reagendamento (status RESCHEDULE_REQUESTED)
    updateStoredAppointment(id, {
      status: "RESCHEDULE_REQUESTED",
      requestedDate: newDateTime.toISOString(),
    });

    try {
      await prisma.appointment.update({
        where: { id },
        data: {
          status: "RESCHEDULE_REQUESTED",
        },
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      status: "RESCHEDULE_REQUESTED",
      requestedDate: newDateTime.toISOString(),
      requestedDateDisplay: `${requestedDate.split("-").reverse().join("/")} às ${requestedTime}`,
      barber: apt.barber,
      appointment: apt,
      message: "Solicitação de reagendamento registrada. O barbeiro foi notificado para aprovação no painel.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao solicitar reagendamento" }, { status: 500 });
  }
}

