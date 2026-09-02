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
          { name: "Corte Clássico", description: "Corte na tesoura ou máquina com acabamento.", price: 80, duration: 45 },
          { name: "Barba Terapia", description: "Toalha quente, massagem facial e óleos.", price: 60, duration: 30 },
          { name: "Combo Premium", description: "A experiência completa de Corte e Barba.", price: 120, duration: 75 }
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
