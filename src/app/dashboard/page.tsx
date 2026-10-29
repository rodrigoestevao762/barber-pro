"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Scissors, Clock, ChevronRight, CheckCircle, Clock3, X, Shield, UserCheck, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BARBERS, BarberData } from "@/lib/barbers";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "ADMIN";
  const userBarberId = (session?.user as any)?.barberId;
  const userName = session?.user?.name || "Gestor";

  const [dashboardData, setDashboardData] = useState<any>({
    revenue: 0,
    todayCount: 0,
    completedCount: 0,
    clientsCount: 0,
    averageDuration: 0,
    appointments: [] as any[],
    barberBreakdown: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  
  // Modal de cliente balcão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [walkInBarberId, setWalkInBarberId] = useState(userBarberId || "barbeiro-dono");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>("all");

  const fetchDashboard = async () => {
    try {
      const bFilter = userRole === "ADMIN" ? selectedBarberFilter : (userBarberId || "barbeiro-lucas");
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

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const json = await res.json();
        setServices(json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchServices();
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

  const createWalkIn = async (serviceId: string) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          barberId: walkInBarberId, 
          date: new Date().toISOString(), 
          isWalkIn: true,
          clientName: "Cliente Balcão"
        })
      });
      setIsModalOpen(false);
      fetchDashboard();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-pulse text-[#C88E70] font-serif text-lg tracking-widest uppercase">
          Carregando Painel de Gestão...
        </div>
      </div>
    );
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* ── BARRA SUPERIOR: IDENTIDADE DO BARBEIRO E SELETOR DE GESTÃO ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#C88E70] text-[#050B14] flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Painel do Dono / ADM
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Scissors className="w-3 h-3" /> Painel Individual do Barbeiro
              </span>
            )}
            <span className="text-gray-400 text-xs font-light">
              Usuário logado: <strong className="text-white">{userName}</strong>
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-white mt-2">
            {isAdmin 
              ? (selectedBarberFilter === "all" ? "Visão Geral de Toda a Barbearia" : `Gestão de ${BARBERS.find(b => b.id === selectedBarberFilter)?.name}`)
              : `Minha Agenda e Atendimentos`}
          </h2>
        </div>

        {/* Controles de Filtro: Data e Barbeiro (Dono) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Seletor de Barbeiro Exclusivo do Dono */}
          {isAdmin && (
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSelectedBarberFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === "all" ? "bg-[#C88E70] text-[#050B14]" : "text-gray-400 hover:text-white"}`}
              >
                Todos
              </button>
              {BARBERS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberFilter(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBarberFilter === b.id ? "bg-[#C88E70] text-[#050B14]" : "text-gray-400 hover:text-white"}`}
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
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#C88E70] transition-colors"
            />
          </div>

          {/* Botão Balcão */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#C88E70] text-[#050B14] hover:bg-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#C88E70]/20 flex items-center gap-2"
          >
            <Scissors className="w-3.5 h-3.5" /> + Cliente Balcão
          </button>
        </div>
      </div>

      {/* ── BENTO GRID DE CARDS PRINCIPAIS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card Faturamento */}
        <div className="md:col-span-2 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C88E70]/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-semibold">
                {isAdmin && selectedBarberFilter === "all" ? "Faturamento Geral (Dia)" : "Faturamento do Barbeiro (Dia)"}
              </p>
              <h3 className="text-4xl md:text-5xl font-serif text-white mt-2">
                R$ {Number(dashboardData.revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#C88E70]/20 border border-[#C88E70]/40 flex items-center justify-center text-[#C88E70]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 w-fit px-3 py-1.5 rounded-full text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> 
            <span>Cálculo automático de atendimentos concluídos</span>
          </div>
        </div>

        {/* Cortes do Dia */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-xs tracking-wider uppercase">Cortes Agendados</p>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#C88E70]">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-serif text-white">{dashboardData.todayCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData.completedCount || 0} já concluídos hoje
            </p>
          </div>
        </div>

        {/* Total de Clientes */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-xs tracking-wider uppercase">Clientes Atendidos</p>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-serif text-white">{dashboardData.clientsCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Fluxo na data selecionada</p>
          </div>
        </div>
      </div>

      {/* ── VISÃO DO DONO: FLUXO E REPARTIÇÃO POR FUNCIONÁRIO ── */}
      {isAdmin && selectedBarberFilter === "all" && (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-xl font-serif text-white">Fluxo por Barbeiro (Equipe)</h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Acompanhe o faturamento e volume de atendimentos de cada funcionário em tempo real.
              </p>
            </div>
            <span className="text-xs text-[#C88E70] uppercase tracking-wider font-semibold">
              3 Profissionais Ativos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BARBERS.map((barber) => {
              const bStats = dashboardData.barberBreakdown?.find((b: any) => b.id === barber.id) || {
                totalApts: 0,
                completedApts: 0,
                revenue: 0,
              };
              const isOwner = barber.role === "ADMIN";

              return (
                <div 
                  key={barber.id}
                  onClick={() => setSelectedBarberFilter(barber.id)}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#C88E70]/50 hover:bg-[#C88E70]/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full bg-cover bg-center border border-white/20 shrink-0"
                      style={{ backgroundImage: `url(${barber.avatar})` }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-serif text-white group-hover:text-[#C88E70] transition-colors">
                          {barber.name}
                        </h4>
                        {isOwner && (
                          <span className="text-[9px] bg-[#C88E70] text-[#050B14] px-1.5 py-0.2 rounded font-bold uppercase">
                            Dono
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono">{barber.phoneDisplay}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Faturamento Hoje:</span>
                      <span className="text-white font-mono font-bold text-sm text-[#C88E70]">
                        R$ {Number(bStats.revenue || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Atendimentos Concluídos:</span>
                      <span className="text-white font-semibold">{bStats.completedApts}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Agendados:</span>
                      <span className="text-gray-300">{bStats.totalApts}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#C88E70] font-semibold">
                    <span>Ver agenda exclusiva</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
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
                : `Exibindo somente atendimentos de ${BARBERS.find(b => b.id === (isAdmin ? selectedBarberFilter : userBarberId))?.name || "este barbeiro"}.`}
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
              const aptTime = new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

              return (
                <div 
                  key={apt.id}
                  className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/15 transition-all"
                >
                  {/* Horário, Cliente e Serviço */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#050B14] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-xs text-gray-400 font-light">HORA</span>
                      <span className="text-sm font-bold text-[#C88E70]">{aptTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-serif text-white">
                          {apt.user?.name || "Cliente"}
                        </h4>
                        {/* Tag do Barbeiro Responsável */}
                        {isAdmin && selectedBarberFilter === "all" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/5 border border-white/10 text-gray-300">
                            ✂️ {barberInfo.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {apt.service?.name} · <strong className="text-white">R$ {apt.service?.price}</strong> · WhatsApp: {apt.user?.phone || "Não informado"}
                      </p>
                    </div>
                  </div>

                  {/* Status e Ações */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

                    {/* Botões de Ação para os Barbeiros e Dono */}
                    {apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && (
                      <button 
                        onClick={() => updateStatus(apt.id, "COMPLETED")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 text-xs font-semibold transition-all"
                      >
                        Concluir Corte
                      </button>
                    )}

                    {apt.status === "PENDING" && (
                      <button 
                        onClick={() => updateStatus(apt.id, "CONFIRMED")}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-300 text-xs font-semibold transition-all"
                      >
                        Confirmar
                      </button>
                    )}

                    {apt.status !== "CANCELLED" && (
                      <button 
                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Cancelar agendamento"
                      >
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

      {/* ── MODAL: CLIENTE BALCÃO (WALK-IN) ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#050B14]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#050B14] border border-[#C88E70]/30 rounded-3xl p-6 md:p-8 z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h3 className="text-2xl font-serif text-white">Lançar Cliente Balcão</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Escolha do Barbeiro que está atendendo */}
              <div className="mb-6">
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                  Barbeiro Responsável
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BARBERS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setWalkInBarberId(b.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${walkInBarberId === b.id ? "border-[#C88E70] bg-[#C88E70] text-[#050B14]" : "border-white/10 text-gray-300 hover:border-white/30"}`}
                    >
                      {b.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Escolha do Serviço */}
              <div className="mb-6">
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">
                  Selecione o Serviço Prestado
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {[
                    { id: "corte", name: "Corte", price: 35 },
                    { id: "barba", name: "Barba", price: 25 },
                    { id: "cabeca-navalha", name: "Cabeça raspada navalha", price: 25 },
                    { id: "pezinho", name: "Pezinho", price: 20 },
                    { id: "barba-maquina", name: "Barba raspada na máquina", price: 20 },
                    { id: "sobrancelha", name: "Sobrancelha", price: 15 },
                    { id: "combo-corte-barba", name: "Corte + Barba", price: 55 },
                    { id: "combo-pezinho-barba", name: "Pezinho + Barba", price: 40 },
                    { id: "combo-corte-sobrancelha", name: "Corte + Sobrancelha", price: 45 },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => createWalkIn(s.id)}
                      className="w-full p-3 rounded-xl border border-white/10 hover:border-[#C88E70] bg-white/[0.02] hover:bg-[#C88E70]/10 flex items-center justify-between text-left transition-all"
                    >
                      <span className="text-white text-sm font-medium">{s.name}</span>
                      <span className="text-[#C88E70] font-mono font-bold text-sm">R$ {s.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-full text-center text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
