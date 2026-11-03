"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { TrendingUp, Users, Scissors, Clock, ChevronRight, CheckCircle, Clock3, X, Shield, DollarSign, Wallet, Award, ArrowUpRight, Lock, CreditCard, Banknote, Sparkles, Calendar, Power, CheckCircle2, MessageCircle, AlertCircle, Edit3, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BARBERS, BarberData } from "@/lib/barbers";
import { OFFICIAL_SERVICES, ServiceItem } from "@/lib/services";
import { getDisplayTime } from "@/lib/timezone";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "ADMIN";
  const userBarberId = (session?.user as any)?.barberId;
  const userName = session?.user?.name || "Gestor";
  const isAdmin = userRole === "ADMIN";

  const [dashboardData, setDashboardData] = useState<any>({
    revenue: 0,
    totalGrossShop: 0,
    houseNetProfit: 0,
    totalEmployeeCommissions: 0,
    myCommission: 0,
    houseShare: 0,
    todayCount: 0,
    completedCount: 0,
    clientsCount: 0,
    appointments: [] as any[],
    barberBreakdown: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  
  // Modal de cliente balcão
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(OFFICIAL_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("corte");
  const [walkInClientName, setWalkInClientName] = useState<string>("Cliente Balcão");
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
  const [walkInBarberId, setWalkInBarberId] = useState<string>(() => userBarberId || "barbeiro-dono");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userBarberId) {
      setWalkInBarberId(userBarberId);
    }
  }, [userBarberId]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Filtros
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>("all");

  // Disponibilidade do Dono (Escala Flexível / 4x4)
  const [isOwnerAvailable, setIsOwnerAvailable] = useState(true);
  const [isTogglingOwner, setIsTogglingOwner] = useState(false);

  // Modal de Cancelamento por Imprevisto com WhatsApp
  const [cancellingApt, setCancellingApt] = useState<any | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<"imprevisto" | "ajuste" | "cliente">("imprevisto");
  const [customCancelMsg, setCustomCancelMsg] = useState("");
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [cancelSuccessWhatsappUrl, setCancelSuccessWhatsappUrl] = useState<string | null>(null);

  // Carrega status da escala 4x4 do dono
  useEffect(() => {
    fetch('/api/barbers?all=true')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.barbers || []);
        const owner = list.find((b: any) => b.id === "barbeiro-dono");
        if (owner) {
          setIsOwnerAvailable(owner.isAvailable !== false);
        }
      })
      .catch(() => {});
  }, []);

  const toggleOwnerAvailability = async () => {
    setIsTogglingOwner(true);
    const newStatus = !isOwnerAvailable;
    try {
      const res = await fetch('/api/barbers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: "barbeiro-dono", isAvailable: newStatus })
      });
      if (res.ok) {
        setIsOwnerAvailable(newStatus);
        setToastMessage(newStatus 
          ? "Mr. Bastos está ATIVO no site! Clientes podem agendar com ele."
          : "Mr. Bastos está em FOLGA da escala 4x4 (ocultado do agendamento online).");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingOwner(false);
    }
  };

  const getCancelMessage = (apt: any, preset: "imprevisto" | "ajuste" | "cliente") => {
    const barberName = BARBERS.find(b => b.id === apt.barberId)?.name.split(" ")[0] || "Mr. Bastos";
    const aptTime = getDisplayTime(apt.date);
    const aptDate = apt.date ? apt.date.substring(0, 10).split("-").reverse().join("/") : "";
    const clientName = apt.user?.name || "Cliente";

    if (preset === "imprevisto") {
      return `Olá, ${clientName}! Sou o ${barberName} da Mr. Bastos Barbearia. Tive um imprevisto urgente hoje e precisei cancelar o seu horário das ${aptTime} (${aptDate}). Peço sinceras desculpas pelo ocorrido! Poderíamos reagendar para um outro horário ou dia que fique bom para você?`;
    } else if (preset === "ajuste") {
      return `Olá, ${clientName}! Informamos que seu horário das ${aptTime} (${aptDate}) na Mr. Bastos Barbearia precisou ser cancelado para ajuste da nossa escala de atendimento. O horário já está liberado caso queira remarcar pelo site ou por aqui!`;
    } else {
      return `Olá, ${clientName}! Confirmamos o cancelamento do seu agendamento no Mr. Bastos Barbearia para o dia ${aptDate} às ${aptTime}. Estamos à disposição para quando desejar agendar um novo atendimento!`;
    }
  };

  const openCancelModal = (apt: any) => {
    setCancellingApt(apt);
    setCancelReasonPreset("imprevisto");
    setCustomCancelMsg(getCancelMessage(apt, "imprevisto"));
    setCancelSuccessWhatsappUrl(null);
  };

  const handleChangeCancelPreset = (preset: "imprevisto" | "ajuste" | "cliente") => {
    setCancelReasonPreset(preset);
    if (cancellingApt) {
      setCustomCancelMsg(getCancelMessage(cancellingApt, preset));
    }
  };

  const handleConfirmCancelWithWhatsApp = async (openWhatsApp: boolean = true) => {
    if (!cancellingApt) return;
    setIsProcessingCancel(true);
    try {
      await updateStatus(cancellingApt.id, "CANCELLED");
      setToastMessage(`Agendamento de ${cancellingApt.user?.name || "Cliente"} cancelado. Horário liberado na agenda!`);
      
      const phoneDigits = (cancellingApt.user?.phone || "").replace(/\D/g, "");
      if (phoneDigits && openWhatsApp) {
        const cleanPhone = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customCancelMsg)}`;
        setCancelSuccessWhatsappUrl(whatsappUrl);
        try {
          window.open(whatsappUrl, "_blank");
        } catch (_) {}
      } else {
        setCancellingApt(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const bFilter = isAdmin ? selectedBarberFilter : (userBarberId || "barbeiro-nando");
      const res = await fetch(`/api/dashboard?date=${selectedDate}&barberId=${bFilter}`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (e) {
      console.error("Erro ao carregar dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedDate, selectedBarberFilter, userRole]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const submitWalkIn = async (overrideServiceId?: string) => {
    setIsSubmitting(true);
    try {
      const targetBarber = isAdmin ? walkInBarberId : (userBarberId || "barbeiro-nando");
      const serviceToUse = OFFICIAL_SERVICES.find(s => s.id === (overrideServiceId || selectedServiceId)) || OFFICIAL_SERVICES[0];
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceToUse.id, 
          barberId: targetBarber, 
          date: `${selectedDate}T${timeStr}-03:00`, 
          isWalkIn: true,
          status: "COMPLETED",
          clientName: walkInClientName.trim() || "Cliente Balcão",
          paymentMethod,
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setWalkInClientName("Cliente Balcão");
        await fetchDashboard();
        const bObj = BARBERS.find(b => b.id === targetBarber);
        const barberFirstName = bObj ? bObj.name.split(" ")[0] : "Barbeiro";
        setToastMessage(`Atendimento de R$ ${serviceToUse.price.toFixed(2)} registrado com sucesso no caixa de ${barberFirstName}!`);
      }
    } catch (e) {
      console.error("Erro ao registrar balcão:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-pulse text-blue-400 font-serif text-lg tracking-widest uppercase">
          Carregando Painel de Gestão...
        </div>
      </div>
    );
  }

  const selectedBarberObj = BARBERS.find((b) => b.id === (isAdmin ? selectedBarberFilter : userBarberId));
  const isSelectedBarberOwner = selectedBarberObj?.role === "ADMIN";

  const activeChosenService = OFFICIAL_SERVICES.find(s => s.id === selectedServiceId) || OFFICIAL_SERVICES[0];
  const targetBarberForCalc = BARBERS.find(b => b.id === (isAdmin ? walkInBarberId : (userBarberId || "barbeiro-nando"))) || BARBERS[0];
  const isTargetBarberOwner = targetBarberForCalc.role === "ADMIN";
  const commissionPreview = isTargetBarberOwner ? activeChosenService.price : activeChosenService.price * 0.45;
  const housePreview = isTargetBarberOwner ? 0 : activeChosenService.price * 0.55;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 relative">
      {/* Toast de Confirmação Instantânea */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-[160] bg-[#050B14] border-2 border-emerald-500 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Caixa Atualizado
              </p>
              <p className="text-gray-200 text-xs mt-0.5 leading-snug">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── BARRA SUPERIOR: IDENTIDADE DO BARBEIRO E SELETOR DE GESTÃO ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20">
                <Shield className="w-3 h-3" /> Painel do Dono / ADM
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Scissors className="w-3 h-3" /> Painel do Barbeiro · Comissão 45%
              </span>
            )}
            <span className="text-gray-400 text-xs font-light">
              Usuário logado: <strong className="text-white">{userName}</strong>
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-white mt-2">
            {isAdmin 
              ? (selectedBarberFilter === "all" ? "Visão Geral de Toda a Barbearia" : `Gestão de ${selectedBarberObj?.name}`)
              : `Meus Atendimentos & Comissões`}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isAdmin 
              ? "Acompanhamento do faturamento geral, lucro retido da casa e comissões de 45% da equipe."
              : "Seu faturamento bruto e comissão de 45% calculados automaticamente a cada atendimento concluído."}
          </p>
        </div>

        {/* Controles de Filtro: Data e Barbeiro (Dono) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Seletor de Barbeiro Exclusivo do Dono */}
          {isAdmin && (
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSelectedBarberFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === "all" ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-white"}`}
              >
                Todos (Geral)
              </button>
              {BARBERS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberFilter(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === b.id ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-white"}`}
                >
                  {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}

          {/* Filtro por data */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          {/* Botão Balcão */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:bg-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Scissors className="w-3.5 h-3.5" /> + Cliente Balcão
          </button>
        </div>
      </div>

      {/* ── CARD DE DISPONIBILIDADE DO DONO (ESCALA FLEXÍVEL / 4X4) ── */}
      {isAdmin && (
        <div className="p-5 md:p-6 bg-[#050B14] border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isOwnerAvailable 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/20" 
                : "bg-white/5 text-gray-500 border-white/10"
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                  Escala 4x4 / Flexível
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOwnerAvailable 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}>
                  {isOwnerAvailable ? "Disponível no Site" : "Oculto dos Clientes"}
                </span>
              </div>
              <h3 className="text-lg font-serif text-white mt-0.5">
                Disponibilidade de Mr. Bastos (Dono) para Agendamentos
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                {isOwnerAvailable 
                  ? "Ativo no site: Clientes podem selecionar Mr. Bastos na lista pública de barbeiros." 
                  : "Folga da escala 4x4: Mr. Bastos foi ocultado da lista pública de agendamento online."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleOwnerAvailability}
            disabled={isTogglingOwner}
            className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shrink-0 ${
              isOwnerAvailable
                ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:brightness-110"
                : "bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10"
            }`}
          >
            {isTogglingOwner ? (
              <span>Atualizando...</span>
            ) : isOwnerAvailable ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Trabalhando Hoje (Ativo)</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4 text-gray-400" />
                <span>Folga / Desativado (Ativar)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── BENTO GRID DE CARDS PRINCIPAIS (COMISSÕES & FATURAMENTO) ── */}
      {isAdmin && selectedBarberFilter === "all" ? (
        /* VISÃO GERAL DO DONO (TODOS) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Faturamento Bruto Total */}
          <div className="bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Faturamento Bruto</p>
                <h3 className="text-3xl font-serif text-white mt-1">
                  R$ {Number(dashboardData.totalGrossShop || dashboardData.revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Soma de todos os cortes realizados na barbearia hoje.</p>
          </div>

          {/* Lucro Líquido da Casa */}
          <div className="bg-emerald-500/[0.08] border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Retido pela Casa
                  </span>
                </div>
                <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Lucro Líquido Barbearia</p>
                <h3 className="text-3xl font-serif text-emerald-400 mt-1">
                  R$ {Number(dashboardData.houseNetProfit || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 relative z-10">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-400/80 relative z-10">Dono 100% + 55% sobre a produção dos funcionários.</p>
          </div>

          {/* Comissões a Pagar aos Funcionários (45%) */}
          <div className="bg-blue-600/10 border border-blue-500/40 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 blur-2xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Repasse 45%
                  </span>
                </div>
                <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Comissões da Equipe</p>
                <h3 className="text-3xl font-serif text-blue-400 mt-1">
                  R$ {Number(dashboardData.totalEmployeeCommissions || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 relative z-10">
                <Scissors className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-400 relative z-10">Valor total a pagar aos barbeiros funcionários hoje.</p>
          </div>

          {/* Cortes Realizados */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Atendimentos</p>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-serif text-white">{dashboardData.completedCount || 0} <span className="text-sm font-sans text-gray-400">concluídos</span></p>
              <p className="text-xs text-gray-500 mt-1">{dashboardData.todayCount || 0} agendados para a data</p>
            </div>
          </div>
        </div>
      ) : (
        /* VISÃO INDIVIDUAL (BARBEIRO FUNCIONÁRIO OU DONO ESPECÍFICO) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card Principal: Comissão Líquida do Barbeiro */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-600/20 via-[#050B14] to-blue-600/5 border-2 border-blue-500/50 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    {isSelectedBarberOwner ? "100% Dono" : "Comissão Oficial: 45%"}
                  </span>
                </div>
                <p className="text-gray-300 text-xs tracking-[0.2em] uppercase font-semibold">
                  {isSelectedBarberOwner ? "Recebimento do Dono (100%)" : "Minha Comissão Líquida a Receber"}
                </p>
                <h3 className="text-4xl md:text-5xl font-serif text-blue-400 mt-2 font-bold tracking-tight">
                  R$ {Number(dashboardData.myCommission || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-xl relative z-10">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-white bg-white/5 border border-white/10 w-fit px-3.5 py-1.5 rounded-xl text-xs font-medium relative z-10">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {isSelectedBarberOwner
                  ? "Como proprietário, você recebe 100% de seus atendimentos."
                  : "Você recebe 45% de cada serviço concluído no seu nome."}
              </span>
            </div>
          </div>

          {/* Produção Bruta */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Produção Bruta (100%)</p>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                <Scissors className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-serif text-white">
                R$ {Number(dashboardData.revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Valor integral dos seus cortes</p>
            </div>
          </div>

          {/* Repasse da Barbearia (55%) ou Contagem */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">
                {isSelectedBarberOwner ? "Atendimentos Concluídos" : "Repasse Barbearia (55%)"}
              </p>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                {isSelectedBarberOwner ? <CheckCircle className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
              </div>
            </div>
            <div>
              {isSelectedBarberOwner ? (
                <>
                  <p className="text-3xl font-serif text-white">{dashboardData.completedCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">De {dashboardData.todayCount || 0} agendados</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-serif text-gray-300">
                    R$ {Number(dashboardData.houseShare || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Estrutura e espaço da barbearia</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VISÃO DO DONO: FLUXO E REPARTIÇÃO POR FUNCIONÁRIO (COMISSÕES 45%) ── */}
      {isAdmin && selectedBarberFilter === "all" && (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif text-white">Desempenho da Equipe & Repasse de Comissões</h3>
                <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  Regra 45% / 55%
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light mt-1">
                Acompanhe a produção bruta de cada profissional, o valor exato a pagar (45%) e a fatia retida pela barbearia (55%).
              </p>
            </div>
            <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
              3 Profissionais Ativos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BARBERS.map((barber) => {
              const bStats = dashboardData.barberBreakdown?.find((b: any) => b.id === barber.id) || {
                totalApts: 0,
                completedApts: 0,
                revenue: 0,
                commission: 0,
                houseShare: 0,
              };
              const isOwner = barber.role === "ADMIN";

              return (
                <div 
                  key={barber.id}
                  onClick={() => setSelectedBarberFilter(barber.id)}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full bg-cover bg-center border border-white/20 shrink-0"
                        style={{ backgroundImage: `url(${barber.avatar})` }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-serif text-white group-hover:text-blue-400 transition-colors">
                            {barber.name}
                          </h4>
                          {isOwner ? (
                            <span className="text-[9px] bg-gradient-to-r from-blue-700 to-blue-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                              Dono (100%)
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                              Comissão 45%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">{barber.phoneDisplay}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Produção Bruta:</span>
                        <span className="text-white font-mono font-bold text-sm">
                          R$ {Number(bStats.revenue || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Repasse de comissão */}
                      <div className="flex justify-between items-center text-xs bg-white/[0.02] p-2 rounded-xl">
                        <span className="text-gray-400">
                          {isOwner ? "Faturamento Próprio:" : "Comissão a Pagar (45%):"}
                        </span>
                        <span className="text-blue-400 font-mono font-bold">
                          R$ {Number(bStats.commission || 0).toFixed(2)}
                        </span>
                      </div>

                      {!isOwner && (
                        <div className="flex justify-between items-center text-xs bg-emerald-500/[0.04] p-2 rounded-xl border border-emerald-500/10">
                          <span className="text-emerald-400/90">Lucro Barbearia (55%):</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            + R$ {Number(bStats.houseShare || 0).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs pt-1 text-gray-400">
                        <span>Cortes Finalizados:</span>
                        <span className="text-white font-semibold">
                          {bStats.completedApts} de {bStats.totalApts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                    <span>Filtrar agenda exclusiva</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ALERTA DE AGENDAMENTOS FUTUROS (PRÓXIMOS DIAS) ── */}
      {dashboardData.upcomingAppointments?.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600/10 via-white/[0.02] to-transparent border border-blue-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Próximos Agendamentos Confirmados</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {dashboardData.upcomingAppointments.length} agendado{dashboardData.upcomingAppointments.length > 1 ? "s" : ""}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Próximo cliente: <strong className="text-white">{dashboardData.upcomingAppointments[0]?.user?.name || "Cliente"}</strong> em {new Date(dashboardData.upcomingAppointments[0]?.date).toLocaleDateString("pt-BR")} às {new Date(dashboardData.upcomingAppointments[0]?.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ({dashboardData.upcomingAppointments[0]?.service?.name})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const nextDate = new Date(dashboardData.upcomingAppointments[0]?.date).toISOString().split("T")[0];
              setSelectedDate(nextDate);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-[#050B14] text-xs font-semibold uppercase tracking-wider transition-all duration-300 border border-blue-500/40 flex items-center gap-2 shrink-0"
          >
            <span>Ver na Agenda</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── LISTA DE AGENDAMENTOS DO DIA ── */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-xl font-serif text-white">
              Agendamentos do Dia ({selectedDate.split("-").reverse().join("/")})
            </h3>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              {isAdmin && selectedBarberFilter === "all"
                ? "Exibindo todos os cortes distribuídos entre os barbeiros."
                : `Exibindo somente atendimentos de ${selectedBarberObj?.name || "este barbeiro"}.`}
            </p>
          </div>

          <span className="text-xs text-gray-500 font-mono">
            {dashboardData.appointments?.length || 0} registros
          </span>
        </div>

        {dashboardData.appointments?.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum agendamento encontrado para esta data ou barbeiro selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            {dashboardData.appointments?.map((apt: any) => {
              const barberInfo = BARBERS.find(b => b.id === apt.barberId) || BARBERS[0];
              const aptTime = getDisplayTime(apt.date);
              const isOwnerCut = barberInfo.role === "ADMIN";
              const cutPrice = Number(apt.service?.price || 0);
              const barberCutShare = isOwnerCut ? cutPrice : cutPrice * 0.45;

              return (
                <div 
                  key={apt.id}
                  className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/15 transition-all overflow-hidden"
                >
                  {/* Horário, Cliente e Serviço */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#050B14] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-light">HORA</span>
                      <span className="text-xs sm:text-sm font-bold text-blue-400">{aptTime}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-serif text-white truncate">
                          {apt.user?.name || "Cliente"}
                        </h4>
                        {/* Tag do Barbeiro Responsável */}
                        {isAdmin && selectedBarberFilter === "all" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/5 border border-white/10 text-gray-300 shrink-0">
                            ✂️ {barberInfo.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{apt.service?.name} · <strong className="text-white">R$ {cutPrice.toFixed(2)}</strong></span>
                        <span className="text-blue-400">
                          Comissão: R$ {barberCutShare.toFixed(2)} ({isOwnerCut ? "100%" : "45%"})
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                        WhatsApp: {apt.user?.phone || "Não informado"}
                      </p>
                    </div>
                  </div>

                  {/* Status e Ações - Totalmente responsivo para celular sem estourar a tela */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-white/5">
                    {/* Linha 1 no celular: Status + WhatsApp */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        apt.status === "COMPLETED" 
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                          : apt.status === "CONFIRMED"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : apt.status === "CANCELLED"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {apt.status === "COMPLETED" ? "Concluído" : apt.status === "CONFIRMED" ? "Confirmado" : apt.status === "CANCELLED" ? "Cancelado" : "Pendente"}
                      </span>

                      {/* Botão de contato no WhatsApp do cliente */}
                      {apt.user?.phone && (
                        <a
                          href={`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${apt.user.name}! Sou o ${barberInfo.name} da Mr. Bastos Barbearia. Confirmando seu horário para hoje às ${aptTime}!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shrink-0"
                          title="Enviar mensagem no WhatsApp do cliente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Linha 2 no celular: Botões de Ação para os Barbeiros e Dono */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                      {apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && (
                        <button 
                          onClick={() => updateStatus(apt.id, "COMPLETED")}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 text-xs font-semibold transition-all shadow-sm shrink-0"
                        >
                          Concluir<span className="hidden sm:inline"> Corte</span>
                        </button>
                      )}

                      {apt.status === "PENDING" && (
                        <button 
                          onClick={() => updateStatus(apt.id, "CONFIRMED")}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-300 text-xs font-semibold transition-all shrink-0"
                        >
                          Confirmar
                        </button>
                      )}

                      {/* Botão Cancelar com Destaque e Redirecionamento WhatsApp */}
                      {apt.status !== "CANCELLED" && (
                        <button 
                          onClick={() => openCancelModal(apt)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm shrink-0"
                          title="Cancelar atendimento por imprevisto e avisar cliente no WhatsApp"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: CLIENTE BALCÃO (WALK-IN) COM TODAS AS 9 OPÇÕES DE SERVIÇOS E PROSSEGUIR ── */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop escuro e com blur profundo para isolar totalmente o modal do header */}
            <div 
              className="fixed inset-0 bg-[#02050A]/95 backdrop-blur-2xl transition-opacity duration-300" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-[#050B14] border border-blue-500/40 rounded-3xl p-6 md:p-8 z-10 shadow-[0_30px_100px_rgba(0,0,0,0.95)] max-h-[88vh] flex flex-col my-auto"
            >
              {/* Cabeçalho */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      Lançamento no Caixa
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-white mt-1">Lançar Cliente Balcão</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Selecione o serviço prestado e confirme para computar a comissão.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo com Scroll */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                {/* 1. Escolha ou Trava do Barbeiro */}
                <div>
                  {isAdmin ? (
                    <>
                      <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                        Barbeiro Responsável
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {BARBERS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setWalkInBarberId(b.id)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${walkInBarberId === b.id ? "border-blue-500 bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md" : "border-white/10 text-gray-300 hover:border-white/30"}`}
                          >
                            <span>{b.name.split(" ")[0]}</span>
                            <span className="text-[10px] opacity-80">({b.role === "ADMIN" ? "100%" : "45%"})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Barbeiro Atendente</p>
                        <p className="text-sm font-serif text-white font-medium">{userName}</p>
                      </div>
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        Sua Comissão: 45%
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Seleção do Serviço (Grade Interativa) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-400 text-xs uppercase tracking-wider font-medium">
                      1. Selecione o Serviço Prestado
                    </label>
                    <span className="text-[11px] text-blue-400">
                      {activeChosenService.name} (R$ {activeChosenService.price.toFixed(2)})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {OFFICIAL_SERVICES.map((s) => {
                      const isSelected = s.id === selectedServiceId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedServiceId(s.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected 
                              ? "border-blue-500 bg-blue-600/15 shadow-lg shadow-blue-500/15 ring-1 ring-blue-500" 
                              : "border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                              isSelected ? "border-blue-500 bg-gradient-to-r from-blue-700 to-blue-600 text-white" : "border-white/20 text-transparent"
                            }`}>
                              ✓
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white text-xs font-semibold">{s.name}</span>
                                {s.isCombo && (
                                  <span className="text-[8px] bg-blue-600/20 text-blue-400 px-1 py-0.2 rounded font-bold uppercase">
                                    Combo
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500">{s.duration} min</p>
                            </div>
                          </div>
                          <span className="text-blue-400 font-mono font-bold text-xs">R$ {s.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Forma de Pagamento */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                    2. Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "PIX", label: "PIX", icon: Sparkles },
                      { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
                      { id: "CARTAO_DEBITO", label: "Débito", icon: CreditCard },
                      { id: "CARTAO_CREDITO", label: "Crédito", icon: CreditCard },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === m.id
                            ? "border-blue-500 bg-blue-600/20 text-blue-400 font-bold"
                            : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <m.icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Nome do Cliente (Opcional) */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5 font-medium">
                    3. Nome ou Identificação (Opcional)
                  </label>
                  <input
                    type="text"
                    value={walkInClientName}
                    onChange={(e) => setWalkInClientName(e.target.value)}
                    placeholder="Cliente Balcão"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 5. Demonstrativo da Comissão e Fechamento */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">Valor Integral do Atendimento:</span>
                    <strong className="text-white font-mono text-sm">R$ {activeChosenService.price.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-400">
                      {isTargetBarberOwner ? "Recebimento do Dono (100%):" : `Comissão do Barbeiro (${targetBarberForCalc.name.split(" ")[0]} - 45%):`}
                    </span>
                    <strong className="text-blue-400 font-mono text-sm">
                      R$ {commissionPreview.toFixed(2)}
                    </strong>
                  </div>
                  {!isTargetBarberOwner && (
                    <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1 border-t border-white/10">
                      <span>Repasse da Barbearia (55%):</span>
                      <span className="font-mono">R$ {housePreview.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação no Rodapé */}
              <div className="pt-4 border-t border-white/10 shrink-0 space-y-2">
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={() => submitWalkIn()}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-white text-[#050B14] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#050B14] border-t-transparent rounded-full animate-spin" />
                      <span>Lançando no Caixa...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Prosseguir e Concluir Venda (R$ {activeChosenService.price.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full text-center text-[11px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-1"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* ── MODAL DE CANCELAMENTO POR IMPREVISTO COM REDIRECIONAMENTO WHATSAPP ── */}
      <AnimatePresence>
        {cancellingApt && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingApt(null)}
              className="absolute inset-0 bg-[#02050A]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#050B14] border border-red-500/40 rounded-3xl p-6 sm:p-8 z-10 shadow-2xl text-white space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-red-400">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Cancelar Atendimento</h3>
                    <p className="text-[11px] text-gray-400">Liberar horário na agenda e notificar cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => setCancellingApt(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informações do Agendamento */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cliente:</span>
                  <strong className="text-white">{cancellingApt.user?.name || "Cliente"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Serviço:</span>
                  <span className="text-gray-200">{cancellingApt.service?.name} (R$ {cancellingApt.service?.price})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Horário Marcado:</span>
                  <strong className="text-blue-400 font-mono">{getDisplayTime(cancellingApt.date)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp:</span>
                  <span className="text-gray-200 font-mono">{cancellingApt.user?.phone || "Não informado"}</span>
                </div>
              </div>

              {/* Seletor de Motivo / Mensagem */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Motivo do Cancelamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChangeCancelPreset("imprevisto")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      cancelReasonPreset === "imprevisto"
                        ? "border-red-500 bg-red-500/20 text-red-200 shadow-md"
                        : "border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    🚨 Imprevisto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeCancelPreset("ajuste")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      cancelReasonPreset === "ajuste"
                        ? "border-blue-500 bg-blue-500/20 text-blue-200 shadow-md"
                        : "border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    ⚖️ Ajuste Agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeCancelPreset("cliente")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      cancelReasonPreset === "cliente"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-md"
                        : "border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    👤 A Pedido
                  </button>
                </div>
              </div>

              {/* Mensagem a ser enviada no WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
                  <span>Mensagem para o WhatsApp do Cliente:</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Editável</span>
                </label>
                <textarea
                  rows={3}
                  value={customCancelMsg}
                  onChange={(e) => setCustomCancelMsg(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white text-xs leading-relaxed focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Link de Sucesso do WhatsApp (caso popup tenha sido bloqueado) */}
              {cancelSuccessWhatsappUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
                  <span>Horário liberado no sistema!</span>
                  <a
                    href={cancelSuccessWhatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 hover:bg-[#128C7E] transition-all shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Abrir WhatsApp Agora
                  </a>
                </div>
              )}

              {/* Ações */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancellingApt(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs uppercase tracking-wider font-semibold hover:bg-white/5 transition-all text-center"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmCancelWithWhatsApp(false)}
                  disabled={isProcessingCancel}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 text-center"
                >
                  Apenas Liberar Horário
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmCancelWithWhatsApp(true)}
                  disabled={isProcessingCancel}
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 disabled:opacity-50 text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isProcessingCancel ? "Cancelando..." : "Cancelar & Abrir WhatsApp"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
