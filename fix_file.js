const fs = require("fs");
const content = `"use client";

import { motion } from "framer-motion";
import { Scissors, Calendar, Clock, RotateCcw, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import BookingModal from "@/components/BookingModal";
import { useSession, signOut } from "next-auth/react";

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pega o nome real do usuário logado
  const clientName = session?.user?.name || "Cliente";
  
  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.isClient && data.appointments) {
          // Ordena do mais recente pro mais antigo
          const sorted = data.appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setAppointments(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const lastApt = appointments.find(apt => new Date(apt.date) < new Date()) || null;

  const handleRebook = () => {
    if (lastApt) setSelectedServiceId(lastApt.serviceId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#02050A] text-white">
      <header className="border-b border-white/5 bg-[#050B14] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C88E70]/20 flex items-center justify-center border border-[#C88E70]/50">
              <User className="w-6 h-6 text-[#C88E70]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bem-vindo de volta,</p>
              <h1 className="text-2xl font-serif">{clientName}</h1>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {loading ? (
           <div className="animate-pulse text-[#C88E70] text-center p-12">Carregando seus dados...</div>
        ) : (
          <>
            {lastApt && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-[#C88E70]/20 to-transparent border border-[#C88E70]/40 rounded-3xl p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="relative z-10 space-y-2">
                  <h2 className="text-3xl font-serif text-white">Hora de renovar o visual?</h2>
                  <p className="text-gray-300 max-w-md text-sm leading-relaxed">
                    Seu último {lastApt.service?.name?.toLowerCase() || "corte"} foi dia {new Date(lastApt.date).toLocaleDateString("pt-BR")}. Que tal garantir seu horário agora mesmo?
                  </p>
                </div>
                <button 
                  onClick={handleRebook}
                  className="relative z-10 w-full md:w-auto bg-[#C88E70] text-[#050B14] hover:bg-white transition-colors px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 whitespace-nowrap shadow-[0_0_30px_rgba(200,142,112,0.3)] hover:scale-105 transform duration-300"
                >
                  <RotateCcw className="w-4 h-4" /> Repetir Último Corte
                </button>
              </motion.div>
            )}

            {!lastApt && (
              <div className="bg-[#C88E70]/10 border border-[#C88E70]/30 rounded-3xl p-8 text-center space-y-4">
                 <h2 className="text-2xl font-serif text-[#C88E70]">Sua primeira vez aqui?</h2>
                 <p className="text-gray-400 text-sm">Ficamos muito felizes em ter você como cliente. Agende seu primeiro horário abaixo!</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => { setSelectedServiceId(undefined); setIsModalOpen(true); }}>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Novo Agendamento</p>
                  <p className="text-lg font-serif">Ver agenda livre &rarr;</p>
                </div>
              </div>
            </div>

            {appointments.length > 0 && (
              <div>
                <h3 className="text-xl font-serif text-white mb-6 mt-12 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C88E70]" /> Seu Histórico
                </h3>
                <div className="space-y-4">
                  {appointments.map((apt: any) => (
                    <div key={apt.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex gap-4 items-center">
                        <div className="hidden md:flex w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                          <Scissors className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{apt.service?.name}</h4>
                          <p className="text-xs text-gray-500">
                            {apt.barber ? `Com ${apt.barber.name}` : `Status: ${apt.status}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">
                          {new Date(apt.date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-[#C88E70] mt-1">
                          {new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialServiceId={selectedServiceId}
      />
    </div>
  );
}`;
fs.writeFileSync("src/app/painel-cliente/ClientDashboard.tsx", content, "utf8");

