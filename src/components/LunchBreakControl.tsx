"use client";

import React, { useState } from "react";
import { Coffee, Unlock, Repeat, Calendar } from "lucide-react";

interface LunchBreakControlProps {
  barberId: string;
  barberName: string;
  selectedDate: string;
  lunchBreakTime: string | null;
  isLunchBreakFixed: boolean;
  hasLunchDateOverride: boolean;
  onUpdateLunchBreak: (time: string | null, scope: "default" | "date") => Promise<void>;
  updatingLunch: boolean;
}

const PRESET_ONE_HOUR = ["11:00", "12:00", "13:00", "14:00"];
const PRESET_TWO_HOURS = [
  { label: "11h–13h", value: "11:00-13:00" },
  { label: "12h–14h", value: "12:00-14:00" },
  { label: "13h–15h", value: "13:00-15:00" },
];

export default function LunchBreakControl({
  barberName,
  selectedDate,
  lunchBreakTime,
  isLunchBreakFixed,
  hasLunchDateOverride,
  onUpdateLunchBreak,
  updatingLunch,
}: LunchBreakControlProps) {
  const [lunchScope, setLunchScope] = useState<"default" | "date">(
    isLunchBreakFixed || !hasLunchDateOverride ? "default" : "date"
  );

  const dateBr = selectedDate.split("-").reverse().slice(0, 2).join("/");

  const formatRangeLabel = (val: string) =>
    val.includes("-") ? val.replace(":00", "h").replace("-", "–").replace(":00", "h") : `${val}`;

  return (
    <div className="bg-[#081221] border border-blue-900/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              lunchBreakTime
                ? "bg-amber-500/15 border-amber-500/35 text-amber-400"
                : "bg-blue-950/60 border-blue-900/40 text-blue-400"
            }`}
          >
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-white">Pausa para Almoço</p>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                {barberName}
              </span>
              {lunchBreakTime ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {formatRangeLabel(lunchBreakTime)} ({isLunchBreakFixed ? "Fixo Diário" : `Só ${dateBr}`})
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                  Sem pausa configurada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lunchBreakTime
                ? isLunchBreakFixed
                  ? `Trava automática todos os dias para ${barberName} no(s) horário(s) escolhido(s).`
                  : `Regra aplicada exclusivamente para ${barberName} em ${dateBr}.`
                : `Nenhum horário bloqueado para almoço na agenda de ${barberName}.`}
            </p>
          </div>
        </div>

        {/* Seletor de Escopo: Fixo vs Só nesta data */}
        <div className="flex items-center gap-1 bg-[#050B14] border border-blue-900/40 rounded-xl p-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            disabled={updatingLunch}
            onClick={() => setLunchScope("default")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              lunchScope === "default"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Repeat className="w-3 h-3" /> Direto (Fixo)
          </button>
          <button
            type="button"
            disabled={updatingLunch}
            onClick={() => setLunchScope("date")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              lunchScope === "date"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3 h-3" /> Só {dateBr}
          </button>
        </div>
      </div>

      {/* Presets de Horário Individual */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-900/30">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          1h:
        </span>
        {PRESET_ONE_HOUR.map((h) => {
          const isSelected = lunchBreakTime === h;
          return (
            <button
              key={h}
              type="button"
              disabled={updatingLunch}
              onClick={() => onUpdateLunchBreak(isSelected ? null : h, lunchScope)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-400 shadow-sm shadow-amber-500/20"
                  : "bg-[#050B14] text-slate-300 border-blue-900/40 hover:border-blue-500/60 hover:text-white"
              }`}
            >
              {h}
            </button>
          );
        })}

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2 mr-1">
          2h:
        </span>
        {PRESET_TWO_HOURS.map((p) => {
          const isSelected = lunchBreakTime === p.value;
          return (
            <button
              key={p.value}
              type="button"
              disabled={updatingLunch}
              onClick={() => onUpdateLunchBreak(isSelected ? null : p.value, lunchScope)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-400 shadow-sm shadow-amber-500/20"
                  : "bg-[#050B14] text-slate-300 border-blue-900/40 hover:border-blue-500/60 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          );
        })}

        {(lunchBreakTime || hasLunchDateOverride) && (
          <div className="flex items-center gap-2 ml-auto">
            {lunchScope === "date" && isLunchBreakFixed && (
              <button
                type="button"
                disabled={updatingLunch}
                onClick={() => onUpdateLunchBreak("NONE", "date")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Libera o horário de almoço somente nesta data mantendo a trava fixa para os demais dias"
              >
                <Unlock className="w-3.5 h-3.5" /> Liberar Só {dateBr}
              </button>
            )}
            {lunchBreakTime && (
              <button
                type="button"
                disabled={updatingLunch}
                onClick={() =>
                  onUpdateLunchBreak(
                    isLunchBreakFixed && lunchScope === "date" ? "NONE" : null,
                    lunchScope
                  )
                }
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                Remover Almoço
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
