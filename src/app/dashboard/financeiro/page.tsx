"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Wallet, ArrowUpRight, Scissors, Receipt, User, Award, Shield } from "lucide-react";
import { BARBERS } from "@/lib/barbers";

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

  // Estado das Abas: "GERAL" ou o ID do barbeiro ("barbeiro-dono", "barbeiro-lucas", "barbeiro-felipe")
  const [activeTab, setActiveTab] = useState<string>("GERAL");
  
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
      const storedBarbers = localStorage.getItem(`barbers_${dateStr}`);
      const storedExpenses = localStorage.getItem(`expenses_${dateStr}`);
      
      if (storedBarbers) {
        setBarbers(JSON.parse(storedBarbers));
      } else {
        // Inicializa com a equipe oficial Mr. Bastos (Dono 100%, Barbeiros 45%)
        setBarbers(
          BARBERS.map((b) => ({
            id: b.id,
            name: b.name,
            role: b.role,
            cutsToday: 0,
            totalEarned: 0,
            personalExpenses: 0,
            isClosed: false,
            commissionRate: b.role === "ADMIN" ? 1.0 : 0.45,
          }))
        );
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

  // Lançar Despesa Geral (Luz, Água, Aluguel)
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

      const newBarbers = barbers.map(b => 
        b.id === activeTab 
          ? { ...b, personalExpenses: b.personalExpenses + Number(valeAmount) } 
          : b
      );

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
      <div className="animate-pulse text-[#C88E70]">
        <Scissors className="w-12 h-12" />
      </div>
    </div>
  );

  // --- MATEMÁTICA FINANCEIRA OFICIAL (45% PARA BARBEIROS, 100% PARA O DONO) ---
  const faturamentoBruto = barbers.reduce((acc, curr) => acc + curr.totalEarned, 0);
  const despesasFixas = expenses.filter(e => e.type === "FIXO").reduce((acc, curr) => acc + curr.amount, 0);

  // Comissões dos funcionários (45%)
  const comissoesFuncionarios = barbers
    .filter(b => b.role === "BARBER")
    .reduce((acc, b) => acc + (b.totalEarned * 0.45), 0);

  // Faturamento próprio do Dono (100%)
  const donoBarber = barbers.find(b => b.role === "ADMIN");
  const faturamentoProprioDono = donoBarber ? donoBarber.totalEarned : 0;

  // Repasse dos funcionários retido pela barbearia (55%)
  const repasseRetidoEquipe = barbers
    .filter(b => b.role === "BARBER")
    .reduce((acc, b) => acc + (b.totalEarned * 0.55), 0);

  // Lucro bruto retido pela casa = Dono (100%) + 55% dos funcionários
  const lucroBrutoCasa = faturamentoProprioDono + repasseRetidoEquipe;
  
  // Lucro líquido da barbearia após abater despesas fixas (Água, Luz, etc.)
  const lucroLiquidoCasa = lucroBrutoCasa - despesasFixas;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto space-y-8 pb-12">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-[#C88E70]/20 text-[#C88E70] border border-[#C88E70]/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Regra Oficial de Repasse
              </span>
              <span className="text-xs text-gray-400">45% Funcionários · 100% Dono</span>
            </div>
            <h2 className="text-4xl font-serif text-white tracking-tight">Gestão <span className="text-[#C88E70] italic">Financeira</span></h2>
            <p className="text-gray-400 mt-1 text-sm">Controle geral da barbearia, comissões de 45% e fechamento de caixa individual.</p>
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
          
          {barbers.map(barber => {
            const isOwner = barber.role === "ADMIN";
            return (
              <button 
                key={barber.id}
                onClick={() => setActiveTab(barber.id)}
                className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === barber.id ? "text-white" : "text-gray-500 hover:text-white"}`}
              >
                {isOwner ? <Shield className="w-3.5 h-3.5 text-[#C88E70]" /> : <Scissors className="w-3.5 h-3.5 text-blue-400" />}
                {barber.name.split(" ")[0]}
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isOwner ? "bg-[#C88E70] text-black" : "bg-white/10 text-gray-300"}`}>
                  {isOwner ? "Dono" : "45%"}
                </span>
                {activeTab === barber.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
              </button>
            );
          })}
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
                className="px-6 py-3 bg-[#C88E70]/10 border border-[#C88E70]/30 text-[#C88E70] hover:bg-[#C88E70] hover:text-[#050B14] font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-[#C88E70]/20"
              >
                <TrendingDown className="w-4 h-4" /> Despesa Fixa da Barbearia
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Faturamento Bruto Total */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Entradas Brutas
                 </p>
                 <h2 className="text-3xl font-serif text-white mb-1">R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-500">Produção total somada de toda a equipe.</p>
              </div>

              {/* Comissões a Pagar (45%) */}
              <div className="bg-[#C88E70]/10 border border-[#C88E70]/30 rounded-2xl p-6">
                 <p className="text-[#C88E70] text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2 font-semibold">
                    <Scissors className="w-4 h-4" /> Comissões a Pagar (45%)
                 </p>
                 <h2 className="text-3xl font-serif text-[#C88E70] mb-1">R$ {comissoesFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-400">Total devido aos barbeiros funcionários.</p>
              </div>

              {/* Repasse da Equipe à Barbearia (55%) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Repasse Equipe (55%)
                 </p>
                 <h2 className="text-3xl font-serif text-white mb-1">R$ {repasseRetidoEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                 <p className="text-xs text-gray-500">Fatia retida pela estrutura da barbearia.</p>
              </div>

              {/* Lucro Líquido da Barbearia */}
              <div className="bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl" />
                <p className="text-emerald-400 font-bold text-[10px] tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
                   <Wallet className="w-4 h-4" /> Saldo Líquido Barbearia
                </p>
                <h2 className="text-3xl font-serif text-emerald-400 mb-1 relative z-10">R$ {lucroLiquidoCasa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <p className="text-xs text-emerald-400/70 relative z-10">Dono 100% + 55% equipe - custos fixos.</p>
              </div>
            </div>

            {/* EXPENSES LIST (CAIXA FÍSICO) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" /> Saídas e Vales do Caixa (Hoje)
              </h3>
              
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">Nenhuma saída ou vale registrado hoje.</div>
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
                            {exp.type === 'VALE' ? 'Descontado do Barbeiro' : 'Custo Fixo Barbearia'}
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

            {/* ADMIN RESUMO DOS BARBEIROS (COMISSÕES EXATAS) */}
            <div>
              <h3 className="text-xl font-serif text-white mb-6 mt-12 flex items-center gap-2">
                <User className="w-5 h-5 text-[#C88E70]" /> Fechamento Diário por Profissional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {barbers.map(barber => {
                  const isOwner = barber.role === "ADMIN";
                  const gross = barber.totalEarned;
                  const commissionDue = isOwner ? gross : gross * 0.45;
                  const liquidoAPagar = Math.max(0, commissionDue - barber.personalExpenses);
                  const houseRetained = isOwner ? 0 : gross * 0.55;

                  return (
                    <div key={`summary-${barber.id}`} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                          <div>
                            <h4 className="text-white font-bold">{barber.name}</h4>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${isOwner ? "bg-[#C88E70] text-black" : "bg-blue-500/20 text-blue-400"}`}>
                              {isOwner ? "Proprietário (100%)" : "Comissão 45%"}
                            </span>
                          </div>
                          <button 
                            onClick={() => setActiveTab(barber.id)}
                            className="text-[10px] bg-white/5 hover:bg-[#C88E70] hover:text-black text-gray-300 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all"
                          >
                            Abrir Caixa
                          </button>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Produção Bruta:</span>
                            <span className="text-white font-mono">R$ {gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-xs text-[#C88E70]">
                            <span>Comissão Calculada ({isOwner ? "100%" : "45%"}):</span>
                            <span className="font-mono font-bold">+ R$ {commissionDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {!isOwner && (
                            <div className="flex justify-between text-xs text-emerald-400">
                              <span>Repasse Casa (55%):</span>
                              <span className="font-mono">+ R$ {houseRetained.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-red-400">
                            <span>Vales/Descontos:</span>
                            <span className="font-mono">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Líquido a Pagar</span>
                        <span className="text-xl font-serif text-[#C88E70]">R$ {liquidoAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
        {activeTab !== "GERAL" && (
          <motion.div 
            key={`barber-${activeTab}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {(() => {
              const barber = barbers.find(b => b.id === activeTab);
              if (!barber) return null;

              const isOwner = barber.role === "ADMIN";
              const gross = barber.totalEarned;
              const commissionDue = isOwner ? gross : gross * 0.45;
              const aReceberLivre = Math.max(0, commissionDue - barber.personalExpenses);
              const repasseBarbearia = isOwner ? 0 : gross * 0.55;

              return (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-gradient-to-r from-white/5 to-transparent border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-serif text-white">{barber.name}</h2>
                        <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold ${isOwner ? "bg-[#C88E70] text-black" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}>
                          {isOwner ? "DONO · 100%" : "COMISSÃO 45%"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {isOwner 
                          ? "Caixa de faturamento pessoal do proprietário da barbearia."
                          : "Caixa do barbeiro com cálculo de comissão de 45% e abatimento automático de vales."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 relative z-10">
                      {!barber.isClosed && (
                        <>
                          <button 
                            onClick={() => { setSelectedBarber(barber); setIsWalkInModalOpen(true); }}
                            className="px-5 py-3 bg-[#C88E70] hover:bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#C88E70]/20"
                          >
                            <Plus className="w-4 h-4" /> Registrar Serviço
                          </button>
                          <button 
                            onClick={() => { setSelectedBarber(barber); setIsValeModalOpen(true); }}
                            className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Receipt className="w-4 h-4" /> Lançar Vale / Desconto
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cortes Hoje</p>
                      <p className="text-2xl font-serif text-white">{barber.cutsToday}</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Produção Bruta (100%)</p>
                      <p className="text-2xl font-serif text-white">R$ {gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="bg-[#C88E70]/10 border border-[#C88E70]/30 p-6 rounded-2xl">
                      <p className="text-[10px] text-[#C88E70] uppercase tracking-widest mb-1 font-semibold">
                        Comissão ({isOwner ? "100%" : "45%"})
                      </p>
                      <p className="text-2xl font-serif text-[#C88E70]">+ R$ {commissionDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                      <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Vales / Descontos</p>
                      <p className="text-2xl font-serif text-red-400">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Card Central de Saldo Líquido do Dia */}
                  <div className={`bg-gradient-to-br from-[#C88E70]/15 via-[#050B14] to-black border border-[#C88E70]/40 rounded-3xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden ${barber.isClosed ? 'opacity-70' : ''}`}>
                    {barber.isClosed && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                        <h2 className="text-3xl font-serif text-white transform -rotate-6 uppercase tracking-[0.2em] font-bold border-2 border-white/30 px-8 py-3 rounded-xl mb-6">
                          Caixa Fechado
                        </h2>
                        <button 
                          onClick={handleReopenCaixa}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full border border-white/20 transition-all hover:scale-105"
                        >
                          Reabrir Caixa
                        </button>
                      </div>
                    )}
                    <p className="text-[#C88E70] text-xs uppercase tracking-[0.25em] font-bold mb-3 relative z-0">
                      {isOwner ? "Faturamento Líquido do Dono Hoje" : "Saldo Líquido a Pagar ao Barbeiro Hoje (45% - Vales)"}
                    </p>
                    <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 relative z-0">
                      R$ {aReceberLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h1>
                    <button 
                      onClick={handleCloseCaixa}
                      disabled={barber.isClosed}
                      className={`text-[#050B14] font-bold uppercase tracking-widest text-xs px-10 py-4 rounded-full transition-all relative z-0 ${barber.isClosed ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#C88E70] hover:bg-white hover:scale-105 shadow-xl shadow-[#C88E70]/25'}`}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-[#C88E70]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="p-8 relative z-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Despesa <span className="text-[#C88E70] italic">da Barbearia</span></h2>
                <p className="text-gray-400 text-xs mb-6">Custos fixos gerais (Água, Luz, Aluguel). Afeta apenas o saldo líquido da casa.</p>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <input required type="text" placeholder="Descrição (ex: Conta de Energia)" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C88E70]" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="p-8 relative z-10">
                <button onClick={() => setIsValeModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Vale / <span className="text-red-400 italic">Despesa de {selectedBarber.name.split(" ")[0]}</span></h2>
                <p className="text-gray-400 text-xs mb-6">Será descontado diretamente da comissão deste barbeiro no acerto de hoje.</p>
                <form onSubmit={handleAddVale} className="space-y-4">
                  <input required type="text" placeholder="Motivo do vale (ex: Adiantamento, Lanche)" value={valeDesc} onChange={(e) => setValeDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-400" />
                  <input required type="number" step="0.01" placeholder="Valor (R$)" value={valeAmount} onChange={(e) => setValeAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-400" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-red-500/20 border border-red-500/50 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl mt-4">Descontar da Comissão</button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGISTRAR SERVIÇO (WALK-IN) MODAL */}
      <AnimatePresence>
        {isWalkInModalOpen && selectedBarber && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#050B14] border border-[#C88E70]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative max-h-[80vh] flex flex-col">
              <div className="p-8 pb-4 relative z-10 shrink-0">
                <button onClick={() => setIsWalkInModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-2xl font-serif text-white mb-2">Registrar <span className="text-[#C88E70] italic">Serviço</span></h2>
                <p className="text-gray-400 text-xs mb-2">
                  Adicionar serviço ao caixa de <strong className="text-white">{selectedBarber.name}</strong>.
                </p>
              </div>
              <div className="p-8 pt-0 overflow-y-auto space-y-3 pb-8 relative z-10 flex-1">
                {[
                  { id: "corte", name: "Corte", duration: 30, price: 35 },
                  { id: "barba", name: "Barba", duration: 30, price: 25 },
                  { id: "cabeca-navalha", name: "Cabeça raspada navalha", duration: 30, price: 25 },
                  { id: "pezinho", name: "Pezinho", duration: 15, price: 20 },
                  { id: "barba-maquina", name: "Barba raspada na máquina", duration: 20, price: 20 },
                  { id: "sobrancelha", name: "Sobrancelha", duration: 15, price: 15 },
                  { id: "combo-corte-barba", name: "Corte + Barba", duration: 50, price: 55 },
                  { id: "combo-pezinho-barba", name: "Pezinho + Barba", duration: 40, price: 40 },
                  { id: "combo-corte-sobrancelha", name: "Corte + Sobrancelha", duration: 40, price: 45 },
                ].map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => handleRegisterService(svc)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#C88E70]/30 transition-all text-left disabled:opacity-50"
                  >
                    <div>
                      <h3 className="text-white font-medium">{svc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{svc.duration} min · Comissão ({selectedBarber.role === "ADMIN" ? "100%" : "45%"}): R$ {(svc.price * (selectedBarber.role === "ADMIN" ? 1.0 : 0.45)).toFixed(2)}</p>
                    </div>
                    <span className="text-[#C88E70] font-serif text-lg">R$ {svc.price.toFixed(2)}</span>
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
