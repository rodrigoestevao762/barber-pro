import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BARBERS, getBarberById } from '@/lib/barbers';
import { 
  getAppointmentsForDate, 
  getAllStoredAppointments, 
  updateStoredAppointmentStatus, 
  getLocalDateString 
} from '@/lib/appointments-store';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "ADMIN";
    const userBarberId = (session?.user as any)?.barberId;
    const userId = (session?.user as any)?.id;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || getLocalDateString();
    const filterBarberId = searchParams.get("barberId") || "all";

    // 1. FLUXO DO CLIENTE
    if (userRole === "CLIENT") {
      const userEmail = session?.user?.email?.trim().toLowerCase();
      const userPhone = (session?.user as any)?.phone?.replace(/\D/g, "");

      try {
        const clientUser: any = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(userEmail ? [{ email: { equals: userEmail, mode: "insensitive" as const } }] : []),
              ...(userPhone ? [
                { phone: userPhone },
                { phone: userPhone.startsWith("55") ? userPhone.slice(2) : `55${userPhone}` },
              ] : []),
            ],
          },
          include: {
            appointments: {
              include: { service: true, barber: true },
              orderBy: { date: "desc" },
            },
          },
        });

        // Agendamentos gravados no banco
        const dbApts: any[] = clientUser?.appointments || [];

        // Agendamentos também unificados da memória recente
        const memApts: any[] = getAllStoredAppointments().filter(
          (a: any) =>
            (clientUser && a.user?.id === clientUser.id) ||
            (userEmail && a.user?.email?.toLowerCase() === userEmail) ||
            (userPhone && a.user?.phone?.replace(/\D/g, "").includes(userPhone))
        );

        const map = new Map<string, any>();
        dbApts.forEach((a: any) => map.set(a.id, a));
        memApts.forEach((a: any) => {
          if (!map.has(a.id)) map.set(a.id, a);
        });

        const appointments = Array.from(map.values()).sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const completedCuts = appointments.filter((a) => a.status === "COMPLETED").length;

        const effectiveClient = {
          id: clientUser?.id || userId || "client-id",
          name: clientUser?.name || session?.user?.name || "Cliente VIP",
          email: clientUser?.email || session?.user?.email || "",
          phone: clientUser?.phone || (session?.user as any)?.phone || "",
        };

        return NextResponse.json({
          isClient: true,
          client: effectiveClient,
          appointments,
          loyaltyCard: {
            currentCuts: completedCuts % 10,
            targetCuts: 10,
            freeCutsWon: Math.floor(completedCuts / 10),
          },
        });
      } catch (dbErr) {
        // Fallback dinâmico em memória para o cliente autenticado (sem dados fixos)
        const allApts = getAllStoredAppointments();
        const clientApts = allApts.filter(
          (a) =>
            (userEmail && a.user?.email?.toLowerCase() === userEmail) ||
            (userPhone && a.user?.phone?.replace(/\D/g, "").includes(userPhone))
        );
        const completedCuts = clientApts.filter((a) => a.status === "COMPLETED").length;

        return NextResponse.json({
          isClient: true,
          client: {
            id: userId || "client-fallback",
            name: session?.user?.name || "Cliente VIP",
            email: session?.user?.email || "",
            phone: (session?.user as any)?.phone || "",
          },
          appointments: clientApts,
          loyaltyCard: {
            currentCuts: completedCuts % 10,
            targetCuts: 10,
            freeCutsWon: Math.floor(completedCuts / 10),
          },
        });
      }
    }

    // 2. FLUXO DOS BARBEIROS / DONO (ADMIN)
    let effectiveBarberFilter: string | null = null;

    let normalizedUserBarberId = userBarberId;
    if (normalizedUserBarberId === "barbeiro-lucas") normalizedUserBarberId = "barbeiro-nando";
    if (normalizedUserBarberId === "barbeiro-felipe") normalizedUserBarberId = "barbeiro-saul";

    let normalizedFilterBarberId = filterBarberId;
    if (normalizedFilterBarberId === "barbeiro-lucas") normalizedFilterBarberId = "barbeiro-nando";
    if (normalizedFilterBarberId === "barbeiro-felipe") normalizedFilterBarberId = "barbeiro-saul";

    if (userRole === "BARBER") {
      // Barbeiro funcionário: isolamento estrito, apenas vê a sua produção e seus agendamentos
      effectiveBarberFilter = normalizedUserBarberId || "barbeiro-nando";
    } else if (userRole === "ADMIN") {
      // Dono/ADM: pode ver "all" ou filtrar por um barbeiro específico
      effectiveBarberFilter = normalizedFilterBarberId !== "all" ? normalizedFilterBarberId : null;
    }

    const startOfDay = new Date(`${dateParam}T00:00:00Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59Z`);

    // Busca agendamentos para a data selecionada
    let allDayAppointments: any[] = [];
    let upcomingAppointments: any[] = [];

    try {
      const dbAppointments = await prisma.appointment.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { service: true, user: true, barber: true },
        orderBy: { date: "asc" },
      });

      const memAppointments = getAppointmentsForDate(dateParam, null);
      
      // Unifica agendamentos do banco e de memória sem duplicatas
      const map = new Map<string, any>();
      (dbAppointments || []).forEach((a) => map.set(a.id, a));
      (memAppointments || []).forEach((a) => {
        if (!map.has(a.id)) map.set(a.id, a);
      });
      allDayAppointments = Array.from(map.values());

      // Próximos agendamentos futuros para a barra de avisos
      upcomingAppointments = await prisma.appointment.findMany({
        where: {
          date: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
          ...(effectiveBarberFilter ? { barberId: effectiveBarberFilter } : {}),
        },
        include: { service: true, user: true, barber: true },
        orderBy: { date: "asc" },
        take: 10,
      });
    } catch (dbErr) {
      allDayAppointments = getAppointmentsForDate(dateParam, null);
    }

    // Resumo de produção e comissões por barbeiro para a data (45% para funcionários, 100% para o Dono)
    const breakdown = BARBERS.map((barber) => {
      const bApts = allDayAppointments.filter((apt) => apt.barberId === barber.id);
      const bCompleted = bApts.filter((apt) => apt.status === "COMPLETED");
      const bRevenue = bCompleted.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);
      const isOwner = barber.role === "ADMIN";
      
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

    // Métricas Globais da Barbearia para a Data
    const totalGrossShop = breakdown.reduce((acc, b) => acc + b.revenue, 0);
    const employeeBarbers = breakdown.filter((b) => b.role === "BARBER");
    const totalEmployeeCommissions = employeeBarbers.reduce((acc, b) => acc + b.commission, 0);
    const ownerBarber = breakdown.find((b) => b.role === "ADMIN");
    const ownerPersonalRevenue = ownerBarber?.revenue || 0;
    const totalHouseEmployeeShare = employeeBarbers.reduce((acc, b) => acc + b.houseShare, 0);
    const houseNetProfit = ownerPersonalRevenue + totalHouseEmployeeShare;

    // Lista filtrada de agendamentos conforme o barbeiro selecionado
    const appointmentsList = effectiveBarberFilter
      ? allDayAppointments.filter((apt) => apt.barberId === effectiveBarberFilter)
      : allDayAppointments;

    const completedList = appointmentsList.filter((apt) => apt.status === "COMPLETED");
    const filteredGross = completedList.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);

    let currentCommission = 0;
    let currentHouseShare = 0;

    if (effectiveBarberFilter) {
      const currentBarberData = breakdown.find((b) => b.id === effectiveBarberFilter);
      if (currentBarberData) {
        currentCommission = currentBarberData.commission;
        currentHouseShare = currentBarberData.houseShare;
      }
    } else {
      currentCommission = totalEmployeeCommissions;
      currentHouseShare = houseNetProfit;
    }

    return NextResponse.json({
      isClient: false,
      userRole,
      currentBarber: getBarberById(userBarberId) || BARBERS[0],
      activeFilter: effectiveBarberFilter || "all",
      selectedDate: dateParam,
      
      // Faturamento e Comissões para a Data
      revenue: effectiveBarberFilter ? filteredGross : totalGrossShop,
      totalGrossShop,
      houseNetProfit,
      totalEmployeeCommissions,
      myCommission: currentCommission,
      houseShare: currentHouseShare,
      
      // Contadores
      todayCount: appointmentsList.length,
      completedCount: completedList.length,
      clientsCount: appointmentsList.length,
      appointments: appointmentsList,
      upcomingAppointments,
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
    
    // Atualiza no store em memória
    updateStoredAppointmentStatus(id, status);

    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, updated });
    } catch (dbErr) {
      return NextResponse.json({ success: true, id, status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
