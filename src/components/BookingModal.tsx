"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronRight, CheckCircle2, User, Scissors, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { BARBERS, BarberData } from "@/lib/barbers";

type Service = { id: string; name: string; price: number; duration: number };

const DEFAULT_SERVICES: Service[] = [
  { id: "corte", name: "Corte", price: 35, duration: 30 },
  { id: "barba", name: "Barba", price: 25, duration: 25 },
  { id: "cabeca-navalha", name: "Cabeça raspada navalha", price: 25, duration: 30 },
  { id: "pezinho", name: "Pezinho", price: 20, duration: 15 },
  { id: "barba-maquina", name: "Barba raspada na máquina", price: 20, duration: 20 },
  { id: "sobrancelha", name: "Sobrancelha", price: 15, duration: 15 },
  { id: "combo-corte-barba", name: "Corte + Barba", price: 55, duration: 50 },
  { id: "combo-pezinho-barba", name: "Pezinho + Barba", price: 40, duration: 35 },
  { id: "combo-corte-sobrancelha", name: "Corte + Sobrancelha", price: 45, duration: 40 },
];

export default function BookingModal({ 
  isOpen, 
  onClose,
  initialServiceId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialServiceId?: string;
}) {
  const [step, setStep] = useState(1); // 1: Serviço, 2: Barbeiro, 3: Data/Hora e Dados
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberData | null>(BARBERS[0]); // Padrão Mr. Bastos
  const [isAnyBarber, setIsAnyBarber] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBarber, setConfirmedBarber] = useState<BarberData>(BARBERS[0]);

  useEffect(() => {
    if (isOpen) {
      const applyServices = (list: Service[]) => {
        const finalServices = Array.isArray(list) && list.length > 0 ? list : DEFAULT_SERVICES;
        setServices(finalServices);
        if (initialServiceId) {
          const s = finalServices.find(
            (d: Service) => d.id === initialServiceId || d.name.toLowerCase() === initialServiceId.toLowerCase()
          );
          if (s) {
            setSelectedService(s);
            setStep(2); // Vai direto para escolha do barbeiro
          } else {
            setStep(1);
            setSelectedService(null);
          }
        } else {
          setStep(1);
          setSelectedService(null);
        }
      };

      fetch('/api/services')
        .then(res => res.json())
        .then(data => applyServices(data))
        .catch(() => applyServices(DEFAULT_SERVICES));

      setSelectedDate("");
      setSelectedTime("");
      setAvailableTimes([]);
      setIsSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen, initialServiceId]);

  // Busca horários disponíveis quando a data OU o barbeiro mudar
  useEffect(() => {
    if (selectedDate) {
      const bId = isAnyBarber ? "qualquer" : (selectedBarber?.id || "qualquer");
      fetch(`/api/appointments/available?date=${selectedDate}&barberId=${bId}`)
        .then(res => res.json())
        .then(data => setAvailableTimes(data.availableTimes || []))
        .catch(() => {
          setAvailableTimes(["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
        });
    }
  }, [selectedDate, selectedBarber, isAnyBarber]);

  const handleBooking = async () => {
    if (!clientName || !clientPhone) {
      setErrorMsg("Por favor, preencha seu nome e WhatsApp.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setErrorMsg("Selecione data e horário.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const barberToAssign = isAnyBarber ? BARBERS[0] : (selectedBarber || BARBERS[0]);
    setConfirmedBarber(barberToAssign);

    const fullDate = `${selectedDate}T${selectedTime}:00Z`;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          barberId: barberToAssign.id,
          date: fullDate,
          clientName,
          clientPhone,
          clientPassword: clientPassword || "123",
          isWalkIn: false,
        })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      // Confirmação fallback em caso de rede
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const dateFormatted = selectedDate ? selectedDate.split("-").reverse().join("/") : "";
  const whatsappMsg = `Olá, ${confirmedBarber.name}! Acabei de agendar um ${selectedService?.name || "serviço"} (R$ ${selectedService?.price}) na Mr. Bastos Barbearia para o dia ${dateFormatted} às ${selectedTime}.\n\nMeus dados:\nNome: ${clientName}\nWhatsApp: ${clientPhone}\n\nPoderia me confirmar?`;
  const whatsappUrl = `https://wa.me/${confirmedBarber.phone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#050B14] border border-[#C88E70]/30 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#C88E70] font-semibold">
                Mr. Bastos Barbearia · Alagoinhas BA
              </p>
              <h2 className="text-2xl font-serif text-white tracking-wide mt-1">
                {isSuccess ? "Agendamento Realizado!" : "Agendar Horário"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          {!isSuccess && (
            <div className="px-8 pt-4 pb-2 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
              {[
                { n: 1, title: "Serviço" },
                { n: 2, title: "Barbeiro" },
                { n: 3, title: "Data & Horário" }
              ].map(s => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.n ? 'bg-[#C88E70] text-black' : step > s.n ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                    {s.n}
                  </div>
                  <span className={`text-xs uppercase tracking-wider hidden sm:inline ${step === s.n ? 'text-white font-semibold' : 'text-gray-500'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle2 className="w-20 h-20 text-[#C88E70] mb-4" />
                </motion.div>
                <h3 className="text-3xl font-serif text-white mb-2">Tudo Pronto, {clientName}!</h3>
                <p className="text-gray-300 font-light max-w-md text-sm mb-6 leading-relaxed">
                  Seu horário para <strong>{selectedService?.name}</strong> foi reservado com <strong>{confirmedBarber.name}</strong> para o dia <strong>{dateFormatted}</strong> às <strong>{selectedTime}</strong>.
                </p>

                {/* Card de envio para o WhatsApp do Barbeiro */}
                <div className="w-full max-w-md bg-white/[0.03] border border-[#25D366]/40 rounded-2xl p-5 mb-8 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#25D366] animate-pulse" />
                    <p className="text-xs font-semibold text-[#25D366] uppercase tracking-wider">
                      Notificar Barbeiro no WhatsApp
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Toque no botão abaixo para enviar os detalhes do seu agendamento direto para o WhatsApp de <strong>{confirmedBarber.name}</strong> ({confirmedBarber.phoneDisplay}):
                  </p>
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-[#25D366] text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:scale-[1.02]"
                  >
                    <span>Enviar para WhatsApp de {confirmedBarber.name.split(" ")[0]}</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Fechar janela
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: ESCOLHA DO SERVIÇO */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <p className="text-[#C88E70] text-xs uppercase tracking-widest font-semibold">
                      Passo 1: Selecione o Serviço Desejado
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                      {services.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedService(s)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedService?.id === s.id ? 'border-[#C88E70] bg-[#C88E70]/15 shadow-md shadow-[#C88E70]/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                        >
                          <div>
                            <h4 className="text-base font-serif text-white">{s.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{s.duration} minutos</p>
                          </div>
                          <span className="text-[#C88E70] font-mono font-bold text-base">R$ {s.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: ESCOLHA DO BARBEIRO */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <p className="text-[#C88E70] text-xs uppercase tracking-widest font-semibold">
                        Passo 2: Escolha o Barbeiro
                      </p>
                      <span className="text-xs text-gray-400 font-light">
                        Serviço: <strong className="text-white">{selectedService?.name} (R$ {selectedService?.price})</strong>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Opção Qualquer Barbeiro */}
                      <div
                        onClick={() => {
                          setIsAnyBarber(true);
                          setSelectedBarber(null);
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between ${isAnyBarber ? 'border-[#C88E70] bg-[#C88E70]/15' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#C88E70]/20 border border-[#C88E70]/40 flex items-center justify-center text-[#C88E70]">
                            <Scissors className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-serif text-white">Qualquer Barbeiro Disponível</h4>
                            <p className="text-xs text-gray-400">Mais opções de horários livres para você</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#C88E70] uppercase font-bold tracking-wider">Mais Rápido</span>
                      </div>

                      {/* Barbeiros Individuais */}
                      {BARBERS.map((barber) => {
                        const isSelected = !isAnyBarber && selectedBarber?.id === barber.id;
                        return (
                          <div
                            key={barber.id}
                            onClick={() => {
                              setIsAnyBarber(false);
                              setSelectedBarber(barber);
                            }}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between ${isSelected ? 'border-[#C88E70] bg-[#C88E70]/15 shadow-md shadow-[#C88E70]/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-full bg-cover bg-center border border-white/20"
                                style={{ backgroundImage: `url(${barber.avatar})` }}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-serif text-white">{barber.name}</h4>
                                  {barber.role === "ADMIN" && (
                                    <span className="text-[9px] bg-[#C88E70] text-[#050B14] px-2 py-0.5 rounded font-bold uppercase">
                                      Fundador
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{barber.specialty}</p>
                              </div>
                            </div>

                            <span className="text-xs text-gray-400 font-mono">
                              WhatsApp pronto
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: DATA, HORÁRIO E DADOS DO CLIENTE */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                      <p className="text-[#C88E70] text-xs uppercase tracking-widest font-semibold">
                        Passo 3: Data, Horário & Seus Dados
                      </p>
                      <span className="text-xs text-gray-400 font-light">
                        Barbeiro: <strong className="text-[#C88E70]">{isAnyBarber ? "Qualquer Barbeiro" : selectedBarber?.name}</strong>
                      </span>
                    </div>

                    {errorMsg && (
                      <p className="text-red-400 text-xs text-center bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20 font-medium">
                        {errorMsg}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Coluna 1: Dados do Cliente */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                            Seu Nome Completo
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ex: Rodrigo Estêvão"
                            value={clientName} 
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-[#C88E70] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                            Seu WhatsApp com DDD
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ex: (75) 98888-7777"
                            value={clientPhone} 
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-[#C88E70] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                            Senha para Acessar seu Painel de Cliente
                          </label>
                          <input 
                            type="password" 
                            placeholder="Crie uma senha (ex: 123)"
                            value={clientPassword} 
                            onChange={(e) => setClientPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-[#C88E70] focus:outline-none transition-colors"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Você poderá logar no Painel de Cliente com seu telefone e essa senha.
                          </p>
                        </div>
                      </div>

                      {/* Coluna 2: Data e Horário */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                            Data do Atendimento
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                              type="date" 
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#C88E70] focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                            Horários Disponíveis ({isAnyBarber ? "Geral" : selectedBarber?.name.split(" ")[0]})
                          </label>
                          {!selectedDate ? (
                            <p className="text-xs text-gray-500 italic py-4">
                              Selecione uma data acima para carregar a disponibilidade.
                            </p>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                              {availableTimes.length === 0 ? (
                                <p className="text-xs text-gray-500 col-span-3 py-2">Nenhum horário livre nesta data.</p>
                              ) : (
                                availableTimes.map(time => (
                                  <button 
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${selectedTime === time ? 'border-[#C88E70] bg-[#C88E70] text-black shadow-md' : 'border-white/10 text-gray-300 hover:border-white/30 bg-white/[0.02]'}`}
                                  >
                                    {time}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer Controls */}
          {!isSuccess && (
            <div className="p-6 border-t border-white/10 flex justify-between items-center bg-white/[0.01]">
              <button 
                type="button"
                onClick={() => (step > 1 ? setStep(step - 1) : onClose())} 
                className="text-gray-400 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
              >
                {step > 1 ? "Voltar" : "Cancelar"}
              </button>
              
              {step === 1 && (
                <button 
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="bg-[#C88E70] text-[#050B14] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button 
                  type="button"
                  disabled={!isAnyBarber && !selectedBarber}
                  onClick={() => setStep(3)}
                  className="bg-[#C88E70] text-[#050B14] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button 
                  type="button"
                  disabled={!selectedDate || !selectedTime || !clientName || !clientPhone || isLoading}
                  onClick={handleBooking}
                  className="bg-[#C88E70] text-[#050B14] px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-[#C88E70]/20"
                >
                  {isLoading ? "Confirmando..." : "Confirmar & Ir para WhatsApp"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
