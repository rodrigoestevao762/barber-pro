import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, LogOut, Scissors } from "lucide-react";
import CancelButton from "./CancelButton";

export default async function ClientePortal() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
           <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Voltar ao Site</Link>
           <Link href="/api/auth/signout" className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm uppercase tracking-widest font-bold"><LogOut className="w-4 h-4"/> Sair</Link>
        </div>

        <h1 className="text-4xl font-serif mb-2 uppercase">Olá, {user.name}</h1>
        <p className="text-gray-400 font-light mb-12">Aqui está o histórico das suas experiências conosco.</p>

        <h2 className="text-[#C88E70] text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Seus Agendamentos</h2>
        
        <div className="grid gap-4">
          {user.appointments.length === 0 && (
            <div className="p-8 text-center border border-white/10 rounded-2xl bg-white/5">
              <p className="text-gray-400">Você ainda não tem nenhum agendamento.</p>
              <Link href="/" className="text-[#C88E70] uppercase text-xs font-bold tracking-widest mt-4 inline-block hover:text-white">Agendar Agora</Link>
            </div>
          )}
          {user.appointments.map(apt => {
            const isFuture = new Date(apt.date) > new Date();
            const isCancelable = (apt.status === "PENDING" || apt.status === "CONFIRMED") && isFuture;

            return (
              <div key={apt.id} className="p-6 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                   <div className="bg-black/30 p-4 rounded-full text-[#C88E70]"><Scissors className="w-6 h-6"/></div>
                   <div>
                     <h3 className="text-xl font-serif">{apt.service.name}</h3>
                     <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                       <Calendar className="w-3 h-3" /> 
                       {new Date(apt.date).toLocaleDateString('pt-BR')} às {new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${apt.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : apt.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                     {apt.status === 'CONFIRMED' ? 'Confirmado' : apt.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                   </span>
                   {isCancelable && (
                     <CancelButton id={apt.id} serviceName={apt.service.name} dateStr={`${new Date(apt.date).toLocaleDateString('pt-BR')} às ${new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`} />
                   )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

