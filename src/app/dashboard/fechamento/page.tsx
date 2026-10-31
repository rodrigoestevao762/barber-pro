"use client"

import { useEffect, useState } from "react"
import { getFechamentoData, closeCashRegister } from "./actions"
import { motion } from "framer-motion"
import { Archive, DollarSign, Calendar as CalendarIcon, User as UserIcon, Scissors, Wallet, Shield, Lock, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type BarberRevenue = { id?: string; name: string; total: number; commission: number; rate?: number; isOwner?: boolean };
type FechamentoData = { totalRevenue: number; barberRevenues: BarberRevenue[]; closings: { createdAt: string | Date; closedBy: string | null }[] };

export default function FechamentoPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "ADMIN";
  const isAdmin = userRole === "ADMIN";

  const [data, setData] = useState<FechamentoData | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true)
    const result = await getFechamentoData(selectedDate)
    if (result.success) {
      setData(result.data)
    } else {
      alert("Erro do Servidor: " + (result as any).error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [selectedDate, isAdmin])

  const handleClose = async () => {
    if (!data) return;
    const dateFormatted = new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR');
    if (!confirm(`Tem certeza que deseja fechar o caixa do dia ${dateFormatted}?`)) return;
    
    const result = await closeCashRegister({
      totalRevenue: data.totalRevenue,
      barberRevenues: JSON.stringify(data.barberRevenues),
      closedBy: session?.user?.name || "Mr. Bastos (Dono)",
      dateStr: selectedDate
    })
    
    if (result.success) {
      fetchData()
    } else {
      alert("Erro ao fechar caixa: " + result.error)
    }
  }

  // ── PROTEÇÃO DE ACESSO: BARBEIRO NÃO PODE ACESSAR FECHAMENTO GERAL ──
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <Lock className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-3xl font-serif text-white">Acesso Restrito ao Dono</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            O fechamento oficial do caixa da barbearia é uma função exclusiva do administrador/proprietário.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Meu Painel
        </Link>
      </div>
    );
  }

  if (loading || !data) return <div className="text-white p-8 animate-pulse text-blue-400">Carregando dados do caixa...</div>

  const isClosed = data.closings && data.closings.length > 0;
  const lastClosing = isClosed ? data.closings[0] : null;

  // Separação de comissões de funcionários (45%) e produção do Dono (100%)
  const employeeRevenues = data.barberRevenues.filter(b => !b.name.toLowerCase().includes("dono"));
  const totalEmployeeCommissions = employeeRevenues.reduce((acc, b) => acc + b.commission, 0);
  const houseNetRetained = data.totalRevenue - totalEmployeeCommissions;

  return (
    <div className="max-w-4xl pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Exclusivo do Dono
            </span>
          </div>
          <h2 className="text-3xl font-serif text-white">Fechamento de Caixa</h2>
          <p className="text-xs text-gray-400 mt-1">Conferência final do dia com repasse de 45% aos barbeiros e 100% ao Dono.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 uppercase tracking-widest">Data:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>
      
      {isClosed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <Archive className="text-green-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-green-500 font-semibold text-lg">Caixa Fechado</h3>
            <p className="text-green-500/80 text-sm">
              Fechado em {new Date(lastClosing!.createdAt).toLocaleDateString('pt-BR')} às {new Date(lastClosing!.createdAt).toLocaleTimeString('pt-BR')} por {lastClosing!.closedBy}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Faturamento Bruto Total */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest">Faturamento Bruto</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                R$ {data.totalRevenue.toFixed(2)}
              </h3>
            </div>
          </div>
          <p className="text-xs text-gray-500">Soma de todos os cortes realizados no dia.</p>
        </motion.div>

        {/* Comissões dos Funcionários a Pagar (45%) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-600/10 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-xs uppercase tracking-widest font-semibold">Repasse Equipe (45%)</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">
                R$ {totalEmployeeCommissions.toFixed(2)}
              </h3>
            </div>
          </div>
          <p className="text-xs text-gray-400">Total a pagar para Nando e Saul (45%).</p>
        </motion.div>

        {/* Saldo Retido pela Casa */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">Retido pela Casa</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                R$ {houseNetRetained.toFixed(2)}
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-400/70">Dono 100% + 55% dos funcionários.</p>
        </motion.div>
      </div>

      <h3 className="text-xl font-serif text-white mb-4">Detalhamento por Profissional</h3>
      <div className="space-y-4 mb-8">
        {data.barberRevenues.length === 0 ? (
          <p className="text-gray-500 italic p-4 bg-white/5 rounded-2xl border border-white/5">Nenhum faturamento registrado nesta data.</p>
        ) : (
          data.barberRevenues.map((barber: BarberRevenue, idx: number) => {
            const isOwner = barber.name.toLowerCase().includes("dono");
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOwner ? "bg-blue-600/20 text-blue-400" : "bg-white/10 text-white"}`}>
                    {isOwner ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-base">{barber.name}</h4>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isOwner ? "bg-blue-600 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                        {isOwner ? "Dono · 100%" : "Comissão 45%"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isOwner ? "Proprietário da Barbearia" : "Barbeiro da Equipe"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Produção Bruta: <strong className="text-white">R$ {barber.total.toFixed(2)}</strong></p>
                  <h4 className="text-blue-400 font-bold text-lg mt-0.5">
                    {isOwner ? "Faturamento: " : "Comissão (45%): "}
                    R$ {barber.commission.toFixed(2)}
                  </h4>
                  {!isOwner && (
                    <p className="text-[11px] text-emerald-400">
                      Repasse para a casa (55%): + R$ {(barber.total * 0.55).toFixed(2)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {!isClosed ? (
        <button 
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-white text-black font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-xl shadow-blue-500/20"
        >
          <Archive className="w-5 h-5" />
          Registrar Fechamento do Caixa
        </button>
      ) : (
        <div className="w-full bg-white/5 border border-white/10 text-gray-400 font-medium py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 opacity-50 cursor-not-allowed">
          <Archive className="w-5 h-5" />
          Caixa já foi fechado para esta data
        </div>
      )}
    </div>
  )
}
