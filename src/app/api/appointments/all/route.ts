import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nǜo autorizado' }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      include: { service: true, user: true },
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
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}

