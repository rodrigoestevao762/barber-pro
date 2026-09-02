"use client";

import { Calendar, Clock, CheckCircle, User, Clock3 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgenda = async () => {
    try {
      const res = await fetch('/api/appointments/all');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchAgenda();
    } catch(e) {}
  };

  if (loading) return <div className="animate-pulse text-[#C88E70]">Carregando agenda...</div>;

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
              
              <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-serif text-xl">{new Date(apt.date).toLocaleDateString('pt-BR')} às {new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                      apt.status === 'CONFIRMED' ? 'border-[#C88E70]/30 text-[#C88E70]' : 
                      apt.status === 'COMPLETED' ? 'border-green-500/30 text-green-500' : 
                      apt.status === 'CANCELLED' ? 'border-red-500/30 text-red-500' : 'border-yellow-500/30 text-yellow-500'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status === 'COMPLETED' && apt.durationSpent && (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 text-gray-400 flex items-center gap-1">
                         <Clock3 className="w-3 h-3" /> {apt.durationSpent} min
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {apt.status === 'PENDING' && (
                    <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="text-[10px] uppercase tracking-widest px-3 py-2 rounded-md bg-white/10 hover:bg-[#C88E70] hover:text-black transition-colors">
                      Confirmar
                    </button>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="text-[10px] uppercase tracking-widest px-3 py-2 rounded-md bg-white/10 hover:bg-green-500 hover:text-white transition-colors">
                      Finalizar
                    </button>
                  )}
                  {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                    <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="text-[10px] uppercase tracking-widest px-3 py-2 rounded-md bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

