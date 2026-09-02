"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, User, Scissors, Clock, ChevronRight, Star, CheckCircle, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState({ revenue: 0, todayCount: 0, clientsCount: 0, appointments: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch('/api/dashboard', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchDashboard(); // Recarrega os dados para atualizar o faturamento
  };

  const createWalkIn = async () => {
    // Cria um agendamento rápido (Cliente Balcão)
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: "1", date: new Date().toISOString(), isWalkIn: true })
    });
    fetchDashboard();
  };

  if (loading) return <div className="text-white p-10 font-serif">Carregando Centro de Comando...</div>;

  const nextApt = data.appointments.find((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Bento Grid de Métricas */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88E70]/10 blur-[50px] group-hover:bg-[#C88E70]/20 transition-colors" />
            <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-4 flex justify-between">
              Faturamento (Concluídos)
              <button onClick={createWalkIn} className="text-[#C88E70] border border-[#C88E70]/50 px-2 py-1 rounded hover:bg-[#C88E70] hover:text-black transition-colors">+ Cliente Balcão</button>
            </p>
            <h2 className="text-5xl font-serif text-white mb-4">
              R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 w-fit px-3 py-1 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3 h-3" /> Cálculo Real Automático
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center justify-between group hover:border-[#C88E70]/30 transition-colors cursor-pointer">
              <div>
                <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-1">Agendamentos Hoje</p>
                <p className="text-3xl font-serif text-white">{data.todayCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#C88E70]/10 flex items-center justify-center text-[#C88E70] group-hover:scale-110 transition-transform">
                <Scissors className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer">
              <div>
                <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-1">Total de Clientes (Base)</p>
                <p className="text-3xl font-serif text-white">{data.clientsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* PRÓXIMO CLIENTE */}
        {nextApt && (
          <div className="bg-white/5 border border-[#C88E70]/30 rounded-3xl p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C88E70]/10 to-transparent" />
            <div className="bg-[#050B14] rounded-[22px] p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#C88E70]">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-[#C88E70] text-xs tracking-[0.2em] uppercase font-semibold mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C88E70] animate-pulse"></span> Próximo Cliente
                  </p>
                  <h3 className="text-3xl font-serif text-white mb-1">{nextApt.user?.name || "Cliente Balcão"}</h3>
                  <p className="text-gray-400 text-sm font-light">{nextApt.service?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Horário</p>
                  <p className="text-2xl font-serif text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#C88E70]" /> 
                    {new Date(nextApt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <button 
                  onClick={() => updateStatus(nextApt.id, 'COMPLETED')}
                  className="px-6 py-4 rounded-xl bg-[#C88E70] text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Concluir Serviço
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agenda do Dia */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col h-full relative">
        <h2 className="text-2xl font-serif text-white mb-8">Agenda Hoje</h2>
        <div className="flex-1 space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[1px] before:bg-white/10">
          
          {data.appointments.length === 0 && (
             <p className="text-gray-500 text-sm italic pl-12">Nenhum agendamento para hoje.</p>
          )}

          {data.appointments.map((apt: any, i: number) => (
            <div key={i} className="flex gap-6 group">
              <div className={`w-10 h-10 rounded-full border-4 border-[#050B14] flex items-center justify-center relative z-10 transition-colors ${
                apt.status === 'CONFIRMED' ? 'bg-[#C88E70]' : 
                apt.status === 'COMPLETED' ? 'bg-white/20' : 'bg-yellow-500'
              }`}>
                {apt.status === 'CONFIRMED' && <div className="w-2 h-2 rounded-full bg-[#050B14]" />}
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl p-4 transition-all -mt-2">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-medium">{apt.user?.name || "Cliente"}</h4>
                  <span className="text-[#C88E70] font-serif">{new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}</span>
                </div>
                <p className="text-gray-400 text-sm font-light mb-3">{apt.service?.name}</p>
                
                <div className="flex gap-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                    apt.status === 'CONFIRMED' ? 'border-[#C88E70]/30 text-[#C88E70]' : 
                    apt.status === 'COMPLETED' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'
                  }`}>
                    {apt.status}
                  </span>
                  
                  {apt.status === 'PENDING' && (
                    <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-white/10 hover:bg-[#C88E70] hover:text-black transition-colors">
                      Confirmar
                    </button>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-white/10 hover:bg-green-500 hover:text-white transition-colors">
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
