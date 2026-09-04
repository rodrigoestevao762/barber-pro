import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CashClosing" (
          "id" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "totalRevenue" DOUBLE PRECISION NOT NULL,
          "totalExpenses" DOUBLE PRECISION,
          "closedBy" TEXT,
          "notes" TEXT,
          "barberRevenues" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "CashClosing_pkey" PRIMARY KEY ("id")
      );
    `);
    
    return NextResponse.json({ message: "Tabela CashClosing criada com sucesso!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
