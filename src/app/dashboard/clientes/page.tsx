import prisma from '@/lib/prisma';
import { Users, Phone, Mail } from 'lucide-react';

export default async function ClientesPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <h2 className="text-3xl font-serif text-white mb-8 flex items-center gap-3">
          <Users className="text-[#C88E70]" /> Todos os Clientes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 && <p className="text-gray-500 italic">Nenhum cliente cadastrado.</p>}
          {clients.map(client => (
            <div key={client.id} className="p-6 bg-black/20 border border-white/5 rounded-2xl flex flex-col gap-4 hover:border-[#C88E70]/30 transition-colors">
              <div>
                <h4 className="text-white font-medium text-xl">{client.name || "Sem Nome"}</h4>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Cliente desde {client.createdAt.getFullYear()}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C88E70]" /> {client.phone || "Não informado"}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C88E70]" /> {client.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

