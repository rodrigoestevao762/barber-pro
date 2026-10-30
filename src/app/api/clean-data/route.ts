import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BARBERS } from "@/lib/barbers";
import { clearAllStoredData } from "@/lib/appointments-store";

export async function GET() {
  try {
    // 1. Limpa todos os agendamentos de teste
    const deletedAppointments = await prisma.appointment.deleteMany();

    // 2. Limpa listas de espera de teste
    const deletedWaitlists = await prisma.waitlist.deleteMany();

    // 3. Limpa fechamentos de caixa de teste
    const deletedClosings = await prisma.cashClosing.deleteMany();

    // 4. Limpa despesas de teste
    const deletedExpenses = await prisma.expense.deleteMany();

    // 5. Apaga todas as contas de clientes de testes e o gestor anterior 21997073357
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        OR: [
          { role: "CLIENT" },
          { phone: { contains: "21997073357" } },
          { email: { contains: "21997073357" } },
          { email: { contains: "teste" } },
          { email: "cliente@mrbastos.com" },
          { name: { contains: "Gestor" } },
          { name: { contains: "Thiago" } },
          { name: { contains: "Rodrigo Estêvão" } },
        ],
      },
    });

    // 6. Garante apenas os 3 barbeiros oficiais cadastrados no banco
    const officialBarberIds = BARBERS.map((b) => b.id);
    await prisma.barber.deleteMany({
      where: {
        id: { notIn: officialBarberIds },
      },
    });

    for (const b of BARBERS) {
      await prisma.barber.upsert({
        where: { id: b.id },
        update: {
          name: b.name,
          commissionRate: b.commissionRate,
        },
        create: {
          id: b.id,
          name: b.name,
          commissionRate: b.commissionRate,
        },
      });
    }

    // 7. Zera o cache em memória
    clearAllStoredData();

    // 8. Contagens atuais do sistema limpo
    const remainingUsers = await prisma.user.count();
    const remainingAppointments = await prisma.appointment.count();
    const remainingBarbers = await prisma.barber.count();
    const remainingServices = await prisma.service.count();

    return NextResponse.json({
      success: true,
      message: "Limpeza completa executada com sucesso! O sistema está 100% limpo para início oficial.",
      deleted: {
        appointments: deletedAppointments.count,
        waitlists: deletedWaitlists.count,
        closings: deletedClosings.count,
        expenses: deletedExpenses.count,
        testUsersAndClients: deletedUsers.count,
      },
      currentStatus: {
        remainingUsers,
        remainingAppointments,
        remainingBarbers,
        remainingServices,
      },
    });
  } catch (error: any) {
    console.error("ERRO NA LIMPEZA DE DADOS:", error);
    // Mesmo com erro de banco, zera a memória
    clearAllStoredData();
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
        memoryCleared: true,
      },
      { status: 500 }
    );
  }
}

