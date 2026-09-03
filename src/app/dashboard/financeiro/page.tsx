"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Wallet, ArrowUpRight, ArrowDownRight, Scissors, Receipt } from "lucide-react";

export default function FinanceiroPage() {
  // MOCK DATA PARA VISUALIZAÇÃO
  const [data, setData] = useState({ revenue: 15400 }); // Faturamento Bruto Mês
  const [expenses, setExpenses] = useState<any[]>([]); // Despesas da Casa
  const [loading, setLoading] = useState(true);
  
  // Modal Despesa da Casa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Vale/Despesa do Barbeiro
  const [isValeModalOpen, setIsValeModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [valeDesc, setValeDesc] = useState("");
  const [valeAmount, setValeAmount] = useState("");

  // MOCK dos Caixas Individuais (Dia/Mês)
  const [barbersCaixa, setBarbersCaixa] = useState([
    { id: 1, name: "Maria (Dona)", commissionRate: 0.6, totalEarned: 8400, personalExpenses: 0, color: "from-[#C88E70]/20 to-transparent", border: "border-[#C88E70]/40" },
    { id: 2, name: "Pedro (Barbeiro 2)", commissionRate: 0.5, totalEarned: 4000, personalExpenses: 120, color: "from-blue-500/10 to-transparent", border: "border-blue-500/20" },
    { id: 3, name: "Lucas (Barbeiro 3)", commissionRate: 0.5, totalEarned: 3000, personalExpenses: 45, color: "from-purple-500/10 to-transparent", border: "border-purple-500/20" }
  ]);

  const fetchData = async () => {
    try {
      setTimeout(() => {
        setExpenses([
          { id: 1, description: "Conta de Luz", amount: 450, date: new Date().toISOString() },
          { id: 2, description: "Pomadas em Atacado", amount: 600, date: new Date().toISOString() }
        ]);
        setLoading(false);
      }, 800);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setExpenses([{ id: Date.now(), description: desc, amount: Number(amount), date: new Date().toISOString() }, ...expenses]);
      setDesc("");
      setAmount("");
      setIsModalOpen(false);
      setIsSubmitting(false);
    }, 500);
  };

  const handleAddVale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setBarbersCaixa(prev => prev.map(b => 
        b.id === selectedBarber.id 
          ? { ...b, personalExpenses: b.personalExpenses + Number(valeAmount) } 
          : b
      ));
      setValeDesc("");
      setValeAmount("");
      setIsValeModalOpen(false);
      setIsSubmitting(false);
    }, 500);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Scissors className="w-12 h-12 text-[#C88E70]" />
      </motion.div>
    </div>
  );

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Lucro Líquido da Barbearia = O que sobrou do bruto - (o que foi pago pros barbeiros) - despesas
  const comissoesPagas = barbersCaixa.reduce((acc, curr) => acc + (curr.totalEarned * curr.commissionRate), 0);
  const lucroBarbearia = data.revenue - comissoesPagas - totalExpenses;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto space-y-12">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-serif text-white tracking-tight">Caixas <span className="text-[#C88E70] italic">Individuais</span></h2>
          <p className="text-gray-400 mt-2 text-sm max-w-xl">Gestão inteligente do dia. Cada barbeiro tem seu vale, e a casa tem suas despesas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative px-6 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl overflow-hidden hover:scale-105 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <TrendingDown className="w-4 h-4" /> 
          <span>Despesa da Casa</span>
        </button>
      </div>

      {/* METRICS GRID - MAIN (CAIXA DA BARBEARIA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faturamento Bruto */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] transition-colors" />
           <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Faturamento Bruto (Dia/Mês)
           </p>
           <h2 className="text-4xl font-serif text-white/80 mb-2">
             R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </h2>
           <p className="text-xs text-gray-500 mt-2">Soma total de todos os serviços realizados.</p>
        </div>

        {/* Caixa da Barbearia (Lucro Real) */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-[#C88E70]/10 to-transparent border border-[#C88E70]/40 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group shadow-[0_0_40px_rgba(200,142,112,0.1)]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#C88E70]/20 blur-[60px] group-hover:bg-[#C88E70]/40 transition-colors" />
          <p className="text-[#C88E70] font-bold text-xs tracking-[0.2em] uppercase mb-4 flex items-center gap-2 relative z-10">
             <Wallet className="w-4 h-4" /> Lucro da Casa (Livre)
          </p>
          <h2 className="text-5xl font-serif text-white mb-2 relative z-10">
            R$ {lucroBarbearia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center justify-between mt-6 relative z-10">
             <span className="text-xs text-gray-400">Comissões pagas: R$ {comissoesPagas.toLocaleString('pt-BR')}</span>
             <span className="text-xs text-red-400">Custos fixos abatidos: R$ {totalExpenses.toLocaleString('pt-BR')}</span>
          </div>
        </motion.div>
      </div>

      {/* CAIXAS INDIVIDUAIS DOS BARBEIROS (CHECKOUT) */}
      <div>
        <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#C88E70]" /> Checkout dos Barbeiros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbersCaixa.map((barber) => {
            const comissaoBruta = barber.totalEarned * barber.commissionRate;
            const aReceber = comissaoBruta - barber.personalExpenses;
            
            return (
              <motion.div 
                key={barber.id}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`flex flex-col bg-gradient-to-br ${barber.color} border ${barber.border} rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm h-full`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{barber.name}</h4>
                    <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                      {(barber.commissionRate * 100)}% Comissão
                    </span>
                  </div>
                  <button 
                    onClick={() => { setSelectedBarber(barber); setIsValeModalOpen(true); }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors group relative"
                    title="Lançar Vale/Despesa Pessoal"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Produziu (Bruto):</span>
                    <span className="text-white">R$ {barber.totalEarned.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Sua parte (Comissão):</span>
                    <span className="text-green-400">+ R$ {comissaoBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Vales/Giletes (Descontos):</span>
                    <span className="text-red-400">- R$ {barber.personalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-auto">
                  <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Líquido a Pagar (Final do Dia)</p>
                  <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-serif text-white">
                      R$ {aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                    <button className="text-[#050B14] bg-[#C88E70] hover:bg-white text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors">
                      Pagar
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* EXPENSES LIST (CUSTOS DA CASA) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-400" /> Custos Fixos (Casa)
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

      {/* ADD DESPESA DA CASA MODAL */}
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
              className="bg-[#050B14] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />

              <div className="p-8 relative z-10">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/10 z-50">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-serif text-white mb-2">Registrar <span className="text-red-400 italic">Custo da Casa</span></h2>
                <p className="text-gray-400 text-sm font-light mb-8">Essa despesa (Água, Luz, Aluguel) será abatida APENAS do Lucro do Dono, e não das comissões.</p>

                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-1">Descrição</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Conta de Luz, Aluguel..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-red-400 transition-colors"
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-red-400 transition-colors"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-red-500/20 border border-red-500/50 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-colors disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? "Registrando..." : "Confirmar Despesa da Casa"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD VALE DO BARBEIRO MODAL */}
      <AnimatePresence>
        {isValeModalOpen && selectedBarber && (
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
              className="bg-[#050B14] border border-orange-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

              <div className="p-8 relative z-10">
                <button onClick={() => setIsValeModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/10 z-50">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-serif text-white mb-2">Desconto / <span className="text-orange-400 italic">Vale</span></h2>
                <p className="text-gray-400 text-sm font-light mb-8">
                  Isso será descontado do acerto diário do(a) <strong className="text-white">{selectedBarber.name}</strong>.
                </p>

                <form onSubmit={handleAddVale} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-1">Motivo do Desconto</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Vale Almoço, Giletes, Produto..."
                      value={valeDesc}
                      onChange={(e) => setValeDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold ml-1">Valor (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={valeAmount}
                      onChange={(e) => setValeAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-orange-500/20 border border-orange-500/50 hover:bg-orange-500 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-colors disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? "Registrando..." : "Lançar Desconto"}
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
