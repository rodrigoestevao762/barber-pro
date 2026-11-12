"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Clock,
  CalendarCheck,
  LayoutGrid,
  List,
  Scissors,
  Crown,
  ArrowRight,
  MessageCircle,
  X,
} from "lucide-react";
import { OFFICIAL_SERVICES, ServiceCategory, ServiceItem } from "@/lib/services";

interface ServicesMenuSectionProps {
  onSelectService: (serviceId?: string) => void;
}

const CATEGORIES: { key: "all" | ServiceCategory; label: string; count: number }[] = [
  { key: "all", label: "Todos", count: OFFICIAL_SERVICES.length },
  {
    key: "combo",
    label: "Combos Especiais",
    count: OFFICIAL_SERVICES.filter((s) => s.category === "combo").length,
  },
  {
    key: "corte",
    label: "Cortes & Acabamento",
    count: OFFICIAL_SERVICES.filter((s) => s.category === "corte").length,
  },
  {
    key: "barba",
    label: "Barba & Navalha",
    count: OFFICIAL_SERVICES.filter((s) => s.category === "barba").length,
  },
  {
    key: "estetica",
    label: "Estética & Visagismo",
    count: OFFICIAL_SERVICES.filter((s) => s.category === "estetica").length,
  },
];

const WHATSAPP_CONCIERGE_URL =
  "https://wa.me/557598679820?text=Ol%C3%A1!%20Gostaria%20de%20ajuda%20para%20escolher%20o%20servi%C3%A7o%20ideal%20na%20Mr.%20Bastos%20Barbearia.";

export default function ServicesMenuSection({ onSelectService }: ServicesMenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const spotlightService =
    OFFICIAL_SERVICES.find((s) => s.id === "combo-corte-barba") || OFFICIAL_SERVICES[0];

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return OFFICIAL_SERVICES.filter((s) => {
      const matchesCat = activeCategory === "all" || s.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <section
      id="servicos"
      className="py-20 md:py-28 px-4 sm:px-6 bg-[#02050A] border-t border-blue-950/60 relative overflow-hidden"
    >
      {/* Atmosfera sutil Blue Sapphire */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[780px] h-[340px] bg-blue-600/8 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-blue-900/30 pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-extrabold uppercase tracking-[0.25em]">
              <Scissors className="w-3.5 h-3.5" /> Menu Exclusivo de Serviços
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Serviços &amp; <span className="text-blue-400 italic">Valores</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Precisão técnica, toalha quente e atendimento premium no{" "}
              <strong className="text-slate-200 font-semibold">
                Hiper Gbarbosa — Alagoinhas, BA
              </strong>
              . Escolha seu ritual abaixo e reserve em segundos.
            </p>
          </div>

          <a
            href={WHATSAPP_CONCIERGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all self-start md:self-auto shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Dúvidas? Falar com a Recepção
          </a>
        </div>

        {/* SPOTLIGHT HERO: Combo Corte + Barba */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#081529] via-[#061020] to-[#040914] p-6 sm:p-8 shadow-2xl shadow-blue-950/30"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5 relative h-52 sm:h-64 rounded-2xl overflow-hidden border border-blue-500/20">
              <img
                src={spotlightService.image}
                alt={spotlightService.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <Crown className="w-3 h-3" /> Carro-Chefe Mr. Bastos
              </span>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                  {spotlightService.categoryLabel}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10 text-[11px] font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> {spotlightService.duration} min
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {spotlightService.name}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {spotlightService.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-blue-900/40">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                    Investimento
                  </span>
                  <span className="text-3xl font-black text-blue-400">
                    R$ {spotlightService.price}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectService(spotlightService.id)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98]"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Agendar {spotlightService.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BARRA DE FILTROS: Categorias + Busca + Toggle Visualização */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/50"
                      : "bg-[#081221] text-slate-300 border-blue-900/40 hover:border-blue-500/50 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-950 text-blue-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar corte, barba, navalha..."
                className="w-full bg-[#081221] border border-blue-900/50 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-[#081221] border border-blue-900/40 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-label="Visualização em cards"
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Visualização em lista"
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* GRADE / LISTA DE SERVIÇOS */}
        {filteredServices.length === 0 ? (
          <div className="bg-[#081221] border border-blue-900/40 rounded-2xl p-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto opacity-60" />
            <p className="text-sm text-slate-300 font-semibold">
              Nenhum serviço encontrado para &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Mostrar todos os {OFFICIAL_SERVICES.length} serviços
            </button>
          </div>
        ) : viewMode === "cards" ? (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service: ServiceItem) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={service.id}
                  onClick={() => onSelectService(service.id)}
                  className="group cursor-pointer rounded-2xl bg-[#071120] border border-blue-900/40 hover:border-blue-500/60 overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-blue-950/40"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071120] via-[#071120]/30 to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-[#050B14]/85 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                        {service.index} · {service.categoryLabel}
                      </span>
                      {service.badge && (
                        <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-md">
                          {service.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-serif font-bold text-white group-hover:text-blue-300 transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-lg font-black text-blue-400 shrink-0">
                          R$ {service.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-blue-900/30 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {service.duration} min
                    </span>
                    <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                      Agendar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="bg-[#071120] border border-blue-900/40 rounded-2xl divide-y divide-blue-900/30 overflow-hidden">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-950/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-14 h-14 rounded-xl object-cover border border-blue-900/50 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        {service.index}
                      </span>
                      <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                        {service.name}
                      </h4>
                      {service.badge && (
                        <span className="text-[9px] font-black uppercase bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {service.duration}m
                  </span>
                  <span className="text-base font-black text-blue-400 min-w-[68px] text-right">
                    R$ {service.price}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white text-xs font-bold transition-colors">
                    Reservar
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
