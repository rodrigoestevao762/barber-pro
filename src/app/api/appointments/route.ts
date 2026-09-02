import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { serviceId, date, isWalkIn, clientName, clientPhone, clientPassword } = body;

    // Usa o serviceId selecionado ou pega o primeiro como fallback
    if (!serviceId || serviceId === "1") {
       const defaultService = await prisma.service.findFirst();
       if(defaultService) {
         serviceId = defaultService.id;
       }
    }

    let client;
    if (isWalkIn && !clientName) {
       // Walk-in sem nome atrela ao gestor temporariamente ou pega o primeiro admin (fallback)
       client = await prisma.user.findFirst({ where: { role: "ADMIN" }});
    } else {
       const phone = clientPhone || "00000000000";
       const cleanPhone = phone.replace(/\D/g, "");
       
       const existingClient = await prisma.user.findUnique({ where: { phone: cleanPhone } });
       if (existingClient) {
           // Verifica a senha se o cliente existir
           if (!clientPassword || !existingClient.password) {
              return NextResponse.json({ error: 'Conta existente. Por favor, forneça sua senha.' }, { status: 401 });
           }
           const isValid = await bcrypt.compare(clientPassword, existingClient.password);
           if (!isValid) {
              return NextResponse.json({ error: 'Senha incorreta para este número.' }, { status: 401 });
           }
           client = existingClient;
       } else {
           // Cria novo cliente com senha
           const hashedPassword = clientPassword ? await bcrypt.hash(clientPassword, 10) : await bcrypt.hash("123456", 10);
           client = await prisma.user.create({
             data: {
               name: clientName || "Cliente",
               phone: cleanPhone,
               password: hashedPassword,
               role: "CLIENT"
             }
           });
       }
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
