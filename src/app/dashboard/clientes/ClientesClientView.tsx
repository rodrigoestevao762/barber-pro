"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Users,
  CalendarCheck,
  Phone,
  MessageCircle,
  Mail,
  Scissors,
  Clock,
  Crown,
  X,
} from "lucide-react";

export interface ClientCrmItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  totalAppointments: number;
  completedAppointments: number;
  lastServiceName: string | null;
  lastServiceDate: string | null;
  lastBarberName: string | null;
}

interface ClientesClientViewProps {
  clients: ClientCrmItem[];
}

export default function ClientesClientView({ clients }: ClientesClientViewProps) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "with_apt">("all");

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (filterMode === "with_apt" && c.totalAppointments === 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.lastServiceName && c.lastServiceName.toLowerCase().includes(q))
      );
    });
  }, [clients, search, filterMode]);

  const totalRegistered = clients.length;
  const totalWithAppointment = clients.filter((c) => c.totalAppointments > 0).length;
  const totalWithWhatsApp = clients.filter((c) => Boolean(c.phone && c.phone.replace(/\D/g, "").length >= 8)).length;

  const formatWaLink = (phone: string, clientName: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;
    const msg = `Olá, ${clientName}! Tudo bem? Aqui é da Mr. Bastos Barbearia (Hiper Gbarbosa - Alagoinhas). Gostaria de agendar seu próximo horário?`;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* CABEÇALHO CRM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/30 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/30 mb-2">
            <Crown className="w-3.5 h-3.5" /> CRM Base VIP · Mr. Bastos
          </span>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Carteira de <span className="text-blue-400 italic">Clientes VIP</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Histórico de atendimentos, último serviço realizado e contato rápido via WhatsApp.
          </p>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-2 bg-[#081221] border border-blue-900/40 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              filterMode === "all"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({totalRegistered})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("with_apt")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              filterMode === "with_apt"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Com Agendamento ({totalWithAppointment})
          </button>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#081221] border border-blue-900/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Cadastrados
            </p>
            <p className="text-2xl font-black text-white">{totalRegistered}</p>
          </div>
        </div>

        <div className="bg-[#081221] border border-blue-900/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Com Agendamento
            </p>
            <p className="text-2xl font-black text-white">{totalWithAppointment}</p>
          </div>
        </div>

        <div className="bg-[#081221] border border-blue-900/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              WhatsApp Ativo
            </p>
            <p className="text-2xl font-black text-white">{totalWithWhatsApp}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone, e-mail ou serviço..."
          className="w-full bg-[#081221] border border-blue-900/50 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpar busca"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* LISTA / CARDS */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#081221] border border-blue-900/40 rounded-2xl p-12 text-center text-slate-400 text-sm">
          Nenhum cliente encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const hasValidPhone =
              client.phone && client.phone.replace(/\D/g, "").length >= 8;
            return (
              <div
                key={client.id}
                className="bg-[#081221] border border-blue-900/40 hover:border-blue-500/45 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-lg shadow-black/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black text-base flex items-center justify-center shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate">
                        {client.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                        {client.phone && (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                            <Phone className="w-3 h-3 text-blue-400" /> {client.phone}
                          </span>
                        )}
                        {client.email && !client.email.endsWith("@cliente.mrbastos.com.br") && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-blue-400 shrink-0" /> {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-600/15 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase shrink-0">
                    {client.totalAppointments}{" "}
                    {client.totalAppointments === 1 ? "atend." : "atends."}
                  </span>
                </div>

                {/* Último serviço + Data + Barbeiro */}
                <div className="bg-[#050B14] border border-blue-900/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {client.lastServiceName ? (
                    <>
                      <div className="space-y-0.5">
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                          Último Serviço
                        </p>
                        <p className="text-white font-semibold flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5 text-blue-400" />
                          {client.lastServiceName}
                          {client.lastBarberName && (
                            <span className="text-slate-400 font-normal">
                              • {client.lastBarberName}
                            </span>
                          )}
                        </p>
                      </div>
                      {client.lastServiceDate && (
                        <div className="text-right">
                          <p className="text-slate-500 text-[10px] uppercase font-bold">
                            Data do Último Serviço
                          </p>
                          <p className="text-blue-300 font-mono font-bold flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {new Date(client.lastServiceDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 italic text-xs">
                      Cadastro realizado — ainda sem histórico de corte concluído.
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Concluídos:{" "}
                    <strong className="text-emerald-400">
                      {client.completedAppointments}
                    </strong>
                  </span>

                  {hasValidPhone && client.phone && (
                    <a
                      href={formatWaLink(client.phone, client.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chamar no WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
