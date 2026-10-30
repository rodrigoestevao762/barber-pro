import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Cria serviços oficiais apenas se nenhum existir
    const count = await prisma.service.count();
    if (count === 0) {
      await prisma.service.createMany({
        data: [
          { name: "Corte", description: "Corte na tesoura ou máquina com acabamento impecável.", price: 35, duration: 30 },
          { name: "Barba", description: "Alinhamento com navalha, toalha e produtos de qualidade.", price: 25, duration: 25 },
          { name: "Cabeça raspada navalha", description: "Raspagem completa na navalha com acabamento suave.", price: 25, duration: 30 },
          { name: "Pezinho", description: "Acabamento e contorno no detalhe.", price: 20, duration: 15 },
          { name: "Barba raspada na máquina", description: "Aparação e alinhamento na máquina.", price: 20, duration: 20 },
          { name: "Sobrancelha", description: "Design e alinhamento de sobrancelha.", price: 15, duration: 15 },
          { name: "Corte + Barba", description: "Combo completo: corte e barba alinhada.", price: 55, duration: 50 },
          { name: "Pezinho + Barba", description: "Acabamento no pezinho e barba feita.", price: 40, duration: 35 },
          { name: "Corte + Sobrancelha", description: "Corte no estilo + design de sobrancelha.", price: 45, duration: 40 }
        ]
      });
    }

    // Remove qualquer conta do gestor anterior de teste (21997073357)
    try {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { phone: { contains: "21997073357" } },
            { email: { contains: "21997073357" } },
            { name: { contains: "Gestor" } },
          ],
        },
      });
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Banco Sincronizado e Serviços Oficiais Configurados!" });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: "Erro ao semear o banco" }, { status: 500 });
  }
}
