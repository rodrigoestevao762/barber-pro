import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { BARBERS, getBarberById } from "@/lib/barbers";
import { OFFICIAL_SERVICES } from "@/lib/services";
import { addStoredAppointment, getAppointmentsForDate } from "@/lib/appointments-store";
import { upsertStoredUser } from "@/lib/users-store";
import { normalizeBarberId } from "@/lib/barber-availability";
import { checkBarberDayStatusDB, getBarberDayScheduleDB } from "@/lib/barber-schedule";
import {
  formatAptTimeToHHMM,
  getBrazilDateAndTimeString,
  getBrazilNow,
  parseBrazilDateTime,
} from "@/lib/timezone";
import { checkDayStatus } from "@/lib/holidays";
import {
  sendAppointmentConfirmationEmail,
  sendNewBookingNotificationToBarber,
} from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      serviceId,
      barberId: rawBarberId,
      date,
      isWalkIn,
      clientName,
      clientEmail,
      clientPhone,
      clientPassword,
      status: reqStatus,
      paymentMethod,
    } = body;

    const appointmentStatus = reqStatus || (isWalkIn ? "COMPLETED" : "PENDING");

    // 1. Identifica o serviço oficial correspondente
    const matchedService =
      OFFICIAL_SERVICES.find(
        (s) => s.id === serviceId || s.name.toLowerCase() === String(serviceId).toLowerCase()
      ) || OFFICIAL_SERVICES[0];

    // Validação de data/hora no fuso brasileiro
    const appointmentDate = parseBrazilDateTime(date);
    const requestedBrazil = getBrazilDateAndTimeString(appointmentDate);

    // 2. Identifica e valida o Barbeiro Oficial (com suporte a "qualquer")
    let assignedBarber =
      rawBarberId && rawBarberId !== "qualquer" && rawBarberId !== "all"
        ? getBarberById(rawBarberId) || BARBERS[0]
        : undefined;

    if (!isWalkIn) {
      // 2.1 Validação de Domingo e Feriado (Alagoinhas - BA + Nacionais)
      const dayCheck = checkDayStatus(requestedBrazil.date);
      if (dayCheck.isClosed) {
        return NextResponse.json({ error: dayCheck.reason }, { status: 400 });
      }

      // 2.2 Validação contra horário passado
      const brazilNow = getBrazilNow();
      const isPast =
        requestedBrazil.date < brazilNow.date ||
        (requestedBrazil.date === brazilNow.date && requestedBrazil.time <= brazilNow.time);

      if (isPast) {
        return NextResponse.json(
          { error: "Não é possível agendar um horário que já passou. Por favor, escolha um horário futuro." },
          { status: 400 }
        );
      }

      // 2.3 Coleta agendamentos ativos na data para checagem de conflito / escolha automática
      const startOfDay = new Date(`${requestedBrazil.date}T00:00:00-03:00`);
      const endOfDay = new Date(`${requestedBrazil.date}T23:59:59-03:00`);
      const bookedAtTime = new Set<string>();

      try {
        const dbApts = await prisma.appointment.findMany({
          where: {
            date: { gte: startOfDay, lte: endOfDay },
            status: { notIn: ["CANCELLED"] },
          },
          select: { date: true, barberId: true },
        });
        for (const a of dbApts) {
          if (formatAptTimeToHHMM(a.date) === requestedBrazil.time) {
            bookedAtTime.add(normalizeBarberId(a.barberId));
          }
        }
      } catch (_) {}

      for (const a of getAppointmentsForDate(requestedBrazil.date, null)) {
        if (a.status !== "CANCELLED" && formatAptTimeToHHMM(a.date) === requestedBrazil.time) {
          bookedAtTime.add(normalizeBarberId(a.barberId));
        }
      }

      if (!assignedBarber) {
        // "Qualquer Profissional": escolhe o primeiro barbeiro ativo, fora do almoço e livre
        for (const candidate of BARBERS) {
          const bStatus = await checkBarberDayStatusDB(candidate.id, requestedBrazil.date);
          if (bStatus.isClosed) continue;

          const bSchedule = await getBarberDayScheduleDB(candidate.id, requestedBrazil.date);
          if (bSchedule.earlyClosingTime && requestedBrazil.time > bSchedule.earlyClosingTime) {
            continue;
          }
          if (bSchedule.lunchBreakSlots.includes(requestedBrazil.time)) {
            continue;
          }
          if (bookedAtTime.has(candidate.id)) {
            continue;
          }

          assignedBarber = candidate;
          break;
        }

        if (!assignedBarber) {
          return NextResponse.json(
            { error: "Nenhum profissional está disponível exatamente neste horário (pausa de almoço, escala ou horário ocupado). Escolha outro horário." },
            { status: 400 }
          );
        }
      } else {
        // 2.4 Barbeiro específico selecionado: valida escala 4x4, folga na data, sair antes, almoço individual e conflito
        const barberCheck = await checkBarberDayStatusDB(assignedBarber.id, requestedBrazil.date);
        if (barberCheck.isClosed) {
          return NextResponse.json({ error: barberCheck.reason }, { status: 400 });
        }

        const barberSchedule = await getBarberDayScheduleDB(assignedBarber.id, requestedBrazil.date);
        if (barberSchedule.earlyClosingTime && requestedBrazil.time > barberSchedule.earlyClosingTime) {
          return NextResponse.json(
            {
              error: `${assignedBarber.name} encerrou os atendimentos às ${barberSchedule.earlyClosingTime} nesta data.`,
            },
            { status: 400 }
          );
        }

        if (barberSchedule.lunchBreakSlots.includes(requestedBrazil.time)) {
          return NextResponse.json(
            {
              error: `${assignedBarber.name} está em pausa para o almoço às ${requestedBrazil.time}. Por favor, escolha outro horário.`,
            },
            { status: 400 }
          );
        }

        if (bookedAtTime.has(assignedBarber.id)) {
          return NextResponse.json(
            {
              error: `Este horário (${requestedBrazil.time}) já está reservado para ${assignedBarber.name}.`,
            },
            { status: 409 }
          );
        }
      }
    } else if (!assignedBarber) {
      assignedBarber = BARBERS[0];
    }

    const rawPhone = (clientPhone || "").trim();
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedEmail = clientEmail ? clientEmail.trim().toLowerCase() : null;
    const rawPassword = clientPassword ? String(clientPassword).trim() : "";
    const hashedPassword = await bcrypt.hash(rawPassword || "123", 10);

    // 3. Garante persistência imediata no store local (usuário + agendamento + pagamento)
    const fallbackClientEmail =
      formattedEmail || `${cleanPhone || `cliente-${Date.now()}`}@cliente.mrbastos.com.br`;

    const persistentClient = upsertStoredUser({
      name: clientName?.trim() || (isWalkIn ? "Cliente Balcão" : "Cliente VIP"),
      email: fallbackClientEmail,
      phone: cleanPhone || rawPhone || null,
      passwordHash: hashedPassword,
      role: "CLIENT",
    });

    const finalPaymentMethod = paymentMethod || (isWalkIn ? "DINHEIRO" : "PIX");
    const generatedAptId = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    let dbClient: any = null;
    let dbAppointment: any = null;

    try {
      // 4. Sincroniza Barbeiro no PostgreSQL
      try {
        await prisma.barber.upsert({
          where: { id: assignedBarber.id },
          update: {
            name: assignedBarber.name,
            commissionRate: assignedBarber.commissionRate,
          },
          create: {
            id: assignedBarber.id,
            name: assignedBarber.name,
            commissionRate: assignedBarber.commissionRate,
          },
        });
      } catch (barberErr) {
        console.warn("Aviso ao sincronizar barbeiro no banco:", barberErr);
      }

      // 5. Garante que o Serviço existe no PostgreSQL
      let finalServiceId: string = matchedService.id;
      try {
        const existingService = await prisma.service.findFirst({
          where: {
            OR: [
              { id: serviceId },
              { name: { equals: matchedService.name, mode: "insensitive" } },
            ],
          },
        });

        if (existingService) {
          finalServiceId = existingService.id;
        } else {
          const newService = await prisma.service.upsert({
            where: { id: matchedService.id },
            update: {
              name: matchedService.name,
              price: matchedService.price,
              duration: matchedService.duration,
            },
            create: {
              id: matchedService.id,
              name: matchedService.name,
              description: matchedService.description,
              price: matchedService.price,
              duration: matchedService.duration,
            },
          });
          finalServiceId = newService.id;
        }
      } catch (servErr) {
        console.warn("Aviso ao sincronizar serviço no banco:", servErr);
        const fallbackServ = await prisma.service.findFirst();
        if (fallbackServ) finalServiceId = fallbackServ.id;
      }

      // 6. Busca ou cria Cliente no PostgreSQL
      if (isWalkIn && !clientName) {
        dbClient = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      } else {
        const existingClient = await prisma.user.findFirst({
          where: {
            OR: [
              ...(formattedEmail ? [{ email: formattedEmail }] : []),
              ...(cleanPhone
                ? [
                    { phone: cleanPhone },
                    { phone: cleanPhone.startsWith("55") ? cleanPhone.slice(2) : `55${cleanPhone}` },
                  ]
                : []),
            ],
          },
        });

        if (existingClient) {
          dbClient = existingClient;
          const updateData: any = {};
          if (formattedEmail && (!dbClient.email || dbClient.email !== formattedEmail)) {
            updateData.email = formattedEmail;
          }
          if (clientName && (!dbClient.name || dbClient.name === "Cliente")) {
            updateData.name = clientName.trim();
          }
          if (rawPassword && rawPassword !== "123") {
            updateData.password = hashedPassword;
          }
          if (Object.keys(updateData).length > 0) {
            try {
              dbClient = await prisma.user.update({
                where: { id: dbClient.id },
                data: updateData,
              });
            } catch (_) {}
          }
        } else {
          try {
            dbClient = await prisma.user.create({
              data: {
                name: clientName?.trim() || "Cliente",
                phone: cleanPhone || null,
                email: formattedEmail || null,
                password: hashedPassword,
                role: "CLIENT",
              },
            });
          } catch (createErr) {
            console.warn("Conflito ao criar cliente, buscando existente:", createErr);
            dbClient = await prisma.user.findFirst({
              where: {
                OR: [
                  ...(formattedEmail ? [{ email: formattedEmail }] : []),
                  ...(cleanPhone ? [{ phone: cleanPhone }] : []),
                ],
              },
            });
          }
        }
      }

      if (!dbClient) {
        dbClient = await prisma.user.findFirst();
      }

      // 7. Grava o agendamento no PostgreSQL
      dbAppointment = await prisma.appointment.create({
        data: {
          date: appointmentDate,
          serviceId: finalServiceId,
          userId: dbClient.id,
          barberId: assignedBarber.id,
          status: appointmentStatus,
        },
        include: {
          service: true,
          user: true,
          barber: true,
        },
      });

      // 8. Sincroniza também no store local/disco para contingência e forma de pagamento
      addStoredAppointment({
        id: dbAppointment.id,
        date: appointmentDate.toISOString(),
        barberId: assignedBarber.id,
        service: {
          id: matchedService.id,
          name: matchedService.name,
          price: matchedService.price,
          duration: matchedService.duration,
        },
        user: {
          id: dbClient.id,
          name: dbClient.name || clientName || "Cliente",
          phone: dbClient.phone || clientPhone || "(75) 98888-0000",
          email: dbClient.email || formattedEmail || undefined,
        },
        status: appointmentStatus,
        paymentMethod: finalPaymentMethod,
        durationSpent: appointmentStatus === "COMPLETED" ? matchedService.duration : undefined,
      });

      // 9. Dispara notificações por e-mail Resend de forma assíncrona (não bloqueia a resposta)
      if (!isWalkIn) {
        const [year, month, day] = requestedBrazil.date.split("-");
        const dateFormatted = `${day}/${month}/${year}`;
        const timeFormatted = requestedBrazil.time;

        if (formattedEmail) {
          sendAppointmentConfirmationEmail({
            to: formattedEmail,
            clientName: dbClient.name || clientName || "Cliente VIP",
            serviceName: matchedService.name,
            servicePrice: matchedService.price,
            barberName: assignedBarber.name,
            dateFormatted,
            timeFormatted,
          }).catch((e) => console.error("Erro assíncrono envio confirmação:", e));
        }

        if (assignedBarber.email) {
          sendNewBookingNotificationToBarber({
            to: assignedBarber.email,
            barberName: assignedBarber.name,
            clientName: dbClient.name || clientName || "Cliente VIP",
            clientPhone: dbClient.phone || rawPhone || "Não informado",
            serviceName: matchedService.name,
            servicePrice: matchedService.price,
            dateFormatted,
            timeFormatted,
          }).catch((e) => console.error("Erro assíncrono notificação barbeiro:", e));
        }
      }

      return NextResponse.json({
        success: true,
        message: "Agendamento e conta de cliente criados com sucesso!",
        appointment: {
          ...dbAppointment,
          paymentMethod: finalPaymentMethod,
        },
        barber: assignedBarber,
        client: {
          id: dbClient.id,
          name: dbClient.name,
          email: dbClient.email,
          phone: dbClient.phone,
        },
      });
    } catch (dbErr: any) {
      console.error("ERRO NO BANCO AO AGENDAR (usando store local):", dbErr);

      const stored = addStoredAppointment({
        id: generatedAptId,
        date: appointmentDate.toISOString(),
        barberId: assignedBarber.id,
        service: {
          id: matchedService.id,
          name: matchedService.name,
          price: matchedService.price,
          duration: matchedService.duration,
        },
        user: {
          id: persistentClient.id,
          name: persistentClient.name,
          phone: persistentClient.phone || rawPhone || "(75) 98888-0000",
          email: formattedEmail || persistentClient.email,
        },
        status: appointmentStatus,
        paymentMethod: finalPaymentMethod,
        durationSpent: appointmentStatus === "COMPLETED" ? matchedService.duration : undefined,
      });

      if (!isWalkIn) {
        const [year, month, day] = requestedBrazil.date.split("-");
        const dateFormatted = `${day}/${month}/${year}`;
        const timeFormatted = requestedBrazil.time;

        if (formattedEmail) {
          sendAppointmentConfirmationEmail({
            to: formattedEmail,
            clientName: persistentClient.name,
            serviceName: matchedService.name,
            servicePrice: matchedService.price,
            barberName: assignedBarber.name,
            dateFormatted,
            timeFormatted,
          }).catch(() => {});
        }

        if (assignedBarber.email) {
          sendNewBookingNotificationToBarber({
            to: assignedBarber.email,
            barberName: assignedBarber.name,
            clientName: persistentClient.name,
            clientPhone: persistentClient.phone || rawPhone || "Não informado",
            serviceName: matchedService.name,
            servicePrice: matchedService.price,
            dateFormatted,
            timeFormatted,
          }).catch(() => {});
        }
      }

      return NextResponse.json({
        success: true,
        message: "Agendamento registrado com segurança",
        appointment: {
          ...stored,
          barber: assignedBarber,
        },
        barber: assignedBarber,
        client: {
          id: persistentClient.id,
          name: persistentClient.name,
          email: formattedEmail || persistentClient.email,
          phone: persistentClient.phone,
        },
      });
    }
  } catch (error: any) {
    console.error("ERRO GERAL:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}
