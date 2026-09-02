import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await prisma.service.deleteMany(); // Limpa serviços anteriores
    // Cria serviços básicos
    await prisma.service.createMany({
      data: [
        { name: "Corte Clássico", description: "Corte na tesoura ou máquina com acabamento.", price: 80, duration: 45 },
        { name: "Barba Terapia", description: "Toalha quente, massagem facial e óleos.", price: 60, duration: 30 },
        { name: "Combo Premium", description: "A experiência completa de Corte e Barba.", price: 120, duration: 75 }
      ]
    });

    // Cria conta Admin (O Barbeiro)
    const adminPassword = await bcrypt.hash("123456", 10);
    await prisma.user.upsert({
      where: { email: "admin@barber.com" },
      update: {},
      create: {
        name: "Thiago Admin",
        email: "admin@barber.com",
        password: adminPassword,
        role: "ADMIN"
      }
    });

    // Cria conta Cliente
    const clientPassword = await bcrypt.hash("123456", 10);
    await prisma.user.upsert({
      where: { email: "cliente@teste.com" },
      update: {},
      create: {
        name: "Cliente VIP",
        email: "cliente@teste.com",
        password: clientPassword,
        role: "CLIENT"
      }
    });

    return NextResponse.json({ success: true, message: "Banco Semeado com Sucesso! Dados Iniciais Criados." });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: "Erro ao semear o banco" }, { status: 500 });
  }
}
