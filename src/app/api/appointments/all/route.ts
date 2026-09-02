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

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}
