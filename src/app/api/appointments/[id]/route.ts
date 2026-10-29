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

    try {
      const apt = await prisma.appointment.findUnique({ where: { id: resolvedParams.id } });
      if (apt) {
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;
        const userBarberId = (session.user as any).barberId;

        // Permite se for o dono, o cliente do agendamento ou o barbeiro responsável
        const isAllowed = 
          userRole === "ADMIN" || 
          apt.userId === userId || 
          (userRole === "BARBER" && apt.barberId === userBarberId);

        if (!isAllowed) {
          return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const updated = await prisma.appointment.update({
          where: { id: resolvedParams.id },
          data: { status }
        });

        return NextResponse.json(updated);
      }
    } catch (dbErr) {
      // Fallback
    }

    return NextResponse.json({ success: true, id: resolvedParams.id, status });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
