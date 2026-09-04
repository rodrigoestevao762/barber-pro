"use client";

import { motion } from "framer-motion";
import { Scissors, Calendar, Clock, RotateCcw, MapPin, User, LogOut } from "lucide-react";
import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import Link from "next/link";

export default function ClientDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  // MOCK DATA PARA DEMONSTRAÇÃO DA IDEIA 1
  const clientName = "Rodrigo";
  
  const lastAppointment = {
    date: "15/08/2026",
    serviceName: "Corte Cabelo e Barba",
    serviceId: "cm0391zls0000a6g77iuv9t0a", // Assume que existe na API ou ele pega dinamicamente depois
    barber: "Maria",
    price: 80,
  };

  const handleRebook = () => {
    setSelectedServiceId(lastAppointment.serviceId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#02050A] text-white">
      {/* HEADER DO CLIENTE */}
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
          <Link href="/" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <LogOut className="w-4 h-4" /> Sair
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* BANNER DE RETORNO / REBOOK */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-[#C88E70]/20 to-transparent border border-[#C88E70]/40 rounded-3xl p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif text-white">Hora de renovar o visual?</h2>
            <p className="text-gray-300 max-w-md text-sm leading-relaxed">
              Faz quase um mês desde o seu último {lastAppointment.serviceName.toLowerCase()} com {lastAppointment.barber}. Que tal garantir seu horário agora mesmo?
            </p>
          </div>
          <button 
            onClick={handleRebook}
            className="relative z-10 w-full md:w-auto bg-[#C88E70] text-[#050B14] hover:bg-white transition-colors px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 whitespace-nowrap shadow-[0_0_30px_rgba(200,142,112,0.3)] hover:scale-105 transform duration-300"
          >
            <RotateCcw className="w-4 h-4" /> Repetir Último Corte
          </button>
        </motion.div>

        {/* STATUS DO CLIENTE */}
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

        {/* HISTÓRICO */}
        <div>
          <h3 className="text-xl font-serif text-white mb-6 mt-12 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C88E70]" /> Seu Histórico
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center opacity-70">
                <div className="flex gap-4 items-center">
                  <div className="hidden md:flex w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                    <Scissors className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{lastAppointment.serviceName}</h4>
                    <p className="text-xs text-gray-500">Com {lastAppointment.barber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{item === 1 ? lastAppointment.date : `10/0${8-item}/2026`}</p>
                  <p className="text-xs text-gray-500 font-serif">R$ {lastAppointment.price},00</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialServiceId={selectedServiceId}
      />
    </div>
  );
}



