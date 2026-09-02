"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Scissors, Bell, User as UserIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);


  useEffect(() => {
    // Básico: busca os últimos agendamentos para criar notificações simples
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.appointments.slice(0, 5));
        }
      } catch (e) {}
    };
    fetchNotifs();
  }, []);

  return (
    <div className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans selection:bg-[#C88E70] selection:text-black">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C88E70]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C88E70]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Ultra Premium Floating Sidebar (Desktop) */}
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 h-[80vh] w-20 flex flex-col items-center py-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl z-50">
        
        <Link href="/" className="mb-auto group relative">
          <Scissors className="w-6 h-6 text-[#C88E70] group-hover:rotate-180 transition-transform duration-700" />
        </Link>

        <div className="flex flex-col gap-8">
          {((session?.user as any)?.role === 'CLIENT' ? [ 
            { id: "/dashboard", icon: LayoutDashboard, label: "Meus Agendamentos" },
            { id: "/dashboard/settings", icon: Settings, label: "Meus Dados" },
          ] : [ 
            { id: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
            { id: "/dashboard/agenda", icon: Calendar, label: "Agenda" },
            { id: "/dashboard/financeiro", icon: Wallet, label: "Financeiro" },
            { id: "/dashboard/clientes", icon: Users, label: "Clientes" },
            { id: "/dashboard/settings", icon: Settings, label: "Ajustes" },
          ]).map((item) => (
            <Link
              key={item.id}
              href={item.id}
              className="relative group p-3"
            >
              <item.icon className={`w-5 h-5 relative z-10 transition-colors duration-300 text-gray-500 group-hover:text-[#C88E70]`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-md opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs tracking-widest uppercase">
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-auto p-3 text-gray-500 hover:text-red-400 transition-colors group relative">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Top Header */}
      <header className="pl-40 pr-12 pt-12 flex justify-between items-end relative z-50">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif text-white tracking-tight"
          >
            BOM DIA, <span className="text-[#C88E70] italic">{(session?.user as any)?.role === 'CLIENT' ? (session?.user?.name?.split(' ')[0] || 'CLIENTE').toUpperCase() : 'GESTOR'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm mt-2 font-light tracking-wide"
          >
            {(session?.user as any)?.role === 'CLIENT' ? 'Acompanhe seus agendamentos e histórico conosco.' : 'O seu império aguarda. Aqui está o resumo de hoje.'}
          </motion.p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {notifications.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-[#C88E70] rounded-full shadow-[0_0_10px_#C88E70]"></span>}
            </button>
            
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-80 bg-[#050B14] border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                >
                  <h3 className="text-white font-serif mb-4">Notificações Recentes</h3>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Sem novidades no momento.</p>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-[#C88E70] font-semibold mb-1">{n.status === 'CONFIRMED' ? 'NOVO AGENDAMENTO' : n.status}</p>
                          <p className="text-white text-sm">{n.user?.name || 'Cliente'} - {n.service?.name}</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(n.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Profile Picture (temporarily just opens an alert until image bucket is configured) */}
          <button 
            onClick={() => alert("O upload de fotos de perfil requer a configuração de um Storage (Vercel Blob ou Amazon S3). Esta funcionalidade será ativada na versão final do sistema!")}
            className="w-12 h-12 rounded-full bg-white/5 border border-[#C88E70] flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
          >
             <UserIcon className="w-5 h-5 text-[#C88E70]" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pl-40 pr-12 pt-12 pb-24 h-screen overflow-y-auto relative z-10 scrollbar-hide">
        {children}
      </main>
      
    </div>
  );
}
