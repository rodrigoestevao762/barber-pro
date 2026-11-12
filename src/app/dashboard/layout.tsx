"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Scissors, Bell, User as UserIcon, Wallet, Archive, Shield, Home, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { getDisplayTime } from "@/lib/timezone";
import { disconnectAccount } from "@/lib/logout";
import { getBarberByEmail, getBarberById } from "@/lib/barbers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
        { id: "/dashboard", icon: LayoutDashboard, label: "Visão Geral (Casa)", shortLabel: "Início" },
        { id: "/dashboard/agenda", icon: Calendar, label: "Agenda Geral", shortLabel: "Agenda" },
        { id: "/dashboard/financeiro", icon: Wallet, label: "Financeiro Barbearia", shortLabel: "Caixa" },
        { id: "/dashboard/fechamento", icon: Archive, label: "Fechamento de Caixa", shortLabel: "Fechar" },
        { id: "/dashboard/clientes", icon: Users, label: "Clientes", shortLabel: "Clientes" },
        { id: "/dashboard/settings", icon: Settings, label: "Ajustes", shortLabel: "Ajustes" },
      ]
    : [
        { id: "/dashboard", icon: LayoutDashboard, label: "Meus Atendimentos & Comissões", shortLabel: "Início" },
        { id: "/dashboard/agenda", icon: Calendar, label: "Minha Agenda", shortLabel: "Agenda" },
        { id: "/dashboard/financeiro", icon: Wallet, label: "Meu Caixa (45%)", shortLabel: "Caixa" },
        { id: "/dashboard/clientes", icon: Users, label: "Clientes", shortLabel: "Clientes" },
        { id: "/dashboard/settings", icon: Settings, label: "Meu Perfil", shortLabel: "Perfil" },
      ];

  return (
    <div className="min-h-screen bg-[#050B14] text-white relative overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white pb-24 md:pb-0">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Sidebar (Desktop) */}
      <nav className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 h-[80vh] w-20 flex-col items-center py-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl z-50">
        
        <Link href="/" className="mb-auto group relative">
          <Scissors className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
        </Link>

        <div className="flex flex-col gap-6">
          <Link 
            href="/" 
            className="p-3 text-gray-400 hover:text-blue-400 transition-colors group relative"
            title="Voltar ao Site (sem fazer logout)"
          >
            <Home className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#050B14] border border-blue-500/30 text-white rounded-lg opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs tracking-wider uppercase font-semibold shadow-xl">
              Voltar ao Site
            </div>
          </Link>

          {navItems.map((item) => {
            const isActive = pathname === item.id;
            return (
              <Link
                key={item.id}
                href={item.id}
                className={`relative group p-3 rounded-xl transition-all ${
                  isActive ? "bg-blue-600/20 text-blue-400 border border-blue-500/40" : "text-gray-400 hover:text-blue-400"
                }`}
              >
                <item.icon className="w-5 h-5 relative z-10 transition-colors duration-200" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#050B14] border border-blue-500/30 text-white rounded-lg opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs tracking-wider uppercase font-semibold shadow-xl">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <button 
          onClick={disconnectAccount} 
          className="mt-auto p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group relative cursor-pointer"
          title="Desconectar da Conta"
        >
          <LogOut className="w-5 h-5" />
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#050B14] border border-red-500/40 text-red-300 rounded-lg opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs tracking-wider uppercase font-semibold shadow-xl">
            Desconectar Conta
          </div>
        </button>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#050B14]/95 backdrop-blur-xl border-t border-white/10 z-[100] flex justify-between items-center gap-0.5 px-1.5 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = pathname === item.id;
          return (
            <Link
              key={item.id}
              href={item.id}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-blue-400 bg-blue-600/15" : "text-gray-400 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[9px] font-bold tracking-tight truncate max-w-full">{item.shortLabel}</span>
            </Link>
          );
        })}
        <button
          onClick={disconnectAccount}
          className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 rounded-xl text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          title="Desconectar da Conta"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-bold tracking-tight truncate max-w-full">Sair</span>
        </button>
      </nav>

      {/* Top Header (z-[120] garante que notificações fiquem acima de todos os cards da página) */}
      <header className="px-4 sm:px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] md:pl-36 md:pr-12 md:pt-10 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-5 md:gap-0 relative z-[120]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin ? (
              <span className="text-[10px] bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> {session?.user?.name?.toLowerCase().includes("jully") || session?.user?.email?.toLowerCase().includes("jully") ? "Administradora (Gestão)" : "Proprietário (Dono)"}
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
        <div className="flex items-center gap-3 relative">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 text-xs font-semibold text-gray-300 transition-all shadow-sm"
            title="Sair do painel e voltar ao site sem fazer logout"
          >
            <Home className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Voltar ao Site</span>
          </Link>
          <button
            type="button"
            onClick={disconnectAccount}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 hover:text-red-200 transition-all shadow-sm cursor-pointer"
            title="Encerrar sessão e desconectar a conta"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Desconectar</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-expanded={isNotifOpen}
              aria-label="Notificações de atendimentos"
              className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <>
                  {/* Backdrop: escuro no celular para foco total; transparente no desktop */}
                  <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none z-40"
                    onClick={() => setIsNotifOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+4.5rem)] w-auto max-h-[70dvh] flex flex-col md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-80 md:max-h-none bg-[#050B14] border border-blue-500/40 rounded-2xl p-4 shadow-2xl shadow-black/95 z-50 backdrop-blur-2xl ring-1 ring-white/10"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Bell className="w-4 h-4 text-blue-400 shrink-0" />
                        <h4 className="text-sm font-serif text-white truncate">Últimos Atendimentos</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-blue-400 font-mono font-medium">Recentes</span>
                        <button
                          type="button"
                          onClick={() => setIsNotifOpen(false)}
                          aria-label="Fechar notificações"
                          className="md:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[55dvh] md:max-h-72 overflow-y-auto overscroll-contain pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">Sem notificações no momento.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="text-xs p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-white font-medium truncate">{n.user?.name || "Cliente"}</p>
                              <span className="text-[10px] text-blue-400 font-mono font-bold shrink-0">
                                {getDisplayTime(n.date)}
                              </span>
                            </div>
                            <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                              {n.service?.name} {n.service?.price ? `· R$ ${Number(n.service.price).toFixed(2)}` : ""}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            {(() => {
              const email = session?.user?.email?.toLowerCase() || "";
              const isJully = email.includes("jully");
              const matchedBarber = !isJully
                ? getBarberByEmail(email) || getBarberById((session?.user as any)?.barberId)
                : undefined;

              if (matchedBarber?.avatar) {
                return (
                  <img
                    src={matchedBarber.avatar}
                    alt={session?.user?.name || matchedBarber.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover object-top border border-blue-500/40 shrink-0"
                  />
                );
              }

              return (
                <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-serif text-xs font-bold shrink-0">
                  {(session?.user?.name || "M")[0]}
                </div>
              );
            })()}
            <span className="text-xs font-medium text-gray-300 hidden sm:inline">{session?.user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="px-6 py-8 md:pl-36 md:pr-12 md:py-10 relative z-10 max-w-[1600px]">
        {children}
      </main>

    </div>
  );
}
