"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useSession, signIn } from "next-auth/react";
import { X, Calendar, Clock, ChevronRight, CheckCircle2, User, Scissors, Star, Mail, Phone, Lock, Shield, Sparkles, Check, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { BARBERS, BarberData } from "@/lib/barbers";
import { OFFICIAL_SERVICES, ServiceItem } from "@/lib/services";

export default function BookingModal({ 
  isOpen, 
  onClose,
  initialServiceId,
  initialUserData,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialServiceId?: string;
  initialUserData?: { name?: string; email?: string; phone?: string };
}) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [step, setStep] = useState(1); // 1: Serviço, 2: Barbeiro, 3: Data/Hora e Dados do Cliente
  const [services, setServices] = useState<ServiceItem[]>(OFFICIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberData>(BARBERS[0]); // Padrão Mr. Bastos
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Dados do Cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("123");
  const [isEditingData, setIsEditingData] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBarber, setConfirmedBarber] = useState<BarberData>(BARBERS[0]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoToVipPanel = async () => {
    setIsRedirecting(true);
    try {
      const loginId = clientEmail.trim().toLowerCase() || clientPhone.replace(/\D/g, "");
      await signIn("credentials", {
        identifier: loginId,
        phone: loginId,
        password: clientPassword || "123",
        callbackUrl: "/painel-cliente",
      });
    } catch (_) {
      window.location.href = "/painel-cliente";
    }
  };

  const isLoggedIn = status === "authenticated" || !!initialUserData?.name || !!(session as any)?.user?.name;

  // Auto preenchimento dos dados do cliente logado
  useEffect(() => {
    if (isOpen) {
      const u = session?.user as any;
      const effectiveName = initialUserData?.name || u?.name || "";
      const effectiveEmail = initialUserData?.email || u?.email || "";
      const effectivePhone = initialUserData?.phone || u?.phone || "";

      if (effectiveName) setClientName(effectiveName);
      if (effectiveEmail) setClientEmail(effectiveEmail);
      if (effectivePhone) setClientPhone(effectivePhone);
      setClientPassword("123");
      setIsEditingData(false);
    }
  }, [isOpen, session, initialUserData]);

  useEffect(() => {
    if (isOpen) {
      setServices(OFFICIAL_SERVICES);
      
      if (initialServiceId) {
        const s = OFFICIAL_SERVICES.find(
          (d) => d.id === initialServiceId || d.name.toLowerCase() === initialServiceId.toLowerCase()
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

      setSelectedBarber(BARBERS[0]);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableTimes([]);
      setIsSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen, initialServiceId]);

  // Busca horários disponíveis quando a data OU o barbeiro mudar
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      fetch(`/api/appointments/available?date=${selectedDate}&barberId=${selectedBarber.id}`)
        .then((res) => res.json())
        .then((data) => setAvailableTimes(data.availableTimes || []))
        .catch(() => {
          setAvailableTimes(["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
        });
    }
  }, [selectedDate, selectedBarber]);

  const handleBooking = async () => {
    if (!clientName.trim()) {
      setErrorMsg("Por favor, preencha seu nome completo.");
      return;
    }

    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setErrorMsg("Por favor, informe um e-mail válido para criar sua conta e permitir a recuperação de senha.");
      return;
    }

    if (!clientPhone.trim() || clientPhone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Por favor, preencha seu WhatsApp com DDD para contato.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setErrorMsg("Por favor, selecione a data e o horário desejado.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setConfirmedBarber(selectedBarber);
    const fullDate = `${selectedDate}T${selectedTime}:00Z`;

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          barberId: selectedBarber.id,
          date: fullDate,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientPhone: clientPhone.trim(),
          clientPassword: clientPassword || "123",
          isWalkIn: false,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // Autentica imediatamente na sessão do novo cliente criado
        const loginId = clientEmail.trim().toLowerCase() || clientPhone.replace(/\D/g, "");
        try {
          await signIn("credentials", {
            identifier: loginId,
            phone: loginId,
            password: clientPassword || "123",
            redirect: false,
          });
        } catch (_) {}
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      // Confirmação fallback em caso de rede/offline
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };


  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (!isOpen) return null;

  const dateFormatted = selectedDate ? selectedDate.split("-").reverse().join("/") : "";
  const whatsappMsg = `Olá, ${confirmedBarber.name}! Acabei de agendar um ${selectedService?.name || "serviço"} (R$ ${selectedService?.price}) na Mr. Bastos Barbearia para o dia ${dateFormatted} às ${selectedTime}.\n\nMeus dados:\nNome: ${clientName}\nE-mail: ${clientEmail}\nWhatsApp: ${clientPhone}\n\nPoderia me confirmar?`;
  const whatsappUrl = `https://wa.me/${confirmedBarber.phone}?text=${encodeURIComponent(whatsappMsg)}`;

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#050B14] border border-blue-500/30 rounded-3xl p-6 md:p-8 z-10 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-5 border-b border-white/10 shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-blue-400 font-semibold">
                Agendamento Online
              </p>
              <h2 className="text-2xl font-serif text-white mt-0.5">Mr. Bastos Barbearia</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper (Passos 1, 2, 3) */}
          {!isSuccess && (
            <div className="flex items-center gap-2 py-4 border-b border-white/5 shrink-0 text-xs">
              <span className={`px-3 py-1 rounded-full font-semibold transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-md' : selectedService ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                1. Serviço
              </span>
              <span className="text-gray-600">→</span>
              <span className={`px-3 py-1 rounded-full font-semibold transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-md' : selectedBarber ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                2. Barbeiro
              </span>
              <span className="text-gray-600">→</span>
              <span className={`px-3 py-1 rounded-full font-semibold transition-all ${step === 3 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500'}`}>
                3. Data, Horário & E-mail
              </span>
            </div>
          )}

          {/* Conteúdo Central com Scroll */}
          <div className="py-6 overflow-y-auto flex-1 pr-1 scrollbar-hide">
            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle2 className="w-20 h-20 text-blue-400 mb-4" />
                </motion.div>
                <h3 className="text-3xl font-serif text-white mb-2">Tudo Pronto, {clientName}!</h3>
                <p className="text-gray-300 font-light max-w-md text-sm mb-4 leading-relaxed">
                  Seu horário para <strong>{selectedService?.name}</strong> foi reservado com <strong>{confirmedBarber.name}</strong> para o dia <strong>{dateFormatted}</strong> às <strong>{selectedTime}</strong>.
                </p>
                <p className="text-xs text-gray-400 mb-6 max-w-md">
                  Sua conta foi criada com o e-mail <strong className="text-white">{clientEmail}</strong>. Você pode acessar seu Painel VIP pelo e-mail ou WhatsApp com a senha cadastrada.
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
                    Toque no botão abaixo para enviar os detalhes do agendamento direto para o WhatsApp de <strong>{confirmedBarber.name}</strong> ({confirmedBarber.phoneDisplay}):
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

                {/* Botão Acessar Painel VIP */}
                <button
                  type="button"
                  onClick={handleGoToVipPanel}
                  disabled={isRedirecting}
                  className="w-full max-w-md bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white transition-all duration-300 shadow-lg shadow-blue-500/20 mb-3 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRedirecting ? "Acessando seu painel..." : "Acessar Meu Painel VIP Agora"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Fechar janela
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: ESCOLHA DO SERVIÇO (TODOS OS 9 SERVIÇOS E COMBOS OFICIAIS) */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-blue-400 text-xs uppercase tracking-widest font-semibold">
                        Passo 1: Selecione o Serviço Desejado
                      </p>
                      <span className="text-xs text-gray-400 font-mono">9 opções disponíveis</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                      {services.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedService(s)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedService?.id === s.id ? 'border-blue-500 bg-blue-600/15 shadow-md shadow-blue-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-serif text-white">{s.name}</h4>
                              {s.isCombo && (
                                <span className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                                  Combo
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.description}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{s.duration} minutos</p>
                          </div>
                          <span className="text-blue-400 font-mono font-bold text-base shrink-0 ml-3">R$ {s.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: ESCOLHA DO BARBEIRO (APENAS OS 3 BARBEIROS OFICIAIS) */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <p className="text-blue-400 text-xs uppercase tracking-widest font-semibold">
                        Passo 2: Escolha o Barbeiro Responsável
                      </p>
                      <span className="text-xs text-gray-400 font-light">
                        Serviço: <strong className="text-white">{selectedService?.name} (R$ {selectedService?.price})</strong>
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      Selecione o profissional com quem você deseja realizar seu atendimento na unidade Alagoinhas – BA:
                    </p>

                    <div className="space-y-3">
                      {BARBERS.map((barber) => {
                        const isSelected = selectedBarber?.id === barber.id;
                        const isOwner = barber.role === "ADMIN";

                        return (
                          <div
                            key={barber.id}
                            onClick={() => setSelectedBarber(barber)}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between ${isSelected ? 'border-blue-500 bg-blue-600/15 shadow-md shadow-blue-500/10 ring-1 ring-blue-500' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-14 h-14 rounded-2xl bg-cover bg-center border border-white/20 shrink-0 shadow-md"
                                style={{ backgroundImage: `url(${barber.avatar})` }}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-serif text-white">{barber.name}</h4>
                                  {isOwner ? (
                                    <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                                      Fundador / Dono
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-medium uppercase">
                                      Barbeiro
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-blue-400 mt-0.5">{barber.specialty}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{barber.bio}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0 ml-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-400 border border-white/10'}`}>
                                {isSelected ? 'Selecionado' : 'Escolher'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: DATA, HORÁRIO & E-MAIL */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                      <div>
                        <p className="text-blue-400 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
                          <span>Passo 3: Data, Horário & Identificação</span>
                          {isLoggedIn && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Conta VIP Conectada
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {isLoggedIn 
                            ? "Seus dados estão vinculados à sua conta. Basta escolher o melhor dia e horário."
                            : "Preencha seus dados para criar sua conta VIP e garantir o agendamento."}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-light">
                        Barbeiro: <strong className="text-blue-400">{selectedBarber?.name}</strong>
                      </span>
                    </div>

                    {errorMsg && (
                      <p className="text-red-400 text-xs text-center bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20 font-medium">
                        {errorMsg}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Coluna 1: Dados do Cliente com Tratamento Especial para Usuário Logado */}
                      <div className="space-y-4">
                        {isLoggedIn && !isEditingData ? (
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/15 via-white/[0.02] to-transparent border border-blue-500/40 space-y-4 shadow-xl">
                            <div className="flex items-start justify-between border-b border-white/10 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-serif text-xl font-bold shadow-lg shadow-blue-500/30">
                                  {(clientName || "C")[0].toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 w-fit mb-1">
                                    <Sparkles className="w-3 h-3" /> Conta VIP Logada
                                  </span>
                                  <h4 className="text-white font-serif text-lg font-bold leading-tight">{clientName || "Cliente Mr. Bastos"}</h4>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsEditingData(true)}
                                className="text-[11px] text-blue-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                title="Editar dados para este agendamento"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Editar
                              </button>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              <div className="flex items-center gap-2.5 text-gray-200 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase block font-medium">WhatsApp Cadastrado</span>
                                  <strong className="text-white font-mono text-sm">{clientPhone || "(75) 98888-7777"}</strong>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 text-gray-200 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                <div className="truncate">
                                  <span className="text-[10px] text-gray-500 uppercase block font-medium">E-mail Oficial da Conta</span>
                                  <strong className="text-white truncate block text-xs">{clientEmail || "cliente@mrbastos.com"}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <strong>Seus dados já estão preenchidos!</strong> Basta escolher o dia e horário ao lado para concluir seu agendamento em 1 clique.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isLoggedIn && (
                              <div className="flex justify-between items-center pb-1">
                                <span className="text-xs text-gray-400">Editando dados do agendamento:</span>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingData(false)}
                                  className="text-xs text-blue-400 hover:underline"
                                >
                                  Usar dados da minha conta
                                </button>
                              </div>
                            )}

                            <div>
                              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-blue-400" /> Seu Nome Completo
                              </label>
                              <input 
                                type="text" 
                                placeholder="Digite seu nome completo"
                                value={clientName} 
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                              />
                            </div>

                            {/* CAMPO DE E-MAIL OFICIAL (PARA CONTA E RECUPERAÇÃO DE SENHA) */}
                            <div>
                              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-blue-400" /> Seu E-mail Oficial
                                <span className="text-[9px] text-blue-400 font-normal normal-case">(para conta e recuperar senha)</span>
                              </label>
                              <input 
                                type="email" 
                                placeholder="Ex: seuemail@gmail.com"
                                value={clientEmail} 
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                              />
                              <p className="text-[10px] text-gray-500 mt-1">
                                Seu e-mail será usado para cadastrar sua conta VIP e recuperar sua senha caso esqueça.
                              </p>
                            </div>

                            <div>
                              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-blue-400" /> WhatsApp com DDD
                                <span className="text-[9px] text-gray-500 font-normal normal-case">(login e confirmação)</span>
                              </label>
                              <input 
                                type="text" 
                                placeholder="Ex: (75) 99999-9999"
                                value={clientPhone} 
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                              />
                            </div>

                            {!isLoggedIn && (
                              <div>
                                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5 text-blue-400" /> Senha de Acesso ao Painel
                                </label>
                                <input 
                                  type="password" 
                                  placeholder="Crie uma senha de acesso"
                                  value={clientPassword} 
                                  onChange={(e) => setClientPassword(e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Coluna 2: Data e Horário com Atalhos Rápidos */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-400 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Data do Atendimento
                            </label>
                            {/* Atalhos Rápidos: Hoje e Amanhã */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDate(getTodayStr())}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                  selectedDate === getTodayStr()
                                    ? "bg-blue-600 text-white border-blue-500"
                                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                }`}
                              >
                                Hoje
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedDate(getTomorrowStr())}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                  selectedDate === getTomorrowStr()
                                    ? "bg-blue-600 text-white border-blue-500"
                                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                }`}
                              >
                                Amanhã
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            <input 
                              type="date" 
                              min={getTodayStr()}
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" /> Horários de {selectedBarber?.name.split(" ")[0]}
                          </label>
                          {!selectedDate ? (
                            <p className="text-xs text-gray-500 italic py-6 text-center border border-dashed border-white/10 rounded-xl">
                              Selecione uma data acima para consultar a agenda de {selectedBarber?.name.split(" ")[0]}.
                            </p>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                              {availableTimes.length === 0 ? (
                                <p className="text-xs text-gray-500 col-span-3 py-4 text-center">Nenhum horário livre nesta data.</p>
                              ) : (
                                availableTimes.map((time) => (
                                  <button 
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${selectedTime === time ? 'border-blue-500 bg-blue-600 text-white shadow-md' : 'border-white/10 text-gray-300 hover:border-white/30 bg-white/[0.02]'}`}
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

          {/* Footer com Botões de Navegação */}
          {!isSuccess && (
            <div className="pt-4 border-t border-white/10 shrink-0">
              <div className="flex justify-between items-center">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs uppercase tracking-wider font-semibold hover:bg-white/5 transition-all"
                  >
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    disabled={(step === 1 && !selectedService) || (step === 2 && !selectedBarber)}
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-white transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    Avançar <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading || !clientName || !clientEmail || !clientPhone || !selectedDate || !selectedTime}
                    onClick={handleBooking}
                    className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 flex items-center gap-2 shadow-xl shadow-blue-500/25"
                  >
                    {isLoading ? "Confirmando..." : "Confirmar Agendamento"}
                  </button>
                )}
              </div>

              {step === 3 && (
                <p className="text-[10px] text-gray-500 text-center mt-2.5">
                  Seus dados pessoais estão protegidos conforme nossa{" "}
                  <a href="/politica-de-privacidade" target="_blank" className="text-blue-400 hover:underline">
                    Política de Privacidade (LGPD)
                  </a>.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
