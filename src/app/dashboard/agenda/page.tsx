export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { Calendar, Clock, CheckCircle, User } from 'lucide-react';

export default async function AgendaPage() {
  const appointments = await prisma.appointment.findMany({
    include: { service: true, user: true },
    orderBy: { date: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <h2 className="text-3xl font-serif text-white mb-8 flex items-center gap-3">
          <Calendar className="text-[#C88E70]" /> Agenda Completa
        </h2>
        
        <div className="grid gap-4">
          {appointments.length === 0 && <p className="text-gray-500 italic">Nenhum agendamento no sistema.</p>}
          {appointments.map(apt => (
            <div key={apt.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:border-[#C88E70]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{apt.user?.name || "Cliente"}</h4>
                  <p className="text-sm text-gray-400">{apt.user?.phone || "Sem telefone"} • {apt.service?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-serif text-xl">{apt.date.toLocaleDateString('pt-BR')} às {apt.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                  <p className="text-[#C88E70] text-xs uppercase tracking-widest mt-1">{apt.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

