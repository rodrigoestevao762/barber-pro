const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/financeiro/page.tsx', 'utf8');

// 1. Adicionar handleReopenCaixa
const reopenFunc =   const handleReopenCaixa = () => {
    const activeBarber = barbers.find(b => b.id === activeTab);
    if (!activeBarber || !activeBarber.isClosed) return;

    if (window.confirm(\Tem certeza que deseja REABRIR o caixa de \ para o dia \?\)) {
      const newBarbers = barbers.map(b => 
        b.id === activeTab 
          ? { ...b, isClosed: false } 
          : b
      );
      setBarbers(newBarbers);
      saveToLocal(newBarbers, expenses);
    }
  };

  const handleCloseCaixa;

content = content.replace('  const handleCloseCaixa', reopenFunc);

// 2. Modificar UI do Caixa Fechado para adicionar o botão de reabrir
const uiOld =                       {barber.isClosed && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                          <h2 className="text-4xl font-serif text-white/50 transform -rotate-12 uppercase tracking-[0.3em] font-bold border-4 border-white/20 px-8 py-4 rounded-xl">Caixa Fechado</h2>
                        </div>
                      )};

const uiNew =                       {barber.isClosed && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                          <h2 className="text-4xl font-serif text-white/50 transform -rotate-12 uppercase tracking-[0.3em] font-bold border-4 border-white/20 px-8 py-4 rounded-xl mb-6">Caixa Fechado</h2>
                          <button 
                            onClick={handleReopenCaixa}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs px-6 py-3 rounded-full border border-white/20 transition-all hover:scale-105"
                          >
                            Reabrir Caixa
                          </button>
                        </div>
                      )};

content = content.replace(uiOld, uiNew);

fs.writeFileSync('src/app/dashboard/financeiro/page.tsx', content, 'utf8');