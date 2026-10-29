import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { BARBERS, getBarberById } from '@/lib/barbers';
import { OFFICIAL_SERVICES } from '@/lib/services';
import { addStoredAppointment } from '@/lib/appointments-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { serviceId, barberId, date, isWalkIn, clientName, clientEmail, clientPhone, clientPassword } = body;

    // Se o barbeiro for vazio ou inválido, seleciona o Mr. Bastos (Dono)
    let assignedBarber = getBarberById(barberId);
    if (!assignedBarber) {
      assignedBarber = BARBERS[0];
      barberId = assignedBarber.id;
    }

    const matchedService = OFFICIAL_SERVICES.find((s) => s.id === serviceId) || OFFICIAL_SERVICES[0];

    try {
      // 1. Serviço
      if (!serviceId || serviceId === "1") {
        const defaultService = await prisma.service.findFirst();
        if (defaultService) {
          serviceId = defaultService.id;
        }
      }

      // 2. Cliente
      let client;
      if (isWalkIn && !clientName) {
        client = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      } else {
        const phone = clientPhone || "00000000000";
        const cleanPhone = phone.replace(/\D/g, "");
        const formattedEmail = clientEmail ? clientEmail.trim().toLowerCase() : undefined;

        const existingClient = await prisma.user.findFirst({
          where: {
            OR: [
              ...(cleanPhone ? [{ phone: cleanPhone }] : []),
              ...(formattedEmail ? [{ email: formattedEmail }] : []),
            ],
          },
        });

        if (existingClient) {
          client = existingClient;
          if (formattedEmail && (!client.email || client.email !== formattedEmail)) {
            try {
              await prisma.user.update({
                where: { id: client.id },
                data: { email: formattedEmail },
              });
            } catch (_) {}
          }
        } else {
          const hashedPassword = clientPassword
            ? await bcrypt.hash(clientPassword, 10)
            : await bcrypt.hash("123", 10);
          client = await prisma.user.create({
            data: {
              name: clientName || "Cliente",
              phone: cleanPhone,
              email: formattedEmail || null,
              password: hashedPassword,
              role: "CLIENT",
            },
          });
        }
      }

      // Garante que o Barbeiro existe na tabela Barber do banco se for gravar relação
      try {
        await prisma.barber.upsert({
          where: { id: assignedBarber.id },
          update: { name: assignedBarber.name },
          create: {
            id: assignedBarber.id,
            name: assignedBarber.name,
            commissionRate: assignedBarber.commissionRate,
          },
        });
      } catch (barberErr) {
        console.warn("Erro ao sincronizar barbeiro no banco:", barberErr);
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          serviceId: serviceId || "corte",
          userId: client?.id || "walk-in",
          barberId: assignedBarber.id,
          status: isWalkIn ? "CONFIRMED" : "PENDING",
        },
      });

      // Também adiciona ao store em memória para sincronia instantânea
      addStoredAppointment({
        id: appointment.id,
        date: new Date(date).toISOString(),
        barberId: assignedBarber.id,
        service: {
          id: matchedService.id,
          name: matchedService.name,
          price: matchedService.price,
          duration: matchedService.duration,
        },
        user: {
          id: client?.id || `u-${Date.now()}`,
          name: clientName || "Cliente",
          phone: clientPhone || "(75) 98888-0000",
          email: clientEmail,
        },
        status: isWalkIn ? "CONFIRMED" : "PENDING",
      });

      return NextResponse.json({
        success: true,
        message: "Agendamento criado com sucesso",
        appointment,
        barber: assignedBarber,
      });
    } catch (dbErr) {
      console.warn("Agendamento processado em modo fallback:", dbErr);
      
      const stored = addStoredAppointment({
        date: new Date(date).toISOString(),
        barberId: assignedBarber.id,
        service: {
          id: matchedService.id,
          name: matchedService.name,
          price: matchedService.price,
          duration: matchedService.duration,
        },
        user: {
          id: `u-${Date.now()}`,
          name: clientName || "Cliente",
          phone: clientPhone || "(75) 98888-0000",
          email: clientEmail,
        },
        status: isWalkIn ? "CONFIRMED" : "PENDING",
      });

      return NextResponse.json({
        success: true,
        message: "Agendamento confirmado em modo demonstração",
        appointment: stored,
        barber: assignedBarber,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}
