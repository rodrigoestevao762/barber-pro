"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

type Service = { id: string; name: string; price: number; duration: number };

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch('/api/services').then(res => res.json()).then(data => setServices(data));
      setStep(1);
      setSelectedService(null);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableTimes([]);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Busca horários disponíveis quando a data muda
  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/appointments/available?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => setAvailableTimes(data.availableTimes || []));
    }
  }, [selectedDate]);

  const handleBooking = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: selectedService?.id,
          date: `${selectedDate}T${selectedTime}:00.000Z`,
          clientName,
          clientPhone,
          clientPassword
        })
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#050B14]/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white/5 border border-[#C88E70]/30 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#050B14]/50">
            <h2 className="text-2xl font-serif text-white tracking-wide">
              {isSuccess ? "Agendamento Confirmado" : "Agendar Experiência"}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 min-h-[400px] flex flex-col">
            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
                </motion.div>
                <h3 className="text-3xl font-serif text-white mb-2">Tudo Certo!</h3>
                <p className="text-gray-400 font-light max-w-md">Seu horário para <strong>{selectedService?.name}</strong> foi reservado. Você receberá um e-mail com os detalhes.</p>
                <div className="mt-8 flex gap-4">
                  <a href={`https://wa.me/5511999999999?text=Olá! Acabei de agendar um ${selectedService?.name} para o dia ${selectedDate} às ${selectedTime}. Meu nome é ${clientName}.`} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-[#128C7E] transition-colors flex items-center gap-2">
                    Confirmar no WhatsApp
                  </a>
                  <button onClick={onClose} className="bg-white/10 text-white px-8 py-3 uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Steps Content */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                    <p className="text-[#C88E70] text-xs uppercase tracking-widest mb-6">Passo 1: Selecione o Serviço</p>
                    <div className="grid gap-4">
                      {services.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedService(s)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedService?.id === s.id ? 'border-[#C88E70] bg-[#C88E70]/10' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
                        >
                          <div>
                            <h4 className="text-lg font-serif text-white">{s.name}</h4>
                            <p className="text-sm text-gray-400">{s.duration} min</p>
                          </div>
                          <span className="text-[#C88E70] font-medium">R$ {s.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                    <p className="text-[#C88E70] text-xs uppercase tracking-widest mb-6">Passo 2: Data e Hora</p>
                    
                    {errorMsg && <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 py-2 rounded">{errorMsg}</p>}
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <label className="block text-gray-400 text-xs uppercase mb-2">Seu Nome</label>
                        <input 
                          type="text" placeholder="Como podemos te chamar?"
                          value={clientName} onChange={(e) => setClientName(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#C88E70] focus:outline-none mb-4"
                        />
                        <label className="block text-gray-400 text-xs uppercase mb-2">Seu WhatsApp</label>
                        <input 
                          type="text" placeholder="(11) 99999-9999"
                          value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#C88E70] focus:outline-none mb-4"
                        />
                        <label className="block text-gray-400 text-xs uppercase mb-2">Crie/Digite sua Senha</label>
                        <input 
                          type="password" placeholder="Sua senha segura"
                          value={clientPassword} onChange={(e) => setClientPassword(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#C88E70] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs uppercase mb-2">Data</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input 
                            type="date" 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#C88E70] focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-xs uppercase mb-2">Horário Disponível</label>
                        <div className="grid grid-cols-2 gap-3">
                          {availableTimes.length === 0 && selectedDate && <p className="text-sm text-gray-500 col-span-2">Nenhum horário livre.</p>}
                          {availableTimes.map(time => (
                            <button 
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-lg border text-sm transition-colors ${selectedTime === time ? 'border-[#C88E70] bg-[#C88E70]/10 text-[#C88E70]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Footer Controls */}
                <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center">
                  <button 
                    onClick={() => step > 1 ? setStep(step - 1) : onClose()} 
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {step > 1 ? "Voltar" : "Cancelar"}
                  </button>
                  
                  {step === 1 ? (
                    <button 
                      disabled={!selectedService}
                      onClick={() => setStep(2)}
                      className="bg-[#C88E70] text-[#050B14] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      disabled={!selectedDate || !selectedTime || isLoading}
                      onClick={handleBooking}
                      className="bg-[#C88E70] text-[#050B14] px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? "Processando..." : "Confirmar Agendamento"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

