"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Scissors, Bell, User as UserIcon, Wallet, Archive, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("BOM DIA");

  const userRole = (session?.user as any)?.role || "ADMIN";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("BOM DIA");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("BOA TARDE");
    } else {
      setGreeting("BOA NOITE");
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role === "CLIENT") {
      router.push("/painel-cliente");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.appointments ? data.appointments.slice(0, 5) : []);
        }
      } catch (e) {}
    };
    fetchNotifs();
  }, []);

  // Menu dinâmico por perfil (Dono vs Barbeiro funcionário)
  const navItems = isAdmin
    ? [
        { id: "/dashboard", icon: LayoutDashboard, label: "Visão Geral (Casa)" },
        { id: "/dashboard/agenda", icon: Calendar, label: "Agenda Geral" },
        { id: "/dashboard/financeiro", icon: Wallet, label: "Financeiro Barbearia" },
        { id: "/dashboard/fechamento", icon: Archive, label: "Fechamento de Caixa" },
        { id: "/dashboard/clientes", icon: Users, label: "Clientes" },
        { id: "/dashboard/settings", icon: Settings, label: "Ajustes" },
      ]
    : [
        { id: "/dashboard", icon: LayoutDashboard, label: "Meus Atendimentos & Comissões" },
        { id: "/dashboard/agenda", icon: Calendar, label: "Minha Agenda" },
        { id: "/dashboard/financeiro", icon: Wallet, label: "Meu Caixa (45%)" },
        { id: "/dashboard/clientes", icon: Users, label: "Clientes" },
        { id: "/dashboard/settings", icon: Settings, label: "Meu Perfil" },
      ];

  return (
    <div className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Sidebar (Desktop) */}
      <nav className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 h-[80vh] w-20 flex-col items-center py-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl z-50">
        
        <Link href="/" className="mb-auto group relative">
          <Scissors className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
        </Link>

        <div className="flex flex-col gap-8">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.id}
              className="relative group p-3"
            >
              <item.icon className={`w-5 h-5 relative z-10 transition-colors duration-300 text-gray-400 group-hover:text-blue-400`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#050B14] border border-blue-500/30 text-white rounded-lg opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs tracking-wider uppercase font-semibold shadow-xl">
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/' })} 
          className="mt-auto p-3 text-gray-500 hover:text-red-400 transition-colors group relative"
          title="Sair do painel"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-[#050B14]/95 border-t border-white/10 z-[100] flex justify-around items-center px-4 pb-safe">
        {navItems.map((item) => (
          <Link key={item.id} href={item.id} className="p-3 text-gray-400 hover:text-blue-400 transition-colors">
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
        <button onClick={() => signOut({ callbackUrl: '/' })} className="p-3 text-gray-500 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Top Header */}
      <header className="px-6 pt-8 md:pl-36 md:pr-12 md:pt-10 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 md:gap-0 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin ? (
              <span className="text-[10px] bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Proprietário (Dono)
              </span>
            ) : (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Barbeiro Profissional · 45%
              </span>
            )}
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif text-white tracking-tight"
          >
            {greeting}, <span className="text-blue-400 italic">{(session?.user?.name || 'BARBEIRO').toUpperCase()}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-xs md:text-sm mt-1 font-light"
          >
            {isAdmin 
              ? "Painel Administrativo Mr. Bastos · Controle total da barbearia, equipe e faturamento."
              : "Seu painel individual de cortes, comissões de 45% e atendimentos do dia."}
          </motion.p>
        </div>

        {/* User Badge & Notifications */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-4 w-80 bg-[#050B14] border border-blue-500/30 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl"
                >
                  <h4 className="text-sm font-serif text-white mb-3 pb-2 border-b border-white/10">Últimos Atendimentos</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500">Sem notificações no momento.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-white font-medium">{n.user?.name || "Cliente"}</p>
                          <p className="text-gray-400 text-[10px]">{n.service?.name} · {new Date(n.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-serif text-xs font-bold">
              {(session?.user?.name || 'M')[0]}
            </div>
            <span className="text-xs font-medium text-gray-300 hidden sm:inline">{session?.user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="px-6 py-8 md:pl-36 md:pr-12 md:py-10 relative z-20 max-w-[1600px]">
        {children}
      </main>

    </div>
  );
}
