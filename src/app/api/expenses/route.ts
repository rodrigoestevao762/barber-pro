import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { description, amount } = await req.json();
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount)
      }
    });
    return NextResponse.json({ success: true, expense });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 });
  }
}

