"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  Sparkles,
  Phone,
  Lock,
  Mail,
  QrCode,
  CreditCard,
  Banknote,
  Coffee,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OFFICIAL_SERVICES, ServiceItem } from "@/lib/services";
import { BARBERS as OFFICIAL_BARBERS } from "@/lib/barbers";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  initialBarberId?: string;
  initialUserData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface BarberApiItem {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  specialty?: string;
  specialties?: string;
  isAvailable?: boolean;
  lunchBreakTime?: string | null;
  earlyClosingTime?: string | null;
}

const PAYMENT_OPTIONS = [
  { id: "PIX", label: "PIX", desc: "Instantâneo", icon: QrCode },
  { id: "CARTAO_CREDITO", label: "Crédito", desc: "Na hora", icon: CreditCard },
  { id: "CARTAO_DEBITO", label: "Débito", desc: "Na hora", icon: CreditCard },
  { id: "DINHEIRO", label: "Dinheiro", desc: "Presencial", icon: Banknote },
];

export default function BookingModal({
  isOpen,
  onClose,
  initialServiceId,
  initialBarberId,
  initialUserData,
}: BookingModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<1 | 2 | 3>(1);

  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("qualquer");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");

  // Dados do cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  // Estado de profissionais e disponibilidade dinâmica
  const [barbers, setBarbers] = useState<BarberApiItem[]>(OFFICIAL_BARBERS);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [isClosedDay, setIsClosedDay] = useState(false);
  const [closedReason, setClosedReason] = useState("");
  const [dayLunchInfo, setDayLunchInfo] = useState<string | null>(null);
  const [dayEarlyClosing, setDayEarlyClosing] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBarberName, setConfirmedBarberName] = useState("Nossa Equipe");
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTodayStr = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const obj = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${obj.year}-${obj.month}-${obj.day}`;
  };

  // Trava scroll do fundo ao abrir no celular/desktop
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Preenche dados do usuário se logado ou passados via initialUserData
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setClientName(session.user.name);
      if (session.user.email) setClientEmail(session.user.email);
      if ((session.user as any).phone) setClientPhone((session.user as any).phone);
    } else if (initialUserData) {
      if (initialUserData.name) setClientName(initialUserData.name);
      if (initialUserData.email) setClientEmail(initialUserData.email);
      if (initialUserData.phone) setClientPhone(initialUserData.phone);
    }
  }, [session, initialUserData]);

  // Inicializa ao abrir
  useEffect(() => {
    if (!isOpen) return;

    const today = getTodayStr();
    setSelectedDate(today);
    setSelectedTime("");
    setErrorMsg("");
    setPaymentMethod("PIX");
    setSelectedBarber(initialBarberId || "qualquer");

    if (initialServiceId) {
      setSelectedService(initialServiceId);
      setStep(2);
      setMaxReachedStep(2);
    } else {
      setSelectedService("");
      setStep(1);
      setMaxReachedStep(1);
    }

    if (!session?.user) {
      setClientPassword("");
    }
  }, [isOpen, initialServiceId, initialBarberId, session]);

  // Busca barbeiros disponíveis (com escala e pausa de almoço da data)
  useEffect(() => {
    if (!isOpen) return;
    const queryDate = selectedDate || getTodayStr();
    fetch(`/api/barbers?date=${queryDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBarbers(data);
        }
      })
      .catch(() => {});
  }, [isOpen, selectedDate]);

  // Busca horários disponíveis quando data ou barbeiro muda
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingTimes(true);
    setIsClosedDay(false);
    setClosedReason("");
    setDayLunchInfo(null);
    setDayEarlyClosing(null);

    const bParam = selectedBarber ? `&barberId=${selectedBarber}` : "";
    fetch(`/api/appointments/available?date=${selectedDate}${bParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isClosed) {
          setIsClosedDay(true);
          setClosedReason(data.reason || "Não há atendimento nesta data.");
          setAvailableTimes([]);
          setSelectedTime("");
        } else {
          const times: string[] = Array.isArray(data.availableTimes)
            ? data.availableTimes
            : [];
          setAvailableTimes(times);
          setDayLunchInfo(data.lunchBreakTime || null);
          setDayEarlyClosing(data.earlyClosingTime || null);
          setSelectedTime((prev) => (prev && times.includes(prev) ? prev : times[0] || ""));
        }
      })
      .catch(() => {
        setAvailableTimes([]);
      })
      .finally(() => setLoadingTimes(false));
  }, [selectedDate, selectedBarber]);

  // Rola o corpo do modal para o topo ao trocar de passo
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step]);

  // Contagem regressiva automática no Step 4 -> redireciona ao Painel do Cliente VIP
  useEffect(() => {
    if (!isOpen || step !== 4) return;
    setRedirectCountdown(3);
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          router.push("/painel-cliente?newBooking=1");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step, onClose, router]);

  const serviceObj: ServiceItem | undefined = OFFICIAL_SERVICES.find(
    (s) => s.id === selectedService
  );
  const selectedBarberObj = barbers.find((b) => b.id === selectedBarber);

  const handleSelectServiceStep = (id: string) => {
    setSelectedService(id);
    setErrorMsg("");
    setStep(2);
    setMaxReachedStep((prev) => (prev < 2 ? 2 : prev));
  };

  const handleSelectBarberStep = (id: string) => {
    setSelectedBarber(id);
    setErrorMsg("");
    setStep(3);
    setMaxReachedStep(3);
  };

  const handleNextBusinessDay = () => {
    const base = new Date(`${selectedDate || getTodayStr()}T12:00:00-03:00`);
    base.setDate(base.getDate() + 1);
    if (base.getDay() === 0) {
      base.setDate(base.getDate() + 1);
    }
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMsg("Por favor, selecione uma data e um horário livre.");
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMsg("Informe seu nome e WhatsApp para confirmarmos a reserva.");
      return;
    }
    if (!session?.user) {
      if (!clientEmail.trim()) {
        setErrorMsg("Informe seu e-mail para receber o comprovante e acessar sua conta VIP.");
        return;
      }
      if (!clientPassword || clientPassword.trim().length < 3) {
        setErrorMsg("Crie uma senha de pelo menos 3 dígitos para acessar seu Painel VIP.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const dateStr = `${selectedDate}T${selectedTime}:00-03:00`;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          barberId: selectedBarber,
          date: dateStr,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          clientPassword: clientPassword.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível confirmar o agendamento.");
      }

      if (data.barber?.name) {
        setConfirmedBarberName(data.barber.name);
      } else if (selectedBarberObj?.name) {
        setConfirmedBarberName(selectedBarberObj.name);
      } else {
        setConfirmedBarberName("Equipe Mr. Bastos");
      }

      // Se o cliente não estava logado, autentica silenciosamente para entrar direto no Painel VIP
      if (!session?.user && clientEmail.trim() && clientPassword.trim()) {
        await signIn("credentials", {
          email: clientEmail.trim().toLowerCase(),
          password: clientPassword.trim(),
          redirect: false,
        }).catch(() => {});
      }

      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao conectar com a agenda. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 4) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="w-full sm:max-w-2xl bg-[#050B14] border-t sm:border border-blue-800/50 rounded-t-3xl sm:rounded-3xl shadow-[0_0_60px_rgba(37,99,235,0.22)] flex flex-col max-h-[94dvh] sm:max-h-[90dvh] overflow-hidden"
      >
        {/* TOPO FIXO */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-blue-900/40 bg-[#040912] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/35 flex items-center justify-center text-blue-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white leading-tight">
                Agendar Horário <span className="text-blue-400">Mr. Bastos</span>
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-blue-400" /> Hiper Gbarbosa — Alagoinhas, BA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEPPER CLICÁVEL (Passos 1 -> 2 -> 3) */}
        {step < 4 && (
          <div className="px-5 py-3 bg-[#060E1B] border-b border-blue-900/30 grid grid-cols-3 gap-2 shrink-0">
            {[
              { n: 1, label: "1. Serviço" },
              { n: 2, label: "2. Barbeiro" },
              { n: 3, label: "3. Data & VIP" },
            ].map((s) => {
              const active = step === s.n;
              const unlocked = s.n <= maxReachedStep || (s.n === 2 && Boolean(selectedService));
              return (
                <button
                  key={s.n}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setStep(s.n as 1 | 2 | 3)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center truncate ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-900/50"
                      : unlocked
                      ? "bg-blue-950/60 text-blue-300 border border-blue-800/40 hover:border-blue-500/50"
                      : "bg-[#050B14] text-slate-600 border border-slate-800/40 cursor-not-allowed"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* CORPO COM SCROLL CONTIDO */}
        <div
          ref={scrollContainerRef}
          style={{ overscrollBehavior: "contain" }}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          <AnimatePresence mode="wait">
            {/* PASSO 1: SERVIÇOS COM FOTOS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-400">
                  Toque no serviço desejado para avançar automaticamente:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OFFICIAL_SERVICES.map((service) => {
                    const isSelected = selectedService === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleSelectServiceStep(service.id)}
                        className={`text-left rounded-2xl p-3 border transition-all flex items-center gap-3 group ${
                          isSelected
                            ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-950/40"
                            : "bg-[#081221] border-blue-900/40 hover:border-blue-500/60"
                        }`}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-14 h-14 rounded-xl object-cover border border-blue-900/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-blue-300">
                              {service.name}
                            </span>
                            <span className="text-xs font-black text-blue-400 shrink-0">
                              R$ {service.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-400" /> {service.duration} min
                            {service.badge && (
                              <span className="ml-1.5 text-blue-300 font-bold">
                                • {service.badge}
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PASSO 2: BARBEIROS (COM TRANSPARÊNCIA DE PAUSA DE ALMOÇO) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                {serviceObj && (
                  <div className="flex items-center justify-between bg-blue-950/35 border border-blue-800/40 rounded-xl px-4 py-2.5 text-xs">
                    <span className="text-slate-300">
                      Serviço:{" "}
                      <strong className="text-white">{serviceObj.name}</strong>
                    </span>
                    <span className="font-black text-blue-400">
                      R$ {serviceObj.price} ({serviceObj.duration}m)
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Escolha o profissional de sua preferência na equipe Mr. Bastos:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Qualquer profissional disponível */}
                  <button
                    type="button"
                    onClick={() => handleSelectBarberStep("qualquer")}
                    className={`w-full text-left rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${
                      selectedBarber === "qualquer"
                        ? "bg-blue-600/15 border-blue-500"
                        : "bg-[#081221] border-blue-900/40 hover:border-blue-500/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/35 flex items-center justify-center text-blue-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Qualquer Profissional Disponível
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Alocamos automaticamente o primeiro barbeiro livre no horário escolhido
                        </p>
                      </div>
                    </div>
                  </button>

                  {barbers.map((barber) => {
                    const isSelected = selectedBarber === barber.id;
                    return (
                      <button
                        key={barber.id}
                        type="button"
                        onClick={() => handleSelectBarberStep(barber.id)}
                        className={`w-full text-left rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-blue-600/15 border-blue-500"
                            : "bg-[#081221] border-blue-900/40 hover:border-blue-500/60"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {barber.avatar ? (
                            <img
                              src={barber.avatar}
                              alt={barber.name}
                              width={56}
                              height={56}
                              fetchPriority="low"
                              className="w-14 h-14 rounded-xl object-cover object-top border border-blue-500/35 shrink-0 bg-[#050B14]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black text-base flex items-center justify-center shrink-0">
                              {barber.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-white truncate">
                                {barber.name}
                              </h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                                {barber.role === "ADMIN" ? "Proprietário" : barber.role === "BARBER" ? "Barbeiro" : barber.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {barber.specialties || barber.specialty}
                            </p>
                            {barber.lunchBreakTime && (
                              <p className="text-[10px] text-amber-400 mt-1 inline-flex items-center gap-1 font-semibold">
                                <Coffee className="w-3 h-3" /> Pausa almoço:{" "}
                                {barber.lunchBreakTime.replace("-", " às ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PASSO 3: DATA, HORÁRIO, PAGAMENTO E DADOS VIP */}
            {step === 3 && (
              <motion.form
                key="step3"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-5"
              >
                {/* Resumo rápido */}
                <div className="bg-[#081221] border border-blue-900/45 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Scissors className="w-3.5 h-3.5 text-blue-400" />
                    <strong className="text-white">{serviceObj?.name}</strong>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-300 font-semibold">
                      {selectedBarber === "qualquer"
                        ? "Qualquer Barbeiro"
                        : selectedBarberObj?.name}
                    </span>
                  </div>
                  <span className="font-black text-blue-400">
                    R$ {serviceObj?.price || 0}
                  </span>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Escolha a Data
                  </label>
                  <input
                    type="date"
                    min={getTodayStr()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    className="w-full bg-[#081221] border border-blue-900/50 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                    required
                  />
                </div>

                {/* Avisos individuais de almoço / saída antecipada / fechado */}
                {(dayLunchInfo || dayEarlyClosing) && !isClosedDay && (
                  <div className="flex flex-wrap gap-2">
                    {dayLunchInfo && (
                      <div className="flex-1 min-w-[200px] bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-[11px] text-amber-300 flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Pausa para almoço de {selectedBarberObj?.name || "profissional"}:{" "}
                          <strong>{dayLunchInfo.replace("-", " às ")}</strong> (já travada)
                        </span>
                      </div>
                    )}
                    {dayEarlyClosing && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-3.5 py-2 text-[11px] text-blue-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Encerra às {dayEarlyClosing} nesta data</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Grade de Horários */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Horários Disponíveis
                  </label>

                  {loadingTimes ? (
                    <div className="flex items-center justify-center py-6 bg-[#081221] rounded-xl border border-blue-900/30">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400 mr-2" />
                      <span className="text-xs text-slate-400">Consultando agenda...</span>
                    </div>
                  ) : isClosedDay ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
                      <p className="text-xs text-red-300 font-semibold">{closedReason}</p>
                      <button
                        type="button"
                        onClick={handleNextBusinessDay}
                        className="text-xs font-bold text-blue-400 hover:underline"
                      >
                        Ir para o próximo dia útil →
                      </button>
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#081221] border border-blue-900/40 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        Nenhum horário livre nesta data para a seleção atual.
                      </p>
                      <button
                        type="button"
                        onClick={handleNextBusinessDay}
                        className="text-xs font-bold text-blue-400 hover:underline"
                      >
                        Ver horários de amanhã →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {availableTimes.map((time) => {
                        const active = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              active
                                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40"
                                : "bg-[#081221] text-slate-300 border-blue-900/40 hover:border-blue-500/60"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Forma de Pagamento (no local)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPaymentMethod(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            active
                              ? "bg-blue-600/20 border-blue-500 text-white"
                              : "bg-[#081221] border-blue-900/40 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? "text-blue-400" : "text-slate-500"
                            }`}
                          />
                          <div>
                            <p className="text-[11px] font-bold leading-none">{opt.label}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dados do Cliente VIP */}
                <div className="space-y-3 pt-2 border-t border-blue-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Seus Dados (Conta VIP &amp; Confirmação)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        className="w-full bg-[#081221] border border-blue-900/50 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="WhatsApp (75) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        required
                        className="w-full bg-[#081221] border border-blue-900/50 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {!session?.user && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="Seu melhor e-mail"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          required
                          className="w-full bg-[#081221] border border-blue-900/50 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          placeholder="Crie uma senha VIP (mín. 3 dígitos)"
                          value={clientPassword}
                          onChange={(e) => setClientPassword(e.target.value)}
                          required
                          minLength={3}
                          className="w-full bg-[#081221] border border-blue-900/50 rounded-xl pl-10 pr-3 py-3 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !selectedTime || isClosedDay}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-950/60 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirmando Reserva...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmar Agendamento VIP
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* PASSO 4: CONFIRMAÇÃO + AUTO-REDIRECT PAINEL VIP */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-bold text-white">
                    Horário Confirmado!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Sua cadeira na <strong className="text-white">Mr. Bastos Barbearia</strong>{" "}
                    já está reservada.
                  </p>
                </div>

                <div className="bg-[#081221] border border-blue-900/50 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serviço</span>
                    <span className="font-bold text-white">{serviceObj?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profissional</span>
                    <span className="font-bold text-blue-400">{confirmedBarberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data e Horário</span>
                    <span className="font-bold text-white">
                      {selectedDate.split("-").reverse().join("/")} às {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pagamento</span>
                    <span className="font-bold text-emerald-400">{paymentMethod}</span>
                  </div>
                </div>

                {!session?.user && clientEmail && (
                  <div className="bg-blue-950/35 border border-blue-700/40 rounded-2xl p-4 text-left space-y-1 text-xs">
                    <p className="font-bold text-blue-300 uppercase tracking-wider text-[10px]">
                      Sua Conta VIP de Acesso
                    </p>
                    <p className="text-slate-300">
                      Login: <strong className="text-white">{clientEmail}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Enviamos a confirmação para seu e-mail e liberamos seu Cartão Fidelidade.
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push("/painel-cliente?newBooking=1");
                    }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Ir para Meu Painel VIP ({redirectCountdown}s)
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Continuar no Site
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
