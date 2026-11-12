import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAllStoredUsers } from "@/lib/users-store";
import { getAllStoredAppointments } from "@/lib/appointments-store";
import ClientesClientView, { ClientCrmItem } from "./ClientesClientView";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || (role !== "ADMIN" && role !== "BARBER")) {
    redirect("/login");
  }

  const clientMap = new Map<string, ClientCrmItem>();

  // 1. Busca clientes reais do PostgreSQL quando acessível
  try {
    const dbClients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        appointments: {
          where: { status: { not: "CANCELLED" } },
          include: { service: true, barber: true },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    for (const u of dbClients) {
      const key = (u.email || u.phone || u.id).toLowerCase();
      const latestApt = u.appointments[0];
      clientMap.set(key, {
        id: u.id,
        name: u.name || "Cliente VIP",
        email: u.email || null,
        phone: u.phone || null,
        createdAt: u.createdAt.toISOString(),
        totalAppointments: u.appointments.length,
        completedAppointments: u.appointments.filter((a) => a.status === "COMPLETED").length,
        lastServiceName: latestApt?.service?.name || null,
        lastServiceDate: latestApt ? latestApt.date.toISOString() : null,
        lastBarberName: latestApt?.barber?.name || null,
      });
    }
  } catch (err) {
    console.warn("[CRM Clientes] PostgreSQL indisponível, usando repositório resiliente:", err);
  }

  // 2. Mescla clientes e atendimentos do store resiliente (sem duplicar)
  const storedUsers = getAllStoredUsers().filter((u) => u.role === "CLIENT");
  const storedApts = getAllStoredAppointments().filter((a) => a.status !== "CANCELLED");

  for (const su of storedUsers) {
    const key = (su.email || su.phone || su.id).toLowerCase();
    const userApts = storedApts
      .filter(
        (a) =>
          a.user?.id === su.id ||
          (su.email && a.user?.email?.toLowerCase() === su.email.toLowerCase()) ||
          (su.phone &&
            a.user?.phone?.replace(/\D/g, "") === su.phone.replace(/\D/g, ""))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const existing = clientMap.get(key);
    const latestStored = userApts[0];

    if (!existing) {
      clientMap.set(key, {
        id: su.id,
        name: su.name || "Cliente VIP",
        email: su.email || null,
        phone: su.phone || null,
        createdAt: su.createdAt,
        totalAppointments: userApts.length,
        completedAppointments: userApts.filter((a) => a.status === "COMPLETED").length,
        lastServiceName: latestStored?.service?.name || null,
        lastServiceDate: latestStored ? latestStored.date : null,
        lastBarberName: latestStored?.barber?.name || null,
      });
    } else if (userApts.length > existing.totalAppointments) {
      existing.totalAppointments = userApts.length;
      existing.completedAppointments = Math.max(
        existing.completedAppointments,
        userApts.filter((a) => a.status === "COMPLETED").length
      );
      if (latestStored) {
        existing.lastServiceName = latestStored.service?.name || existing.lastServiceName;
        existing.lastServiceDate = latestStored.date || existing.lastServiceDate;
        existing.lastBarberName = latestStored.barber?.name || existing.lastBarberName;
      }
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => {
    const aTime = a.lastServiceDate
      ? new Date(a.lastServiceDate).getTime()
      : new Date(a.createdAt).getTime();
    const bTime = b.lastServiceDate
      ? new Date(b.lastServiceDate).getTime()
      : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return <ClientesClientView clients={clients} />;
}
