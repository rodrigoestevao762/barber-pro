"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, CheckCircle, User, Plus, X, Phone, MessageCircle, 
  Scissors, Shield, ChevronRight, Edit3, AlertCircle, Check, RotateCcw, 
  Power, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BARBERS, BarberData } from '@/lib/barbers';
import { OFFICIAL_SERVICES, ServiceItem } from '@/lib/services';
import { getDisplayTime, parseBrazilDateTime } from '@/lib/timezone';
import { checkDayStatus } from '@/lib/holidays';

export default function AgendaPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "ADMIN";
  const userBarberId = (session?.user as any)?.barberId;
  const userName = session?.user?.name || "Barbeiro";
  const isAdmin = userRole === "ADMIN";

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Modal Novo Agendamento (Balcão / Manual)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newServiceId, setNewServiceId] = useState(OFFICIAL_SERVICES[0].id);
  const [newBarberId, setNewBarberId] = useState(userBarberId || "barbeiro-dono");
  const [newTime, setNewTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrorMsg, setCreateErrorMsg] = useState("");

  // Modal Alterar / Editar Agendamento
  const [editingApt, setEditingApt] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editBarberId, setEditBarberId] = useState("");
  const [editServiceId, setEditServiceId] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Modal de Cancelamento por Imprevisto com Notificação WhatsApp
  const [cancellingApt, setCancellingApt] = useState<any | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<"imprevisto" | "ajuste" | "cliente">("imprevisto");
  const [customCancelMsg, setCustomCancelMsg] = useState("");
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [cancelSuccessWhatsappUrl, setCancelSuccessWhatsappUrl] = useState<string | null>(null);

  const getCancelMessage = (apt: any, preset: "imprevisto" | "ajuste" | "cliente") => {
    const barberName = BARBERS.find(b => b.id === apt.barberId)?.name.split(" ")[0] || "Mr. Bastos";
    const aptTime = getDisplayTime(apt.date);
    const aptDate = apt.date ? apt.date.substring(0, 10).split("-").reverse().join("/") : selectedDate.split("-").reverse().join("/");
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

  // Carrega status de disponibilidade dos barbeiros
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingOwner(false);
    }
  };

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const bFilter = isAdmin ? selectedBarberFilter : (userBarberId || "barbeiro-nando");
      const res = await fetch(`/api/dashboard?date=${selectedDate}&barberId=${bFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [selectedDate, selectedBarberFilter, userRole]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/dashboard`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchAgenda();
    } catch (e) {}
  };

  const handleOwnerCancel = async (apt: any) => {
    if (!confirm(`Deseja realmente cancelar o atendimento de ${apt.user?.name || "Cliente"}? Isso liberará o horário imediatamente.`)) {
      return;
    }
    await updateStatus(apt.id, 'CANCELLED');
    
    // Abre WhatsApp opcional para informar o cliente do cancelamento
    if (apt.user?.phone) {
      const barberName = BARBERS.find(b => b.id === apt.barberId)?.name || "Mr. Bastos";
      const dateFormatted = selectedDate.split("-").reverse().join("/");
      const timeFormatted = getDisplayTime(apt.date);
      const msg = `Olá, ${apt.user.name}! Informamos que seu agendamento no Mr. Bastos Barbearia para o dia ${dateFormatted} às ${timeFormatted} foi cancelado. Se desejar, você pode escolher um novo horário diretamente no nosso site a qualquer momento!`;
      window.open(`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // Abrir Modal de Edição
  const openEditModal = (apt: any) => {
    setEditingApt(apt);
    const dayStr = apt.date ? apt.date.substring(0, 10) : selectedDate;
    setEditDate(dayStr);
    setEditTime(getDisplayTime(apt.date));
    setEditBarberId(apt.barberId || "barbeiro-dono");
    setEditServiceId(apt.service?.id || OFFICIAL_SERVICES[0].id);
    setEditSuccessMsg("");
    setEditErrorMsg("");
  };

  // Salvar Edição do Agendamento pelo Dono/Barbeiro
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;

    // Valida dia de fechamento
    const dayCheck = checkDayStatus(editDate);
    if (dayCheck.isClosed) {
      setEditErrorMsg(dayCheck.reason);
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMsg("");

    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingApt.id,
          date: editDate,
          time: editTime,
          barberId: editBarberId,
          serviceId: editServiceId,
          status: 'CONFIRMED',
        })
      });

      if (res.ok) {
        setEditSuccessMsg("Horário alterado com sucesso! O novo horário já está registrado.");
        fetchAgenda();
        setTimeout(() => {
          setEditingApt(null);
        }, 1200);
      } else {
        const data = await res.json();
        setEditErrorMsg(data.error || "Erro ao salvar alterações.");
      }
    } catch (err: any) {
      setEditErrorMsg("Erro de comunicação ao salvar.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Aprovação / Recusa de Reagendamento solicitado pelo cliente
  const handleApproveReschedule = async (apt: any) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apt.id, action: "APPROVE_RESCHEDULE" })
      });
      if (res.ok) {
        fetchAgenda();
        if (apt.user?.phone) {
          const barberName = BARBERS.find(b => b.id === apt.barberId)?.name || "Mr. Bastos";
          const newTimeDisplay = apt.requestedDate ? getDisplayTime(apt.requestedDate) : "";
          const newDateDisplay = apt.requestedDate ? apt.requestedDate.substring(0, 10).split("-").reverse().join("/") : "";
          const msg = `Olá, ${apt.user.name}! Seu pedido de reagendamento no Mr. Bastos Barbearia para o dia ${newDateDisplay} às ${newTimeDisplay} foi APROVADO com sucesso! Te esperamos no horário marcado.`;
          window.open(`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, '_blank');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectReschedule = async (apt: any) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apt.id, action: "REJECT_RESCHEDULE" })
      });
      if (res.ok) {
        fetchAgenda();
        if (apt.user?.phone) {
          const barberName = BARBERS.find(b => b.id === apt.barberId)?.name || "Mr. Bastos";
          const msg = `Olá, ${apt.user.name}! Infelizmente não foi possível aprovar o reagendamento solicitado para aquele horário. Seu agendamento original permanece ativo. Entre em contato para alinharmos outro horário!`;
          window.open(`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, '_blank');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Aprovação / Recusa de Cancelamento solicitado pelo cliente (+30 min)
  const handleApproveCancel = async (apt: any) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apt.id, action: "APPROVE_CANCEL" })
      });
      if (res.ok) {
        fetchAgenda();
        if (apt.user?.phone) {
          const msg = `Olá, ${apt.user.name}! Confirmamos a aprovação do seu cancelamento no Mr. Bastos Barbearia. O horário foi liberado. Quando desejar agendar um novo atendimento, estaremos à disposição!`;
          window.open(`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, '_blank');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectCancel = async (apt: any) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apt.id, action: "REJECT_CANCEL" })
      });
      if (res.ok) fetchAgenda();
    } catch (e) {
      console.error(e);
    }
  };

  // Criar agendamento manual (Balcão)
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrorMsg("");

    // Validação de Domingo e Feriado
    const dayCheck = checkDayStatus(selectedDate);
    if (dayCheck.isClosed) {
      setCreateErrorMsg(dayCheck.reason);
      return;
    }

    setIsSubmitting(true);

    const targetBarber = isAdmin ? newBarberId : (userBarberId || "barbeiro-nando");
    // Offset seguro de Brasília (-03:00) para evitar distorção de 3 horas
    const fullDate = `${selectedDate}T${newTime}:00-03:00`;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: newServiceId,
          barberId: targetBarber,
          date: fullDate,
          clientName: newClientName.trim() || "Cliente Balcão",
          clientEmail: newClientEmail.trim().toLowerCase() || null,
          clientPhone: newClientPhone.trim() || "75988880000",
          isWalkIn: true,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewClientName("");
        setNewClientEmail("");
        setNewClientPhone("");
        fetchAgenda();
      } else {
        const data = await res.json();
        setCreateErrorMsg(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      setCreateErrorMsg("Erro de conexão ao criar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBarberObj = BARBERS.find(b => b.id === (isAdmin ? selectedBarberFilter : userBarberId));
  const currentDayStatus = checkDayStatus(selectedDate);

  // Solicitações pendentes de clientes
  const pendingRequests = appointments.filter(
    (a) => a.status === "RESCHEDULE_REQUESTED" || a.status === "CANCEL_REQUESTED"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* ── BARRA DE CONTROLE DA AGENDA ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isAdmin ? (
              <span className="text-[10px] bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Shield className="w-3 h-3" /> Agenda Administrativa
              </span>
            ) : (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Minha Agenda Exclusiva
              </span>
            )}
          </div>
          <h2 className="text-3xl font-serif text-white">
            {isAdmin 
              ? (selectedBarberFilter === "all" ? "Agenda Geral da Barbearia" : `Agenda de ${selectedBarberObj?.name}`)
              : `Minha Agenda de Atendimentos`}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isAdmin 
              ? "Visualize e gerencie a distribuição de horários entre todos os barbeiros."
              : "Horários agendados exclusivamente para você realizar os cortes hoje."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Barbeiro: APENAS O DONO PODE FILTRAR OUTROS BARBEIROS */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSelectedBarberFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === "all" ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                Todos
              </button>
              {BARBERS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberFilter(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === b.id ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}

          {/* Filtro por data */}
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
          />

          <button
            onClick={() => {
              setCreateErrorMsg("");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:bg-white hover:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* ── CARD ESPECIAL: CONTROLE DE ESCALA FLEXÍVEL / 4X4 DO DONO (MR. BASTOS) ── */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-600/10 via-white/[0.02] to-transparent border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
              isOwnerAvailable ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/10 text-gray-500"
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Escala 4x4 / Flexível
                </span>
                <span className={`w-2 h-2 rounded-full ${isOwnerAvailable ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
              </div>
              <h4 className="text-sm font-semibold text-white mt-0.5">
                Disponibilidade de Mr. Bastos (Dono) para Agendamentos
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {isOwnerAvailable
                  ? "Ativo no site: Clientes podem selecionar Mr. Bastos na lista pública de barbeiros."
                  : "Em folga / Oculto: Seu nome está oculto no site. Apenas os outros barbeiros recebem agendamentos."}
              </p>
            </div>
          </div>

          <button
            onClick={toggleOwnerAvailability}
            disabled={isTogglingOwner}
            className={`px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-all shrink-0 ${
              isOwnerAvailable 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black" 
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isTogglingOwner ? (
              "Atualizando..."
            ) : isOwnerAvailable ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Trabalhando Hoje (Ativo)</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4 text-gray-400" />
                <span>Em Folga (Oculto no Site)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── ALERTA DE DOMINGO OU FERIADO SELECIONADO ── */}
      {currentDayStatus.isClosed && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
          <span className="text-2xl">{currentDayStatus.isSunday ? "🚫" : "🏛️"}</span>
          <div>
            <h4 className="text-sm font-bold text-red-200 uppercase tracking-wider">
              {currentDayStatus.isSunday ? "Barbearia Fechada aos Domingos" : "Barbearia Fechada no Feriado"}
            </h4>
            <p className="text-xs text-red-300 mt-0.5">{currentDayStatus.reason}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Clientes que acessarem o site nesta data verão o aviso oficial de fechamento.
            </p>
          </div>
        </div>
      )}

      {/* ── SEÇÃO DE SOLICITAÇÕES PENDENTES DE CLIENTES (REAGENDAMENTOS & CANCELAMENTOS) ── */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold">
              Solicitações de Clientes Pendentes de Aprovação ({pendingRequests.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {pendingRequests.map((apt) => {
              const isReschedule = apt.status === "RESCHEDULE_REQUESTED";
              const currentTime = getDisplayTime(apt.date);
              const requestedTime = apt.requestedDate ? getDisplayTime(apt.requestedDate) : "";
              const requestedDate = apt.requestedDate ? apt.requestedDate.substring(0, 10).split("-").reverse().join("/") : "";
              const barberName = BARBERS.find(b => b.id === apt.barberId)?.name.split(" ")[0] || "Barbeiro";

              return (
                <div 
                  key={apt.id}
                  className="p-4 bg-[#050B14] border border-amber-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isReschedule ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {isReschedule ? "🔄 Solicitação de Reagendamento" : "⚠️ Solicitação de Cancelamento"}
                      </span>
                      <span className="text-xs text-gray-400">Barbeiro: <strong>{barberName}</strong></span>
                    </div>

                    <h4 className="text-white font-medium text-base">
                      {apt.user?.name || "Cliente"} · <span className="text-gray-400 text-sm">{apt.service?.name}</span>
                    </h4>

                    {isReschedule ? (
                      <div className="text-xs text-gray-300 mt-1 flex flex-wrap items-center gap-2">
                        <span>Horário Atual: <strong className="text-gray-400">{currentTime}</strong></span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300 font-bold">
                          Deseja mudar para: {requestedDate} às {requestedTime}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        O cliente solicitou cancelar o horário de <strong>{currentTime}</strong> após o prazo inicial de 30 minutos.
                      </p>
                    )}

                    <p className="text-[11px] text-gray-500 font-mono mt-1">
                      WhatsApp: {apt.user?.phone || "Não informado"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isReschedule ? (
                      <>
                        <button
                          onClick={() => handleApproveReschedule(apt)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Aprovar Reagendamento
                        </button>
                        <button
                          onClick={() => handleRejectReschedule(apt)}
                          className="px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-300 font-semibold text-xs transition-colors"
                        >
                          Recusar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApproveCancel(apt)}
                          className="px-3.5 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Aceitar Cancelamento
                        </button>
                        <button
                          onClick={() => handleRejectCancel(apt)}
                          className="px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white font-semibold text-xs transition-colors"
                        >
                          Manter Agendamento
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LISTA DE HORÁRIOS ── */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <span className="text-sm font-serif text-gray-300">
            {selectedDate.split("-").reverse().join("/")} · {appointments.length} horários marcados
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {appointments.filter(a => a.status === "COMPLETED").length} concluídos
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-blue-400 animate-pulse">Carregando horários...</div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center text-gray-500 italic">
            Nenhum atendimento agendado para esta data.
          </div>
        ) : (
          <div className="grid gap-3">
            {appointments.map((apt) => {
              const barberInfo = BARBERS.find(b => b.id === apt.barberId) || BARBERS[0];
              // Usando getDisplayTime para garantir hora idêntica ao fuso de Brasília sem atraso de 3 horas
              const aptTime = getDisplayTime(apt.date);
              const isOwnerCut = barberInfo.role === "ADMIN";
              const cutPrice = Number(apt.service?.price || 0);
              const barberCommission = isOwnerCut ? cutPrice : cutPrice * 0.45;

              return (
                <div 
                  key={apt.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 bg-black/20 border rounded-2xl transition-all gap-4 overflow-hidden ${
                    apt.status === 'CANCELLED' 
                      ? 'border-red-500/20 opacity-60' 
                      : apt.status === 'RESCHEDULE_REQUESTED'
                      ? 'border-amber-500/40 bg-amber-500/[0.03]'
                      : 'border-white/5 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#050B14] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-[10px] text-gray-400 font-light">HORA</span>
                      <span className="text-xs sm:text-sm font-bold text-blue-400">{aptTime}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium text-base sm:text-lg truncate">{apt.user?.name || "Cliente"}</h4>
                        {/* Se for Dono na visão geral, mostra o barbeiro responsável */}
                        {isAdmin && selectedBarberFilter === "all" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/5 border border-white/10 text-gray-300 shrink-0">
                            ✂️ {barberInfo.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{apt.service?.name} · <strong className="text-white">R$ {cutPrice.toFixed(2)}</strong></span>
                        <span className="text-blue-400">
                          Comissão: R$ {barberCommission.toFixed(2)} ({isOwnerCut ? "100%" : "45%"})
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                        WhatsApp: {apt.user?.phone || "Não informado"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status e Ações - Responsivo para telas de celular */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-white/5">
                    {/* Linha 1 no celular: Status + WhatsApp */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border shrink-0 ${
                        apt.status === 'CONFIRMED' ? 'border-blue-500/30 text-blue-400 bg-blue-600/10' : 
                        apt.status === 'COMPLETED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 
                        apt.status === 'CANCELLED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                        apt.status === 'RESCHEDULE_REQUESTED' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        apt.status === 'CANCEL_REQUESTED' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                        'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                      }`}>
                        {apt.status === 'CONFIRMED' ? 'Confirmado' : 
                         apt.status === 'COMPLETED' ? 'Concluído' : 
                         apt.status === 'CANCELLED' ? 'Cancelado' : 
                         apt.status === 'RESCHEDULE_REQUESTED' ? 'Reagendamento' :
                         apt.status === 'CANCEL_REQUESTED' ? 'Cancelamento' :
                         'Pendente'}
                      </span>

                      {/* Botão de contato no WhatsApp do cliente */}
                      {apt.user?.phone && (
                        <a
                          href={`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(apt.status === 'CANCELLED' ? `Olá, ${apt.user.name}! Tudo bem? Sobre o seu agendamento no Mr. Bastos Barbearia, gostaria de ver com você um novo dia ou horário para realizar seu atendimento!` : `Olá, ${apt.user.name}! Sou o ${barberInfo.name} da Mr. Bastos Barbearia. Confirmando seu horário para hoje às ${aptTime}!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-1.5 sm:p-2 rounded-lg transition-all shrink-0 ${apt.status === 'CANCELLED' ? 'bg-white/5 text-gray-400 hover:text-emerald-400' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}
                          title="Enviar mensagem no WhatsApp do cliente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Linha 2 no celular: Ações do Barbeiro e Dono */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                      {/* BOTÃO ALTERAR HORÁRIO / REAGENDAR PELO DONO */}
                      {apt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openEditModal(apt)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 text-gray-300 text-xs font-medium transition-all flex items-center gap-1 shrink-0"
                          title="Alterar data, horário ou barbeiro deste agendamento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Alterar</span>
                        </button>
                      )}
                      
                      {apt.status === 'PENDING' && (
                        <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-300 transition-all shrink-0">
                          Confirmar
                        </button>
                      )}
                      
                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                        <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shrink-0">
                          Finalizar
                        </button>
                      )}

                      {/* CANCELAMENTO PELO DONO COM MODAL E WHATSAPP AUTOMÁTICO */}
                      {apt.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => openCancelModal(apt)} 
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm shrink-0" 
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

      {/* ── MODAL: ALTERAR / EDITAR AGENDAMENTO (DONO & EQUIPE) ── */}
      <AnimatePresence>
        {editingApt && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-md" onClick={() => setEditingApt(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#050B14] border border-blue-500/40 rounded-3xl p-6 z-10 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-serif text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-400" /> Alterar Agendamento
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cliente: <strong className="text-white">{editingApt.user?.name}</strong>
                  </p>
                </div>
                <button onClick={() => setEditingApt(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccessMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              {editErrorMsg && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Data */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Data do Atendimento
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* Horário */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Novo Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* Barbeiro Responsável */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Barbeiro
                  </label>
                  <select
                    value={editBarberId}
                    onChange={(e) => setEditBarberId(e.target.value)}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {BARBERS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.role === "ADMIN" ? "Dono - 100%" : "45%"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Serviço */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Serviço
                  </label>
                  <select
                    value={editServiceId}
                    onChange={(e) => setEditServiceId(e.target.value)}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {OFFICIAL_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - R$ {s.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex-1 py-3 bg-blue-600 hover:bg-white hover:text-black text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isSavingEdit ? "Salvando..." : "Salvar Alteração"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingApt(null)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: NOVO AGENDAMENTO MANUAL / BALCÃO ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#050B14]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#050B14] border border-blue-500/30 rounded-3xl p-6 md:p-8 z-10 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-2xl font-serif text-white">Agendar Atendimento</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Adicione um novo cliente na agenda.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createErrorMsg && (
                <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateAppointment} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Nome do Cliente */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Nome do Cliente
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João da Silva"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* E-mail do Cliente */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    E-mail do Cliente (para conta e recuperação)
                  </label>
                  <input 
                    type="email" 
                    placeholder="Ex: cliente@email.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    WhatsApp do Cliente
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: (75) 99999-9999"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Barbeiro Responsável */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Barbeiro Atendente
                  </label>
                  {isAdmin ? (
                    <select
                      value={newBarberId}
                      onChange={(e) => setNewBarberId(e.target.value)}
                      className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {BARBERS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.role === "ADMIN" ? "100%" : "45%"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{userName}</span>
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        Comissão 45%
                      </span>
                    </div>
                  )}
                </div>

                {/* Serviço Selecionado */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Serviço ou Combo Desejado
                  </label>
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full bg-[#050B14] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {OFFICIAL_SERVICES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - R$ {s.price} ({s.duration} min) {s.isCombo ? "⭐ COMBO" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horário */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">
                    Horário
                  </label>
                  <input 
                    required 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-white hover:text-black text-white font-bold uppercase tracking-widest text-xs rounded-xl mt-4 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? "Agendando..." : "Salvar Agendamento"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
