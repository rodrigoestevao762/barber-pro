import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { status } = await req.json();

    // Verifica se o agendamento pertence ao usuário ou se é admin
    const apt = await prisma.appointment.findUnique({ where: { id: resolvedParams.id } });
    if (!apt) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    if (apt.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      const durationMinutes = Math.floor((new Date().getTime() - apt.date.getTime()) / 60000);
      updateData.durationSpent = durationMinutes > 0 ? durationMinutes : 1; // Mínimo de 1 min
    }

    const updated = await prisma.appointment.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

