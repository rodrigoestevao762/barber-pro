"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinanceiroPage() {
  const [data, setData] = useState({ revenue: 0 });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, expRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/expenses')
      ]);
      
      if (dashRes.ok) setData(await dashRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc, amount })
    });
    setDesc("");
    setAmount("");
    setIsModalOpen(false);
    setIsSubmitting(false);
    fetchData();
  };

  if (loading) return <div className="text-white p-10 font-serif">Carregando Cofre...</div>;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = data.revenue - totalExpenses;
  const profitMargin = data.revenue > 0 ? ((netProfit / data.revenue) * 100).toFixed(1) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto space-y-8">
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-tight">Inteligência <span className="text-[#C88E70] italic">Financeira</span></h2>
          <p className="text-gray-400 mt-2 text-sm">Controle absoluto do seu império. Entradas, saídas e lucro líquido real.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative px-6 py-3 bg-[#C88E70] text-black font-bold uppercase tracking-widest text-xs rounded-xl overflow-hidden hover:scale-105 transition-transform flex items-center gap-2"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          <Plus className="w-4 h-4 relative z-10" /> 
          <span className="relative z-10">Lançar Despesa</span>
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] group-hover:bg-green-500/20 transition-colors" />
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
             <ArrowUpRight className="w-4 h-4 text-green-400" /> Receita Total (Mês)
          </p>
          <h2 className="text-5xl font-serif text-white mb-2">
            R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] group-hover:bg-red-500/20 transition-colors" />
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
             <ArrowDownRight className="w-4 h-4 text-red-400" /> Despesas Totais
          </p>
          <h2 className="text-5xl font-serif text-white mb-2">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-white/5 to-transparent border border-[#C88E70]/30 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#C88E70]/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88E70]/20 blur-[50px] group-hover:bg-[#C88E70]/40 transition-colors" />
          <p className="text-[#C88E70] text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2 relative z-10">
             <Wallet className="w-4 h-4" /> Lucro Líquido Real
          </p>
          <h2 className="text-5xl font-serif text-white mb-2 relative z-10">
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2 text-white/70 text-sm mt-4 relative z-10">
             <TrendingUp className="w-4 h-4 text-[#C88E70]" /> Margem: {profitMargin}%
          </div>
        </motion.div>
      </div>

      {/* EXPENSES LIST */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-400" /> Histórico de Saídas
        </h3>
        
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 italic">Nenhuma despesa registrada. Lucro máximo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((exp: any) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={exp.id} 
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{exp.description}</h4>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(exp.date).toLocaleDateString('pt-BR')} às {new Date(exp.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>
                <span className="text-xl font-serif text-red-400">
                  - R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#050B14] border border-[#C88E70]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#C88E70]/5 to-transparent pointer-events-none" />

              <div className="p-8 relative z-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/10 z-50">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-serif text-white mb-2">Nova <span className="text-[#C88E70] italic">Despesa</span></h2>
                <p className="text-gray-400 text-sm font-light mb-8">Registre um gasto para calcular seu lucro líquido real.</p>

                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-1">Descrição</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Conta de Luz, Produtos, etc"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#C88E70] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-1">Valor (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#C88E70] transition-colors"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#C88E70] hover:bg-white text-black font-bold uppercase tracking-widest text-sm rounded-xl transition-colors disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? "Registrando..." : "Registrar Saída"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

