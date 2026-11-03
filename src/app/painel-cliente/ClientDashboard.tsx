"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, Calendar, Clock, RotateCcw, User, LogOut, Award, Star, 
  CheckCircle, Sparkles, MessageCircle, MapPin, ChevronRight, Home, 
  AlertTriangle, AlertCircle, X, Check, Edit2
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogoMrBastos } from "@/components/LogoMrBastos";
import { BARBERS, getBarberById } from "@/lib/barbers";
import { getDisplayTime } from "@/lib/timezone";
import { checkDayStatus } from "@/lib/holidays";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState({ currentCuts: 0, targetCuts: 10, freeCutsWon: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Olá");

  // Estados de Reagendamento
  const [rescheduleApt, setRescheduleApt] = useState<any | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("");
  const [newRescheduleTime, setNewRescheduleTime] = useState("");
  const [rescheduleAvailableTimes, setRescheduleAvailableTimes] = useState<string[]>([]);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleFeedback, setRescheduleFeedback] = useState<{ type: "success" | "error"; msg: string; whatsappUrl?: string } | null>(null);

  // Estados de Cancelamento
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);
  const [cancelFeedback, setCancelFeedback] = useState<{ type: "success" | "error"; msg: string; whatsappUrl?: string } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  const [clientData, setClientData] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
  });

  // Redireciona para o login se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setClientData((prev) => ({
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
        phone: (session.user as any)?.phone || prev.phone,
      }));
    }
  }, [session]);

  const loadDashboardData = () => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.isClient) {
          if (data.client) {
            setClientData({
              name: data.client.name || "",
              email: data.client.email || "",
              phone: data.client.phone || "",
            });
          }
          if (data.appointments) {
            const sorted = data.appointments.sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setAppointments(sorted);
          }
          if (data.loyaltyCard) {
            setLoyalty(data.loyaltyCard);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const clientName = clientData.name || session?.user?.name || "Cliente VIP";
  const clientPhone = clientData.phone || (session?.user as any)?.phone || "";
  const clientEmail = clientData.email || session?.user?.email || "";
  const vipDigits = clientPhone ? clientPhone.replace(/\D/g, "").slice(-4) : "VIP";

  // Próximo agendamento futuro ativo
  const upcomingApt = appointments.find(
    (apt) => new Date(apt.date) >= new Date() && apt.status !== "CANCELLED" && apt.status !== "COMPLETED"
  );

  // Último agendamento concluído ou passado
  const lastApt = appointments.find(
    (apt) => new Date(apt.date) < new Date() || apt.status === "COMPLETED"
  ) || appointments[0];

  const handleRebook = () => {
    if (lastApt) {
      const barberPhone = lastApt.barber?.phone || BARBERS[0].phone;
      const barberName = lastApt.barber?.name || BARBERS[0].name;
      const serviceName = lastApt.service?.name || "Corte";
      const msg = `Olá, ${barberName}! Sou o ${clientName}. Gostaria de repetir o meu último ${serviceName} com você. Quais horários você tem disponíveis nos próximos dias na Mr. Bastos Barbearia?`;
      window.open(`https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleContactBarber = (barberPhone?: string, barberName?: string) => {
    const phone = barberPhone || BARBERS[0].phone;
    const name = barberName || BARBERS[0].name;
    const msg = `Olá, ${name}! Sou o ${clientName}, cliente da Mr. Bastos Barbearia. Gostaria de tirar uma dúvida sobre meu horário.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Carrega horários disponíveis para o modal de reagendamento
  useEffect(() => {
    if (rescheduleApt && newRescheduleDate) {
      const dayStatus = checkDayStatus(newRescheduleDate);
      if (dayStatus.isClosed) {
        setRescheduleAvailableTimes([]);
        setNewRescheduleTime("");
        return;
      }

      const barberId = rescheduleApt.barberId || rescheduleApt.barber?.id || "barbeiro-dono";
      fetch(`/api/appointments/available?date=${newRescheduleDate}&barberId=${barberId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.availableTimes)) {
            setRescheduleAvailableTimes(data.availableTimes);
          } else {
            setRescheduleAvailableTimes([]);
          }
        })
        .catch(() => setRescheduleAvailableTimes([]));
    }
  }, [rescheduleApt, newRescheduleDate]);

  // Ação de Cancelamento pelo Cliente (Regra dos 30 minutos)
  const handleClientCancel = async (apt: any) => {
    if (!confirm("Deseja realmente cancelar este agendamento?\n\n• Dentro de 30 minutos: o cancelamento é imediato e libera a vaga.\n• Após 30 minutos: será enviada uma solicitação para o barbeiro aprovar.")) {
      return;
    }

    setCancellingAptId(apt.id);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apt.id }),
      });

      const data = await res.json();
      if (res.ok) {
        const barberName = apt.barber?.name || "Mr. Bastos";
        const barberPhone = apt.barber?.phone || BARBERS[0].phone;
        const aptDateStr = new Date(apt.date).toLocaleDateString("pt-BR");
        const aptTimeStr = getDisplayTime(apt.date);

        if (data.directCancelled) {
          const msg = `Olá, ${barberName}! Sou o ${clientName}. Cancelei meu agendamento de ${apt.service?.name || "serviço"} marcado para ${aptDateStr} às ${aptTimeStr} dentro do prazo de 30 min. O horário foi liberado no sistema!`;
          const whatsappUrl = `https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`;
          setCancelFeedback({
            type: "success",
            msg: "Agendamento cancelado com sucesso dentro dos 30 minutos! O horário foi liberado.",
            whatsappUrl,
          });
        } else {
          const msg = `Olá, ${barberName}! Sou o ${clientName}. Solicitei o cancelamento do meu agendamento de ${apt.service?.name || "serviço"} do dia ${aptDateStr} às ${aptTimeStr} no sistema. Poderia aprovar por favor?`;
          const whatsappUrl = `https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`;
          setCancelFeedback({
            type: "success",
            msg: "Como passaram 30 minutos do agendamento, sua solicitação de cancelamento foi enviada para o barbeiro aprovar.",
            whatsappUrl,
          });
        }
        loadDashboardData();
      } else {
        setCancelFeedback({
          type: "error",
          msg: data.error || "Erro ao processar o cancelamento.",
        });
      }
    } catch (_) {
      setCancelFeedback({
        type: "error",
        msg: "Falha de conexão ao cancelar agendamento.",
      });
    } finally {
      setCancellingAptId(null);
    }
  };

  // Submissão do Reagendamento pelo Cliente
  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !newRescheduleDate || !newRescheduleTime) return;

    const dayStatus = checkDayStatus(newRescheduleDate);
    if (dayStatus.isClosed) {
      setRescheduleFeedback({
        type: "error",
        msg: dayStatus.reason || "Barbearia fechada neste dia (domingo ou feriado).",
      });
      return;
    }

    setIsSubmittingReschedule(true);
    setRescheduleFeedback(null);

    try {
      const res = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleApt.id,
          requestedDate: newRescheduleDate,
          requestedTime: newRescheduleTime,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const barberName = rescheduleApt.barber?.name || "Mr. Bastos";
        const barberPhone = rescheduleApt.barber?.phone || BARBERS[0].phone;
        const newDateDisplay = `${newRescheduleDate.split("-").reverse().join("/")} às ${newRescheduleTime}`;

        const msg = `Olá, ${barberName}! Sou o ${clientName}. Solicitei no sistema o reagendamento do meu atendimento de ${rescheduleApt.service?.name || "serviço"} para o dia ${newDateDisplay}. Poderia aprovar no seu painel por favor?`;
        const whatsappUrl = `https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`;

        setRescheduleFeedback({
          type: "success",
          msg: "Solicitação enviada com sucesso! O barbeiro foi notificado para aprovar no painel.",
          whatsappUrl,
        });
        loadDashboardData();
      } else {
        setRescheduleFeedback({
          type: "error",
          msg: data.error || "Erro ao solicitar reagendamento.",
        });
      }
    } catch (_) {
      setRescheduleFeedback({
        type: "error",
        msg: "Falha de conexão ao solicitar reagendamento.",
      });
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const getStatusBadge = (aptStatus: string) => {
    switch (aptStatus) {
      case "COMPLETED":
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Concluído</span>;
      case "CANCELLED":
        return <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Cancelado</span>;
      case "RESCHEDULE_REQUESTED":
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Reagendamento Pendente</span>;
      case "CANCEL_REQUESTED":
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Cancelamento Solicitado</span>;
      default:
        return <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Confirmado</span>;
    }
  };

  const getMinDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#02050A] text-white selection:bg-blue-600 selection:text-white pb-16">
      {/* ── HEADER DO CLIENTE ── */}
      <header className="border-b border-white/5 bg-[#050B14]/90 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoMrBastos size={36} color="#3B82F6" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold">
                Painel do Cliente
              </p>
              <h1 className="text-xl font-serif text-white">{greeting}, {clientName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-blue-600/15 text-blue-400 border border-blue-500/30">
              <Star className="w-3 h-3 fill-blue-400" /> Cliente VIP
            </span>

            {/* BOTÃO VOLTAR AO SITE (SEM FAZER LOGOUT) */}
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              title="Voltar para a página inicial do site sem encerrar sua sessão"
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span className="hidden xs:inline">Voltar ao Site</span>
            </Link>

            {/* BOTÃO SAIR (LOGOUT) */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider p-2 rounded-lg hover:bg-white/5"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* FEEDBACK DE CANCELAMENTO */}
      {cancelFeedback && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            cancelFeedback.type === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200" : "bg-red-500/15 border-red-500/30 text-red-200"
          }`}>
            <div className="flex items-center gap-3">
              {cancelFeedback.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
              <p className="text-xs font-medium">{cancelFeedback.msg}</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {cancelFeedback.whatsappUrl && (
                <a
                  href={cancelFeedback.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#128C7E] transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Notificar no WhatsApp
                </a>
              )}
              <button
                onClick={() => setCancelFeedback(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {loading ? (
          <div className="py-24 text-center text-blue-400 animate-pulse font-serif text-lg tracking-widest uppercase">
            Carregando seus dados...
          </div>
        ) : (
          <>
            {/* ── CARD 1: DADOS DO CLIENTE ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-serif text-2xl font-bold">
                  {clientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif text-white">{clientName}</h2>
                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      Conta Ativa
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    WhatsApp: <span className="text-white font-mono">{clientPhone}</span> · E-mail: <span className="text-white">{clientEmail}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedServiceId(undefined);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:bg-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/20 shrink-0"
              >
                <Scissors className="w-4 h-4" /> + Novo Agendamento
              </button>
            </motion.div>

            {/* ── CARD 2: PRÓXIMO HORÁRIO DE SERVIÇO (SE HOUVER) ── */}
            {upcomingApt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600/20 via-white/[0.02] to-transparent border border-blue-500/40 rounded-3xl p-6 md:p-8 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                        Seu Próximo Horário Agendado
                      </span>
                      {getStatusBadge(upcomingApt.status)}
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-2">
                      {upcomingApt.service?.name} · R$ {upcomingApt.service?.price}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <strong>
                        {new Date(upcomingApt.date).toLocaleDateString("pt-BR")} às {getDisplayTime(upcomingApt.date)}
                      </strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Barbeiro responsável: <strong className="text-white">{upcomingApt.barber?.name || "Mr. Bastos (Dono)"}</strong> ·{" "}
                      <a
                        href="https://www.google.com/maps/place/Mr.+Bastos+Barbearia/@-12.1389992,-38.4158771,17z/data=!4m6!3m5!1s0x716bdf7b3e01493:0x5013ab0a9cf4df15!8m2!3d-12.1390859!4d-38.4132289!16s%2Fg%2F11rschcdpj?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-white underline transition-colors"
                        title="Abrir localização da barbearia no Google Maps"
                      >
                        Local: Hiper Gbarbosa, Alagoinhas BA (Ver no Mapa)
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    <button
                      onClick={() => handleContactBarber(upcomingApt.barber?.phone, upcomingApt.barber?.name)}
                      className="bg-[#25D366] text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        setRescheduleApt(upcomingApt);
                        setNewRescheduleDate("");
                        setNewRescheduleTime("");
                        setRescheduleFeedback(null);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" /> Reagendar
                    </button>

                    <button
                      onClick={() => handleClientCancel(upcomingApt)}
                      disabled={cancellingAptId === upcomingApt.id}
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── CARD 3: OPÇÃO DE REMARCAR / REPETIR ÚLTIMO CORTE ── */}
            {lastApt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    Último Atendimento Realizado
                  </span>
                  <h3 className="text-2xl font-serif text-white mt-1">
                    Quer repetir o mesmo corte?
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">
                    Você fez <strong className="text-white">{lastApt.service?.name}</strong> com <strong className="text-white">{lastApt.barber?.name || "Mr. Bastos"}</strong> no dia {new Date(lastApt.date).toLocaleDateString("pt-BR")}. Clique ao lado para agendar diretamente com ele.
                  </p>
                </div>

                <button
                  onClick={handleRebook}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:bg-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md shrink-0 hover:scale-[1.02]"
                >
                  <RotateCcw className="w-4 h-4" /> Remarcar Último Corte
                </button>
              </motion.div>
            )}

            {/* ── CARTÃO FIDELIDADE DIGITAL VIP MR. BASTOS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#101927] via-[#050B14] to-[#02050A] border-2 border-blue-500/40 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/40">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold">
                      Benefício Exclusivo
                    </p>
                    <h3 className="text-xl md:text-2xl font-serif text-white">
                      Cartão Fidelidade Digital Mr. Bastos
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                    ID VIP:
                  </span>
                  <p className="text-xs font-mono font-bold text-white tracking-widest">
                    MRB-{vipDigits}
                  </p>
                </div>
              </div>

              {/* Regra da promoção */}
              <p className="text-xs text-gray-300 font-light mb-6 relative z-10 leading-relaxed">
                🎉 <strong>A cada 9 cortes realizados, o 10º é por conta da casa!</strong> Apresente seu número no balcão ao finalizar para acumular selos.
              </p>

              {/* 10 Carimbos Visuais */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 mb-6 relative z-10">
                {Array.from({ length: 10 }).map((_, index) => {
                  const isFilled = index < loyalty.currentCuts;
                  const isTenth = index === 9;

                  return (
                    <div
                      key={index}
                      className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isFilled
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30 font-bold"
                          : isTenth
                          ? "bg-blue-600/10 border-dashed border-blue-500 text-blue-400"
                          : "bg-white/[0.02] border-white/10 text-gray-600"
                      }`}
                    >
                      {isFilled ? (
                        <>
                          <Scissors className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-mono">{index + 1}</span>
                        </>
                      ) : isTenth ? (
                        <>
                          <Sparkles className="w-4 h-4 mb-0.5 text-blue-400 animate-pulse" />
                          <span className="text-[8px] uppercase font-bold tracking-tighter">Grátis</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    Progresso: <strong className="text-white">{loyalty.currentCuts} de 10 cortes</strong>
                  </span>
                  <span className="text-blue-400 font-semibold">
                    Faltam apenas {10 - loyalty.currentCuts} cortes para o gratuito!
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600/80 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                    style={{ width: `${(loyalty.currentCuts / 10) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ── CARD 4: REGISTRO / HISTÓRICO DE SERVIÇOS ── */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif text-white">Registro de Serviços (Histórico)</h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    Todos os seus agendamentos e atendimentos registrados.
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {appointments.length} registros
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Nenhum corte registrado ainda. Faça seu primeiro agendamento acima!
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt: any) => {
                    const isUpcoming = new Date(apt.date) >= new Date() && apt.status !== "CANCELLED" && apt.status !== "COMPLETED";

                    return (
                      <div
                        key={apt.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-serif text-white">{apt.service?.name}</h4>
                              {getStatusBadge(apt.status)}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Barbeiro: <strong className="text-gray-300">{apt.barber?.name || "Mr. Bastos (Dono)"}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                          <div className="text-left md:text-right">
                            <p className="text-blue-400 font-mono text-sm font-bold">
                              R$ {apt.service?.price}
                            </p>
                            <p className="text-xs text-gray-300">
                              {new Date(apt.date).toLocaleDateString("pt-BR")} às {getDisplayTime(apt.date)}
                            </p>
                          </div>

                          {isUpcoming && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setRescheduleApt(apt);
                                  setNewRescheduleDate("");
                                  setNewRescheduleTime("");
                                  setRescheduleFeedback(null);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 flex items-center gap-1.5 transition-all"
                                title="Reagendar este horário"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Reagendar
                              </button>

                              <button
                                onClick={() => handleClientCancel(apt)}
                                disabled={cancellingAptId === apt.id}
                                className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                title="Cancelar agendamento"
                              >
                                <X className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── MODAL DE REAGENDAMENTO DO CLIENTE ── */}
      <AnimatePresence>
        {rescheduleApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleApt(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#050B14] border border-blue-500/30 rounded-3xl p-6 sm:p-8 z-10 shadow-2xl max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                    Solicitar Reagendamento
                  </p>
                  <h3 className="text-xl font-serif text-white mt-0.5">
                    {rescheduleApt.service?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setRescheduleApt(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
                <p className="text-gray-400">
                  Horário atual: <strong className="text-white">{new Date(rescheduleApt.date).toLocaleDateString("pt-BR")} às {getDisplayTime(rescheduleApt.date)}</strong>
                </p>
                <p className="text-gray-400">
                  Barbeiro: <strong className="text-white">{rescheduleApt.barber?.name || "Mr. Bastos"}</strong>
                </p>
                <p className="text-[11px] text-blue-400/90 pt-1">
                  💡 A solicitação será enviada para o painel do barbeiro e você poderá notificá-lo pelo WhatsApp.
                </p>
              </div>

              {rescheduleFeedback && (
                <div className={`p-4 rounded-xl border mb-4 text-xs space-y-2 ${
                  rescheduleFeedback.type === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200" : "bg-red-500/15 border-red-500/30 text-red-200"
                }`}>
                  <p className="font-semibold">{rescheduleFeedback.msg}</p>
                  {rescheduleFeedback.whatsappUrl && (
                    <a
                      href={rescheduleFeedback.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#128C7E] transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> Notificar Barbeiro no WhatsApp
                    </a>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmitReschedule} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Nova Data
                  </label>
                  <input
                    type="date"
                    min={getMinDateStr()}
                    value={newRescheduleDate}
                    onChange={(e) => setNewRescheduleDate(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  {newRescheduleDate && checkDayStatus(newRescheduleDate).isClosed && (
                    <p className="text-amber-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {checkDayStatus(newRescheduleDate).reason}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Novo Horário
                  </label>
                  {!newRescheduleDate ? (
                    <p className="text-xs text-gray-500 italic py-4 text-center border border-dashed border-white/10 rounded-xl">
                      Selecione uma nova data acima para carregar os horários livres.
                    </p>
                  ) : checkDayStatus(newRescheduleDate).isClosed ? (
                    <p className="text-xs text-amber-400 italic py-4 text-center border border-dashed border-amber-500/20 rounded-xl bg-amber-500/5">
                      Barbearia fechada nesta data. Por favor, selecione outro dia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                      {rescheduleAvailableTimes.length === 0 ? (
                        <p className="text-xs text-gray-500 col-span-3 py-4 text-center">
                          Nenhum horário disponível para esta data.
                        </p>
                      ) : (
                        rescheduleAvailableTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setNewRescheduleTime(time)}
                            className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                              newRescheduleTime === time
                                ? "border-blue-500 bg-blue-600 text-white shadow-md"
                                : "border-white/10 text-gray-300 hover:border-white/30 bg-white/[0.02]"
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRescheduleApt(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs uppercase tracking-wider font-semibold hover:bg-white/5 transition-all"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(isSubmittingReschedule || !newRescheduleDate || !newRescheduleTime || (newRescheduleDate ? checkDayStatus(newRescheduleDate).isClosed : false))}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isSubmittingReschedule ? "Enviando..." : "Confirmar Solicitação"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadDashboardData();
        }}
        initialServiceId={selectedServiceId}
        initialUserData={clientData}
      />
    </div>
  );
}
