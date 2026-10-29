import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userBarberId = (session?.user as any)?.barberId;

    if (!session || (userRole !== 'ADMIN' && userRole !== 'BARBER')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          ...(userRole === 'BARBER' && userBarberId ? { barberId: userBarberId } : {}),
        },
        include: { service: true, user: true, barber: true },
        orderBy: { date: 'asc' }
      });

      const appointmentsWithDuration = appointments.map(apt => {
         if (apt.status === 'COMPLETED') {
            const dur = Math.floor((apt.updatedAt.getTime() - apt.date.getTime()) / 60000);
            return { ...apt, durationSpent: dur > 0 ? dur : 1 };
         }
         return apt;
      });

      return NextResponse.json(appointmentsWithDuration);
    } catch (dbErr) {
      // Fallback
      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}
