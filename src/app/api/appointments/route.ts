import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { BARBERS, getBarberById } from '@/lib/barbers';
import { OFFICIAL_SERVICES } from '@/lib/services';
import { addStoredAppointment } from '@/lib/appointments-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { 
      serviceId, 
      barberId, 
      date, 
      isWalkIn, 
      clientName, 
      clientEmail, 
      clientPhone, 
      clientPassword, 
      status: reqStatus, 
      paymentMethod 
    } = body;

    const appointmentStatus = reqStatus || (isWalkIn ? "COMPLETED" : "PENDING");

    // 1. Identifica e valida o Barbeiro
    let assignedBarber = getBarberById(barberId);
    if (!assignedBarber) {
      assignedBarber = BARBERS[0];
      barberId = assignedBarber.id;
    }

    // 2. Identifica o serviço oficial correspondente
    const matchedService = OFFICIAL_SERVICES.find(
      (s) => s.id === serviceId || s.name.toLowerCase() === String(serviceId).toLowerCase()
    ) || OFFICIAL_SERVICES[0];

    try {
      // 3. Garante que o Barbeiro existe na tabela Barber do banco de dados
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

      // 4. Garante que o Serviço existe na tabela Service do banco de dados (evita erro de chave estrangeira)
      let finalServiceId: string = serviceId;
      try {
        // Tenta achar pelo ID ou pelo Nome
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
          // Cria o serviço oficial no banco com o ID padronizado
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
        console.warn("Aviso ao sincronizar serviço no banco, usando fallback:", servErr);
        const fallbackServ = await prisma.service.findFirst();
        if (fallbackServ) {
          finalServiceId = fallbackServ.id;
        }
      }

      // 5. Garante que o Cliente existe e cria/atualiza a conta no banco de dados
      let client: any = null;

      if (isWalkIn && !clientName) {
        client = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      } else {
        const rawPhone = (clientPhone || "").trim();
        const cleanPhone = rawPhone.replace(/\D/g, "");
        const formattedEmail = clientEmail ? clientEmail.trim().toLowerCase() : null;

        // Busca cliente existente por e-mail ou telefone
        const existingClient = await prisma.user.findFirst({
          where: {
            OR: [
              ...(formattedEmail ? [{ email: formattedEmail }] : []),
              ...(cleanPhone ? [
                { phone: cleanPhone },
                { phone: cleanPhone.startsWith("55") ? cleanPhone.slice(2) : `55${cleanPhone}` },
              ] : []),
            ],
          },
        });

        if (existingClient) {
          client = existingClient;
          const updateData: any = {};
          if (formattedEmail && (!client.email || client.email !== formattedEmail)) {
            updateData.email = formattedEmail;
          }
          if (clientName && (!client.name || client.name === "Cliente")) {
            updateData.name = clientName.trim();
          }
          if (clientPassword && clientPassword !== "123") {
            updateData.password = await bcrypt.hash(clientPassword, 10);
          }
          if (Object.keys(updateData).length > 0) {
            try {
              client = await prisma.user.update({
                where: { id: client.id },
                data: updateData,
              });
            } catch (_) {}
          }
        } else {
          // Cria nova conta com perfil CLIENT
          const hashedPassword = await bcrypt.hash(clientPassword || "123", 10);
          try {
            client = await prisma.user.create({
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
            client = await prisma.user.findFirst({
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

      // Se por algum motivo o cliente ainda for nulo, busca o primeiro usuário ou cria fallback
      if (!client) {
        client = await prisma.user.findFirst();
      }

      // 6. Grava o agendamento no banco de dados
      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          serviceId: finalServiceId,
          userId: client.id,
          barberId: assignedBarber.id,
          status: appointmentStatus,
        },
        include: {
          service: true,
          user: true,
          barber: true,
        },
      });

      // 7. Sincroniza também no store em memória para feedback instantâneo
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
          id: client.id,
          name: client.name || clientName || "Cliente",
          phone: client.phone || clientPhone || "(75) 98888-0000",
          email: client.email || clientEmail,
        },
        status: appointmentStatus,
        durationSpent: appointmentStatus === "COMPLETED" ? matchedService.duration : undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Agendamento e conta de cliente criados com sucesso!",
        appointment,
        barber: assignedBarber,
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
        },
      });

    } catch (dbErr: any) {
      console.error("ERRO NO BANCO AO AGENDAR:", dbErr);

      // Fallback em memória para contingência de rede
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
        status: appointmentStatus,
        durationSpent: appointmentStatus === "COMPLETED" ? matchedService.duration : undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Agendamento gravado em modo seguro",
        appointment: {
          ...stored,
          barber: assignedBarber,
        },
        barber: assignedBarber,
        dbError: dbErr?.message || String(dbErr),
      });
    }

  } catch (error: any) {
    console.error("ERRO GERAL:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar agendamento" }, { status: 500 });
  }
}
