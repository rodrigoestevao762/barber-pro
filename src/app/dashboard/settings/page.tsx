import { Settings, Scissors, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <h2 className="text-3xl font-serif text-white mb-8 flex items-center gap-3">
          <Settings className="text-[#C88E70]" /> Ajustes da Barbearia
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="text-xl font-medium text-white flex items-center gap-2"><Scissors className="w-5 h-5 text-[#C88E70]"/> Meus Serviços</h3>
             <p className="text-gray-400 text-sm">Para editar seus serviços, altere diretamente no banco de dados Prisma ou crie uma interface de edição aqui no futuro. Por enquanto, os serviços iniciais foram semeados.</p>
             <button className="px-6 py-3 bg-white/10 text-white rounded-lg opacity-50 cursor-not-allowed">Editar Serviços (Em Breve)</button>
          </div>
          <div className="space-y-4">
             <h3 className="text-xl font-medium text-white flex items-center gap-2"><Bell className="w-5 h-5 text-[#C88E70]"/> Notificações e Horários</h3>
             <p className="text-gray-400 text-sm">Configure os dias de funcionamento da barbearia. Atualmente padrão de Seg a Sáb.</p>
             <button className="px-6 py-3 bg-white/10 text-white rounded-lg opacity-50 cursor-not-allowed">Configurar Horários (Em Breve)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

