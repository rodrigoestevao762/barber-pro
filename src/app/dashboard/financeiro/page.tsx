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

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  // Estado das Abas: "GERAL" ou o ID do barbeiro
  const [activeTab, setActiveTab] = useState<string | number>("GERAL");
  
  // Date filter
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Dados Globais
  const [expenses, setExpenses] = useState<any[]>([]); 
  const [barbers, setBarbers] = useState<any[]>([]);

  // Carrega os dados específicos do dia
  const loadDataForDate = async (dateStr: string) => {
    setLoading(true);
    try {
      // Tenta buscar do localStorage primeiro
      const storedBarbers = localStorage.getItem(`barbers_${dateStr}`);
      const storedExpenses = localStorage.getItem(`expenses_${dateStr}`);
      
      if (storedBarbers) {
        setBarbers(JSON.parse(storedBarbers));
      } else {
        // Estado zerado para dias novos
        setBarbers([
          { id: 1, name: "Maria (Dona)", cutsToday: 0, totalEarned: 0, personalExpenses: 0, isClosed: false },
          { id: 2, name: "Pedro (Barbeiro)", cutsToday: 0, totalEarned: 0, personalExpenses: 0, isClosed: false },
          { id: 3, name: "Lucas (Barbeiro)", cutsToday: 0, totalEarned: 0, personalExpenses: 0, isClosed: false }
        ]);
      }

      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      } else {
        setExpenses([]);
      }

      // Buscar Serviços Reais da API para o Modal
      const resServices = await fetch('/api/services');
      if (resServices.ok) {
        const jsonServices = await resServices.json();
        setServices(jsonServices);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  // Função helper para salvar estado atual no localStorage
  const saveToLocal = (newBarbers: any[], newExpenses: any[]) => {
    localStorage.setItem(`barbers_${selectedDate}`, JSON.stringify(newBarbers));
    localStorage.setItem(`expenses_${selectedDate}`, JSON.stringify(newExpenses));
  };

  const handleRegisterService = (service: any) => {
    if (!selectedBarber) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newBarbers = barbers.map(b => 
        b.id === selectedBarber.id 
          ? { ...b, cutsToday: b.cutsToday + 1, totalEarned: b.totalEarned + service.price } 
          : b
      );
      setBarbers(newBarbers);
      saveToLocal(newBarbers, expenses);
      
      setIsWalkInModalOpen(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleReopenCaixa = () => {
    const activeBarber = barbers.find(b => b.id === activeTab);
    if (!activeBarber || !activeBarber.isClosed) return;

    if (window.confirm(`Tem certeza que deseja REABRIR o caixa de ${activeBarber.name} para o dia ${selectedDate.split('-').reverse().join('/')}?`)) {
      const newBarbers = barbers.map(b => 
        b.id === activeTab 
          ? { ...b, isClosed: false } 
          : b
      );
      setBarbers(newBarbers);
      saveToLocal(newBarbers, expenses);
    }
  };

  const handleCloseCaixa = () => {
    const activeBarber = barbers.find(b => b.id === activeTab);
    if (!activeBarber || activeBarber.isClosed) return;

    if (window.confirm(`Tem certeza que deseja fechar o caixa de ${activeBarber.name} para o dia ${selectedDate.split('-').reverse().join('/')}? Isso travará novos lançamentos hoje.`)) {
      const newBarbers = barbers.map(b => 
        b.id === activeTab 
          ? { ...b, isClosed: true } 
          : b
      );
      setBarbers(newBarbers);
      saveToLocal(newBarbers, expenses);
    }
  };

  // Lançar Despesa Geral (Luz, Água)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newExpense = { id: Date.now(), description: desc, amount: Number(amount), type: "FIXO", date: new Date().toISOString() };
      const newExpenses = [newExpense, ...expenses];
      
      setExpenses(newExpenses);
      saveToLocal(barbers, newExpenses);
      
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

      // 1. Adiciona o vale na conta do barbeiro
      const newBarbers = barbers.map(b => 
        b.id === activeTab 
          ? { ...b, personalExpenses: b.personalExpenses + Number(valeAmount) } 
          : b
      );

      // 2. Adiciona o vale nas despesas gerais da barbearia
      const newExpense = { 
        id: Date.now(), 
        description: `Vale/Desconto: ${activeBarber.name} (${valeDesc})`, 
        amount: Number(valeAmount), 
        type: "VALE",
        date: new Date().toISOString() 
      };
      const newExpenses = [newExpense, ...expenses];

      setBarbers(newBarbers);
      setExpenses(newExpenses);
      saveToLocal(newBarbers, newExpenses);

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
  
  // Como o barbeiro recebe 100% da produção dele abatendo apenas vales, o valor total devido aos barbeiros é o Faturamento Bruto.
  // O lucro da casa se houver entradas que não foram feitas por barbeiros específicos (ou aluguéis de cadeira).
  const despesasFixas = expenses.filter(e => e.type === "FIXO").reduce((acc, curr) => acc + curr.amount, 0);
  const lucroBarbearia = faturamentoBruto - faturamentoBruto - despesasFixas; // Isso ficará negativo se a barbearia só tiver despesas e não retiver % dos cortes.

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto space-y-8">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif text-white tracking-tight">Gestão <span className="text-[#C88E70] italic">Financeira</span></h2>
            <p className="text-gray-400 mt-2 text-sm">Controle geral da barbearia e fechamento de caixa individual de cada profissional.</p>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-xs text-gray-400 uppercase tracking-widest">Filtrar por data:</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#C88E70] w-full md:w-auto [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
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

              {/* Valores Pagos */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                 <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Scissors className="w-4 h-4" /> Produção da Equipe
                 </p>
                 <h2 className="text-3xl font-serif text-white/80 mb-1">R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-500">Valor total movimentado nos caixas individuais.</p>
              </div>

              {/* Lucro da Casa */}
              <div className="bg-[#C88E70]/10 border border-[#C88E70]/40 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88E70]/20 blur-[50px]" />
                <p className="text-[#C88E70] font-bold text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
                   <Wallet className="w-4 h-4" /> Saldo da Barbearia
                </p>
                <h2 className="text-4xl font-serif text-white mb-2 relative z-10">R$ {lucroBarbearia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <p className="text-xs text-gray-400 relative z-10">Saldo líquido após custos fixos.</p>
              </div>
            </div>

            {/* EXPENSES LIST (CAIXA FÍSICO) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" /> Saídas do Caixa da Casa (Hoje)
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
                            {exp.type === 'VALE' ? 'Devido pelo Barbeiro' : 'Custo Fixo'}
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

            {/* ADMIN RESUMO DOS BARBEIROS */}
            <div>
              <h3 className="text-xl font-serif text-white mb-6 mt-12 flex items-center gap-2">
                <User className="w-5 h-5 text-[#C88E70]" /> Resumo de Fechamento da Equipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {barbers.map(barber => {
                  const liquidoAPagar = barber.totalEarned - barber.personalExpenses;
                  return (
                    <div key={`summary-${barber.id}`} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                        <h4 className="text-white font-bold">{barber.name}</h4>
                        <button 
                          onClick={() => setActiveTab(barber.id)}
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Saldo dos Cortes:</span>
                          <span className="text-green-400">+ R$ {barber.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Vales/Descontos:</span>
                          <span className="text-red-400">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Saldo Líquido</span>
                        <span className="text-xl font-serif text-white">R$ {liquidoAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              const aReceberLivre = barber.totalEarned - barber.personalExpenses;

              return (
                <>
                  <div className="flex justify-between items-end bg-gradient-to-r from-white/5 to-transparent border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-serif text-white">{barber.name}</h2>
                        <span className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                          CAIXA INDIVIDUAL
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Resumo do dia e fechamento.</p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      {!barber.isClosed && (
                        <>
                          <button 
                            onClick={() => { setSelectedBarber(barber); setIsWalkInModalOpen(true); }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4 text-[#C88E70]" /> Registrar Serviço
                          </button>
                          <button 
                            onClick={() => setIsValeModalOpen(true)}
                            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Receipt className="w-4 h-4" /> Lançar Despesa / Vale
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cortes Hoje</p>
                      <p className="text-2xl font-serif text-white">{barber.cutsToday}</p>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl">
                      <p className="text-[10px] text-green-500 uppercase tracking-widest mb-1">Produção (Saldo)</p>
                      <p className="text-2xl font-serif text-green-400">+ R$ {barber.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                      <p className="text-[10px] text-red-500 uppercase tracking-widest mb-1">Despesas/Vales</p>
                      <p className="text-2xl font-serif text-red-400">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className={`bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden ${barber.isClosed ? 'opacity-70' : ''}`}>
                    {barber.isClosed && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                        <h2 className="text-4xl font-serif text-white/50 transform -rotate-12 uppercase tracking-[0.3em] font-bold border-4 border-white/20 px-8 py-4 rounded-xl mb-6">Caixa Fechado</h2>
                        <button 
                          onClick={handleReopenCaixa}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full border border-white/20 transition-all hover:scale-105"
                        >
                          Reabrir Caixa
                        </button>
                      </div>
                    )}
                    <p className="text-blue-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 relative z-0">Saldo Líquido do Dia</p>
                    <h1 className="text-6xl font-serif text-white mb-8 relative z-0">R$ {aReceberLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
                    <button 
                      onClick={handleCloseCaixa}
                      disabled={barber.isClosed}
                      className={`text-white font-bold uppercase tracking-widest text-sm px-12 py-4 rounded-full transition-all relative z-0 ${barber.isClosed ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]'}`}
                    >
                      {barber.isClosed ? 'CAIXA FECHADO' : 'Fechar Caixa do Dia'}
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
        {isValeModalOpen && selectedBarber && (
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

      {/* REGISTRAR SERVIÇO (WALK-IN) MODAL */}
      <AnimatePresence>
        {isWalkInModalOpen && selectedBarber && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-[#C88E70]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative max-h-[80vh] flex flex-col">
              <div className="p-8 pb-4 relative z-10 shrink-0">
                <button onClick={() => setIsWalkInModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Registrar <span className="text-[#C88E70] italic">Serviço</span></h2>
                <p className="text-gray-400 text-xs mb-2">
                  Adicionar serviço ao caixa de <strong className="text-white">{selectedBarber.name}</strong>.
                </p>
              </div>
              <div className="p-8 pt-0 overflow-y-auto space-y-3 pb-8 relative z-10 flex-1">
                {services.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => handleRegisterService(svc)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#C88E70]/30 transition-all text-left disabled:opacity-50"
                  >
                    <div>
                      <h3 className="text-white font-medium">{svc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{svc.duration} min</p>
                    </div>
                    <span className="text-[#C88E70] font-serif text-lg">R$ {svc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
