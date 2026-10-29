import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Create services only if none exist
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

    // Cria conta Admin (Gestor Princípal)
    const adminPassword = await bcrypt.hash("@Familia435", 10);
    await prisma.user.upsert({
      where: { phone: "21997073357" },
      update: {
        password: adminPassword,
        role: "ADMIN"
      },
      create: {
        name: "Gestor",
        phone: "21997073357",
        password: adminPassword,
        role: "ADMIN"
      }
    });

    return NextResponse.json({ success: true, message: "Banco Semeado com Sucesso!" });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: "Erro ao semear o banco" }, { status: 500 });
  }
}
