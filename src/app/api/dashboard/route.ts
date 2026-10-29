import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BARBERS, getBarberById } from '@/lib/barbers';

// Dados de demonstração consistentes para teste dos painéis caso o DB esteja vazio
function getMockAppointments(selectedDateStr: string) {
  const d = selectedDateStr;
  return [
    {
      id: "mock-1",
      date: new Date(`${d}T09:00:00Z`),
      status: "COMPLETED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)" },
      service: { id: "corte", name: "Corte", price: 35 },
      user: { id: "u-1", name: "Marcos Vinicius", phone: "75988112233" },
      durationSpent: 28,
    },
    {
      id: "mock-2",
      date: new Date(`${d}T10:00:00Z`),
      status: "COMPLETED",
      barberId: "barbeiro-dono",
      barber: { id: "barbeiro-dono", name: "Mr. Bastos (Dono)" },
      service: { id: "combo-corte-barba", name: "Corte + Barba", price: 55 },
      user: { id: "u-2", name: "Guilherme Santos", phone: "75988223344" },
      durationSpent: 45,
    },
    {
      id: "mock-3",
      date: new Date(`${d}T11:00:00Z`),
      status: "CONFIRMED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro" },
      service: { id: "corte", name: "Corte", price: 35 },
      user: { id: "u-3", name: "Thiago Lima", phone: "75988334455" },
    },
    {
      id: "mock-4",
      date: new Date(`${d}T14:00:00Z`),
      status: "COMPLETED",
      barberId: "barbeiro-lucas",
      barber: { id: "barbeiro-lucas", name: "Lucas Barbeiro" },
      service: { id: "corte", name: "Corte", price: 35 },
      user: { id: "u-4", name: "Rafael Silva", phone: "75988445566" },
      durationSpent: 25,
    },
    {
      id: "mock-5",
      date: new Date(`${d}T15:00:00Z`),
      status: "CONFIRMED",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro" },
      service: { id: "barba", name: "Barba", price: 25 },
      user: { id: "u-5", name: "Carlos Eduardo", phone: "75988556677" },
    },
    {
      id: "mock-6",
      date: new Date(`${d}T16:00:00Z`),
      status: "COMPLETED",
      barberId: "barbeiro-felipe",
      barber: { id: "barbeiro-felipe", name: "Felipe Barbeiro" },
      service: { id: "combo-corte-barba", name: "Corte + Barba", price: 55 },
      user: { id: "u-6", name: "André Matos", phone: "75988667788" },
      durationSpent: 40,
    },
  ];
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "ADMIN";
    const userBarberId = (session?.user as any)?.barberId;
    const userId = (session?.user as any)?.id;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const filterBarberId = searchParams.get("barberId") || "all";

    // 1. FLUXO DO CLIENTE
    if (userRole === "CLIENT") {
      try {
        const clientUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            appointments: {
              include: { service: true, barber: true },
              orderBy: { date: "desc" },
            },
          },
        });

        const appointments = clientUser?.appointments || [];
        const completedCuts = appointments.filter((a) => a.status === "COMPLETED").length;

        return NextResponse.json({
          isClient: true,
          appointments,
          loyaltyCard: {
            currentCuts: completedCuts % 10,
            targetCuts: 10,
            freeCutsWon: Math.floor(completedCuts / 10),
          },
        });
      } catch (dbErr) {
        // Mock do painel do cliente para teste
        return NextResponse.json({
          isClient: true,
          appointments: [
            {
              id: "apt-cli-1",
              date: new Date(Date.now() + 86400000).toISOString(),
              status: "CONFIRMED",
              service: { name: "Corte", price: 35 },
              barber: { name: "Mr. Bastos (Dono)", phone: "5575999990001" },
            },
            {
              id: "apt-cli-2",
              date: new Date(Date.now() - 172800000).toISOString(),
              status: "COMPLETED",
              service: { name: "Corte + Barba", price: 55 },
              barber: { name: "Mr. Bastos (Dono)", phone: "5575999990001" },
            },
          ],
          loyaltyCard: {
            currentCuts: 4,
            targetCuts: 10,
            freeCutsWon: 0,
          },
        });
      }
    }

    // 2. FLUXO DOS BARBEIROS / DONO (ADMIN)
    let effectiveBarberFilter: string | null = null;

    if (userRole === "BARBER") {
      // Barbeiro funcionário: isolamento estrito, apenas vê a sua produção e seus agendamentos
      effectiveBarberFilter = userBarberId || "barbeiro-lucas";
    } else if (userRole === "ADMIN") {
      // Dono/ADM: pode ver "all" ou filtrar por um barbeiro específico
      effectiveBarberFilter = filterBarberId !== "all" ? filterBarberId : null;
    }

    const startOfDay = new Date(`${dateParam}T00:00:00Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59Z`);

    // Busca todos os atendimentos do dia para calcular métricas globais e repartição de comissões
    let allDayAppointments: any[] = [];

    try {
      const dbAppointments = await prisma.appointment.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { service: true, user: true, barber: true },
        orderBy: { date: "asc" },
      });

      if (dbAppointments.length > 0) {
        allDayAppointments = dbAppointments;
      } else {
        allDayAppointments = getMockAppointments(dateParam);
      }
    } catch (dbErr) {
      allDayAppointments = getMockAppointments(dateParam);
    }

    // Resumo de produção e comissões por barbeiro (45% para funcionários, 100% para o Dono)
    const breakdown = BARBERS.map((barber) => {
      const bApts = allDayAppointments.filter((apt) => apt.barberId === barber.id);
      const bCompleted = bApts.filter((apt) => apt.status === "COMPLETED");
      const bRevenue = bCompleted.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);
      const isOwner = barber.role === "ADMIN";
      
      // Regra de comissão: Dono = 100%, Barbeiro Funcionário = 45%
      const commissionRate = isOwner ? 1.0 : 0.45;
      const commission = isOwner ? bRevenue : bRevenue * 0.45;
      const houseShare = isOwner ? 0 : bRevenue * 0.55;

      return {
        id: barber.id,
        name: barber.name,
        role: barber.role,
        avatar: barber.avatar,
        phone: barber.phone,
        phoneDisplay: barber.phoneDisplay,
        commissionRate,
        totalApts: bApts.length,
        completedApts: bCompleted.length,
        revenue: bRevenue,
        commission,
        houseShare,
      };
    });

    // Métricas Globais da Barbearia
    const totalGrossShop = breakdown.reduce((acc, b) => acc + b.revenue, 0);
    const employeeBarbers = breakdown.filter((b) => b.role === "BARBER");
    const totalEmployeeCommissions = employeeBarbers.reduce((acc, b) => acc + b.commission, 0);
    const ownerBarber = breakdown.find((b) => b.role === "ADMIN");
    const ownerPersonalRevenue = ownerBarber?.revenue || 0;
    const totalHouseEmployeeShare = employeeBarbers.reduce((acc, b) => acc + b.houseShare, 0);
    const houseNetProfit = ownerPersonalRevenue + totalHouseEmployeeShare;

    // Lista filtrada de agendamentos conforme a visão solicitada
    const appointmentsList = effectiveBarberFilter
      ? allDayAppointments.filter((apt) => apt.barberId === effectiveBarberFilter)
      : allDayAppointments;

    const completedList = appointmentsList.filter((apt) => apt.status === "COMPLETED");
    const filteredGross = completedList.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);

    // Métricas específicas para a visão atual
    let currentCommission = 0;
    let currentHouseShare = 0;

    if (effectiveBarberFilter) {
      const currentBarberData = breakdown.find((b) => b.id === effectiveBarberFilter);
      if (currentBarberData) {
        currentCommission = currentBarberData.commission;
        currentHouseShare = currentBarberData.houseShare;
      }
    } else {
      // Visão Geral do Dono: Comissão é o total a pagar aos funcionários, lucro é o total da casa
      currentCommission = totalEmployeeCommissions;
      currentHouseShare = houseNetProfit;
    }

    return NextResponse.json({
      isClient: false,
      userRole,
      currentBarber: getBarberById(userBarberId) || BARBERS[0],
      activeFilter: effectiveBarberFilter || "all",
      
      // Faturamento e Comissões
      revenue: effectiveBarberFilter ? filteredGross : totalGrossShop, // Faturamento bruto exibido
      totalGrossShop,
      houseNetProfit, // Lucro total retido pela barbearia (Dono 100% + 55% dos funcionários)
      totalEmployeeCommissions, // Total de comissões (45%) devidas aos funcionários
      myCommission: currentCommission, // Comissão líquida do barbeiro (45%) ou total de comissões para o dono
      houseShare: currentHouseShare, // Parcela da casa (55%)
      
      // Contadores
      todayCount: appointmentsList.length,
      completedCount: completedList.length,
      clientsCount: appointmentsList.length,
      appointments: appointmentsList,
      barberBreakdown: breakdown,
      barbersList: BARBERS,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 });
  }
}

// Atualizar status do agendamento (Confirmar / Concluir / Cancelar)
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, updated });
    } catch (dbErr) {
      // Mock update
      return NextResponse.json({ success: true, mockId: id, status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
