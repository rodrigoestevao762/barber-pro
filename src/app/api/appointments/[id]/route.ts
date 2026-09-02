import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { status } = await req.json();

    // Verifica se o agendamento pertence ao usuário ou se é admin
    const apt = await prisma.appointment.findUnique({ where: { id: params.id } });
    if (!apt) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    if (apt.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
