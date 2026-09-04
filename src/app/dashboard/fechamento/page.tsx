"use client"
import { useEffect, useState } from "react"
import { getFechamentoData, closeCashRegister } from "./actions"
import { motion } from "framer-motion"
import { Archive, DollarSign, Clock, Calendar as CalendarIcon, User as UserIcon } from "lucide-react"

type BarberRevenue = { name: string; total: number; commission: number };
type FechamentoData = { totalRevenue: number; barberRevenues: BarberRevenue[]; closings: { createdAt: string | Date; closedBy: string | null }[] };

export default function FechamentoPage() {
  const [data, setData] = useState<FechamentoData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const result = await getFechamentoData()
    if (result.success) {
      setData(result.data)
    } else {
      alert("Erro do Servidor: " + result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getFechamentoData().then(result => {
      if (result.success) {
        setData(result.data)
      } else {
        alert("Erro do Servidor: " + result.error)
      }
      setLoading(false)
    }).catch(error => {
      console.error(error)
      alert("Erro ao carregar dados: " + error.message)
      setLoading(false)
    })
  }, [])

  const handleClose = async () => {
    if (!data) return;
    if (!confirm("Tem certeza que deseja fechar o caixa de hoje?")) return;
    
    const result = await closeCashRegister({
      totalRevenue: data.totalRevenue,
      barberRevenues: JSON.stringify(data.barberRevenues),
      closedBy: "Gestor" // In a real app, we would get this from session
    })
    
    if (result.success) {
      fetchData()
    } else {
      alert("Erro ao fechar caixa: " + result.error)
    }
  }

  if (loading || !data) return <div className="text-white p-8 animate-pulse">Carregando dados do caixa...</div>

  const isClosed = data.closings && data.closings.length > 0;
  const lastClosing = isClosed ? data.closings[0] : null;

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-serif text-white mb-8">Fechamento de Caixa</h2>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88E70]/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#C88E70]/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#C88E70]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Faturamento do Dia</p>
              <h3 className="text-3xl font-bold text-white">
                R$ {data.totalRevenue.toFixed(2)}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center"
        >
           <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Data Atual</p>
              <h3 className="text-xl font-medium text-white flex items-center gap-2">
                {new Date().toLocaleDateString('pt-BR')}
                <Clock className="w-4 h-4 text-gray-500 ml-2" />
                <span className="text-gray-400 text-sm">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}</span>
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      <h3 className="text-xl font-serif text-white mb-4">Faturamento por Profissional</h3>
      <div className="space-y-4 mb-8">
        {data.barberRevenues.length === 0 ? (
          <p className="text-gray-500 italic p-4 bg-white/5 rounded-2xl border border-white/5">Nenhum faturamento registrado hoje.</p>
        ) : (
          data.barberRevenues.map((barber: BarberRevenue, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{barber.name}</h4>
                  <p className="text-xs text-gray-400">Total de serviços prestados hoje</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-[#C88E70] font-bold text-lg">R$ {barber.total.toFixed(2)}</h4>
                <p className="text-xs text-gray-500">Comissão estimada: R$ {barber.commission.toFixed(2)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!isClosed ? (
        <button 
          onClick={handleClose}
          className="w-full bg-[#C88E70] hover:bg-[#b0785a] text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Archive className="w-5 h-5" />
          Registrar Fechamento do Caixa
        </button>
      ) : (
        <div className="w-full bg-white/5 border border-white/10 text-gray-400 font-medium py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 opacity-50 cursor-not-allowed">
          <Archive className="w-5 h-5" />
          Caixa já foi fechado hoje
        </div>
      )}
    </div>
  )
}

