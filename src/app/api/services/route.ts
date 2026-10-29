import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OFFICIAL_SERVICES } from '@/lib/services';

export async function GET() {
  try {
    try {
      const dbServices = await prisma.service.findMany({
        orderBy: { price: 'asc' }
      });

      if (dbServices && dbServices.length > 0) {
        return NextResponse.json(dbServices);
      }
    } catch (dbErr) {
      console.warn("DB offline, retornando serviços oficiais padrão");
    }

    // Retorna todos os serviços e combos oficiais
    return NextResponse.json(OFFICIAL_SERVICES);
  } catch (error) {
    return NextResponse.json(OFFICIAL_SERVICES);
  }
}
