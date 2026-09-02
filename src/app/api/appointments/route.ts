import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { serviceId, date, isWalkIn, clientName, clientPhone } = body;

    // Pega o primeiro serviço caso venha ID genérico (como do botão Cliente Balcão)
    if (isWalkIn || serviceId === "1") {
       const defaultService = await prisma.service.findFirst();
       if(defaultService) {
         serviceId = defaultService.id;
       }
    }

    // Cria ou atualiza o cliente com base no telefone (se não for walk-in sem dados)
    let client;
    if (isWalkIn && !clientName) {
       client = await prisma.user.findUnique({ where: { email: "cliente@teste.com" }});
    } else {
       const phone = clientPhone || "00000000000";
       client = await prisma.user.upsert({
         where: { email: `${phone}@barber.com` }, // Usando email fictício baseado no número
         update: { name: clientName, phone: phone },
         create: {
           name: clientName || "Cliente",
           email: `${phone}@barber.com`,
           phone: phone,
           role: "CLIENT"
         }
       });
    }

    if (!serviceId || !client) {
       return NextResponse.json({ error: 'Faltam dados base no banco' }, { status: 400 });
    }

    // Inserção Real no Banco
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        serviceId,
        userId: client.id,
        // Cliente Balcão já entra Confirmado
        status: isWalkIn ? "CONFIRMED" : "PENDING"
      }
    });

    return NextResponse.json({ success: true, message: "Agendamento criado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
