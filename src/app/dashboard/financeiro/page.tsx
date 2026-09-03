"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Wallet, ArrowUpRight, Scissors, Receipt, User } from "lucide-react";

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isValeModalOpen, setIsValeModalOpen] = useState(false);
  const [valeDesc, setValeDesc] = useState("");
  const [valeAmount, setValeAmount] = useState("");

  // Estado das Abas: "GERAL" ou o ID do barbeiro
  const [activeTab, setActiveTab] = useState<string | number>("GERAL");

  // Dados Globais
  const [expenses, setExpenses] = useState<any[]>([]); // Despesas Gerais (Inclui custos fixos e vales)
  
  // Dados dos Barbeiros
  const [barbers, setBarbers] = useState([
    { id: 1, name: "Maria (Dona)", commissionRate: 0.6, cutsToday: 12, totalEarned: 840, personalExpenses: 0 },
    { id: 2, name: "Pedro (Barbeiro)", commissionRate: 0.5, cutsToday: 8, totalEarned: 400, personalExpenses: 0 },
    { id: 3, name: "Lucas (Barbeiro)", commissionRate: 0.5, cutsToday: 6, totalEarned: 300, personalExpenses: 0 }
  ]);

  const fetchData = async () => {
    try {
      setTimeout(() => {
        setExpenses([
          { id: 1, description: "Conta de Luz", amount: 450, type: "FIXO", date: new Date().toISOString() },
          { id: 2, description: "Pomadas", amount: 600, type: "FIXO", date: new Date().toISOString() }
        ]);
        setLoading(false);
      }, 500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lançar Despesa Geral (Luz, Água)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setExpenses([{ id: Date.now(), description: desc, amount: Number(amount), type: "FIXO", date: new Date().toISOString() }, ...expenses]);
      setDesc("");
      setAmount("");
      setIsModalOpen(false);
      setIsSubmitting(false);
    }, 400);
  };

  // Lançar Vale/Despesa do Barbeiro
  const handleAddVale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const activeBarber = barbers.find(b => b.id === activeTab);
      if (!activeBarber) return;

      // 1. Adiciona o vale na conta do barbeiro (para abater da comissão dele)
      setBarbers(prev => prev.map(b => 
        b.id === activeTab 
          ? { ...b, personalExpenses: b.personalExpenses + Number(valeAmount) } 
          : b
      ));

      // 2. Adiciona o vale nas despesas gerais da barbearia (pois o dinheiro saiu do caixa físico hoje)
      setExpenses([{ 
        id: Date.now(), 
        description: `Vale/Desconto: ${activeBarber.name} (${valeDesc})`, 
        amount: Number(valeAmount), 
        type: "VALE",
        date: new Date().toISOString() 
      }, ...expenses]);

      setValeDesc("");
      setValeAmount("");
      setIsValeModalOpen(false);
      setIsSubmitting(false);
    }, 400);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Scissors className="w-12 h-12 text-[#C88E70]" />
      </motion.div>
    </div>
  );

  // --- MATEMÁTICA DA VISÃO GERAL ---
  const faturamentoBruto = barbers.reduce((acc, curr) => acc + curr.totalEarned, 0); // Soma de tudo que todos produziram
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0); // Todas as saídas de dinheiro (Custos + Vales)
  const comissoesBrutasPagas = barbers.reduce((acc, curr) => acc + (curr.totalEarned * curr.commissionRate), 0);
  
  // Lucro da casa = Tudo que entrou - Todas as comissões devidas - Custos Fixos. 
  // (Vales não entram nessa dedução do lucro da casa, pois já foram deduzidos do bolso do barbeiro)
  const despesasFixas = expenses.filter(e => e.type === "FIXO").reduce((acc, curr) => acc + curr.amount, 0);
  const lucroBarbearia = faturamentoBruto - comissoesBrutasPagas - despesasFixas;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto space-y-8">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-tight">Gestão <span className="text-[#C88E70] italic">Financeira</span></h2>
          <p className="text-gray-400 mt-2 text-sm">Controle geral da barbearia e fechamento de caixa individual de cada profissional.</p>
        </div>

        {/* NAVEGAÇÃO DAS ABAS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
          <button 
            onClick={() => setActiveTab("GERAL")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors relative whitespace-nowrap ${activeTab === "GERAL" ? "text-[#C88E70]" : "text-gray-500 hover:text-white"}`}
          >
            Visão Geral (Casa)
            {activeTab === "GERAL" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C88E70]" />}
          </button>
          
          {barbers.map(barber => (
            <button 
              key={barber.id}
              onClick={() => setActiveTab(barber.id)}
              className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === barber.id ? "text-white" : "text-gray-500 hover:text-white"}`}
            >
              <User className="w-3 h-3" />
              {barber.name.split(" ")[0]}
              {activeTab === barber.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =========================================================================
                                 ABA: VISÃO GERAL (CASA)
           ========================================================================= */}
        {activeTab === "GERAL" && (
          <motion.div 
            key="geral"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#C88E70]/10 border border-[#C88E70]/30 text-[#C88E70] hover:bg-[#C88E70] hover:text-[#050B14] font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center gap-2"
              >
                <TrendingDown className="w-4 h-4" /> Despesa da Barbearia
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Faturamento Bruto */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                 <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Entradas (Bruto)
                 </p>
                 <h2 className="text-3xl font-serif text-white/80 mb-1">R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-500">Produção total de todos os barbeiros.</p>
              </div>

              {/* Comissões Devidas */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                 <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Scissors className="w-4 h-4" /> Comissões (A Pagar)
                 </p>
                 <h2 className="text-3xl font-serif text-white/80 mb-1">R$ {comissoesBrutasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-500">Parte destinada aos profissionais.</p>
              </div>

              {/* Lucro da Casa */}
              <div className="bg-[#C88E70]/10 border border-[#C88E70]/40 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88E70]/20 blur-[50px]" />
                <p className="text-[#C88E70] font-bold text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
                   <Wallet className="w-4 h-4" /> Lucro Líquido (Barbearia)
                </p>
                <h2 className="text-4xl font-serif text-white mb-2 relative z-10">R$ {lucroBarbearia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <p className="text-xs text-gray-400 relative z-10">O que sobra livre para o caixa do negócio.</p>
              </div>
            </div>

            {/* EXPENSES LIST (CAIXA FÍSICO) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" /> Saídas do Caixa Físico (Hoje)
              </h3>
              
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">Nenhuma saída registrada no caixa hoje.</div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((exp: any) => (
                    <div key={exp.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${exp.type === 'VALE' ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                          <DollarSign className={`w-4 h-4 ${exp.type === 'VALE' ? 'text-orange-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{exp.description}</h4>
                          <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${exp.type === 'VALE' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-gray-400'}`}>
                            {exp.type === 'VALE' ? 'Descontado do Barbeiro' : 'Custo Fixo'}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg font-serif text-red-400">
                        - R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
                                ABA: CAIXA INDIVIDUAL DO BARBEIRO
           ========================================================================= */}
        {typeof activeTab === "number" && (
          <motion.div 
            key={`barber-${activeTab}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {(() => {
              const barber = barbers.find(b => b.id === activeTab)!;
              const comissaoBruta = barber.totalEarned * barber.commissionRate;
              const aReceberLivre = comissaoBruta - barber.personalExpenses;

              return (
                <>
                  <div className="flex justify-between items-end bg-gradient-to-r from-white/5 to-transparent border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-serif text-white">{barber.name}</h2>
                        <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                          {(barber.commissionRate * 100)}% Comissão
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Resumo do dia e fechamento de comissões.</p>
                    </div>
                    <button 
                      onClick={() => setIsValeModalOpen(true)}
                      className="relative z-10 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4" /> Lançar Despesa / Vale
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cortes Hoje</p>
                      <p className="text-2xl font-serif text-white">{barber.cutsToday}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Produção Bruta</p>
                      <p className="text-2xl font-serif text-white">R$ {barber.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl">
                      <p className="text-[10px] text-green-500 uppercase tracking-widest mb-1">Sua Comissão</p>
                      <p className="text-2xl font-serif text-green-400">+ R$ {comissaoBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                      <p className="text-[10px] text-red-500 uppercase tracking-widest mb-1">Vales Descontados</p>
                      <p className="text-2xl font-serif text-red-400">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                    <p className="text-blue-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Líquido a Pagar Hoje</p>
                    <h1 className="text-6xl font-serif text-white mb-8">R$ {aReceberLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-sm px-12 py-4 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                      Finalizar e Pagar
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
                                     MODAIS
         ========================================================================= */}
      
      {/* ADD DESPESA DA CASA MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-[#C88E70]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="p-8 relative z-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Despesa <span className="text-[#C88E70] italic">da Casa</span></h2>
                <p className="text-gray-400 text-xs mb-6">Custos gerais (Água, Luz, Aluguel). Afeta apenas o lucro da barbearia.</p>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <input required type="text" placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C88E70]" />
                  <input required type="number" step="0.01" placeholder="Valor (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C88E70]" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#C88E70] hover:bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl mt-4">Confirmar Custo Fixo</button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD VALE DO BARBEIRO MODAL */}
      <AnimatePresence>
        {isValeModalOpen && typeof activeTab === "number" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="p-8 relative z-10">
                <button onClick={() => setIsValeModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Vale / <span className="text-red-400 italic">Despesa Pessoal</span></h2>
                <p className="text-gray-400 text-xs mb-6">Será descontado do acerto diário deste barbeiro e registrado na saída do caixa físico.</p>
                <form onSubmit={handleAddVale} className="space-y-4">
                  <input required type="text" placeholder="Ex: Adiantamento, Lanche, Lâminas..." value={valeDesc} onChange={(e) => setValeDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-400" />
                  <input required type="number" step="0.01" placeholder="Valor (R$)" value={valeAmount} onChange={(e) => setValeAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-400" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-red-500/20 border border-red-500/50 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl mt-4">Descontar do Barbeiro</button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
