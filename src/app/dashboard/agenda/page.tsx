"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle, User, Clock3, Plus, X, Phone, MessageCircle, Scissors, Shield, ChevronRight, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BARBERS } from '@/lib/barbers';
import { OFFICIAL_SERVICES, ServiceItem } from '@/lib/services';

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

  // Modal Novo Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newServiceId, setNewServiceId] = useState(OFFICIAL_SERVICES[0].id);
  const [newBarberId, setNewBarberId] = useState(userBarberId || "barbeiro-dono");
  const [newTime, setNewTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetBarber = isAdmin ? newBarberId : (userBarberId || "barbeiro-nando");
    const fullDate = `${selectedDate}T${newTime}:00Z`;

    try {
      await fetch('/api/appointments', {
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

      setIsModalOpen(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      fetchAgenda();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBarberObj = BARBERS.find(b => b.id === (isAdmin ? selectedBarberFilter : userBarberId));

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
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:bg-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

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
              const aptTime = new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const isOwnerCut = barberInfo.role === "ADMIN";
              const cutPrice = Number(apt.service?.price || 0);
              const barberCommission = isOwnerCut ? cutPrice : cutPrice * 0.45;

              return (
                <div 
                  key={apt.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/20 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#050B14] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-[10px] text-gray-400 font-light">HORA</span>
                      <span className="text-sm font-bold text-blue-400">{aptTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium text-lg">{apt.user?.name || "Cliente"}</h4>
                        {/* Se for Dono na visão geral, mostra o barbeiro responsável */}
                        {isAdmin && selectedBarberFilter === "all" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/5 border border-white/10 text-gray-300">
                            ✂️ {barberInfo.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {apt.service?.name} · <strong className="text-white">R$ {cutPrice.toFixed(2)}</strong>
                        {" · "}
                        <span className="text-blue-400">
                          Comissão: R$ {barberCommission.toFixed(2)} ({isOwnerCut ? "100%" : "45%"})
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        WhatsApp: {apt.user?.phone || "Não informado"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 justify-end">
                    <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold border ${
                      apt.status === 'CONFIRMED' ? 'border-blue-500/30 text-blue-400 bg-blue-600/10' : 
                      apt.status === 'COMPLETED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 
                      apt.status === 'CANCELLED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                    }`}>
                      {apt.status === 'CONFIRMED' ? 'Confirmado' : apt.status === 'COMPLETED' ? 'Concluído' : apt.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                    </span>

                    {/* Botão de contato no WhatsApp do cliente */}
                    {apt.user?.phone && (
                      <a
                        href={`https://wa.me/55${apt.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${apt.user.name}! Sou o ${barberInfo.name} da Mr. Bastos Barbearia. Confirmando seu horário para hoje às ${aptTime}!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                        title="Enviar mensagem no WhatsApp do cliente"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    
                    {apt.status === 'PENDING' && (
                      <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="text-[10px] uppercase font-bold tracking-wider px-3 py-2 rounded-lg bg-white/10 hover:bg-blue-600 hover:text-white transition-colors">
                        Confirmar
                      </button>
                    )}
                    {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                      <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="text-[10px] uppercase font-bold tracking-wider px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all">
                        Finalizar
                      </button>
                    )}
                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                      <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Cancelar horário">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: NOVO AGENDAMENTO COM TODAS AS 9 OPÇÕES DE SERVIÇOS ── */}
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

                {/* Serviço Selecionado (TODAS AS 9 OPÇÕES OFICIAIS) */}
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
                  className="w-full py-4 bg-blue-600 hover:bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl mt-4 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? "Agendando..." : "Salvar Agendamento"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
