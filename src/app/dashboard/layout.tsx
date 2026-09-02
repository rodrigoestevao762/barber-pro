"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Scissors, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("overview");

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
          {[ 
            { id: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
            { id: "/dashboard/agenda", icon: Calendar, label: "Agenda" },
            { id: "/dashboard/clientes", icon: Users, label: "Clientes" },
            { id: "/dashboard/settings", icon: Settings, label: "Ajustes" },
          ].map((item) => (
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
      <header className="pl-40 pr-12 pt-12 flex justify-between items-end relative z-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif text-white tracking-tight"
          >
            BOM DIA, <span className="text-[#C88E70] italic">ARTHUR</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm mt-2 font-light tracking-wide"
          >
            O seu império aguarda. Aqui está o resumo de hoje.
          </motion.p>
        </div>

        <div className="flex items-center gap-6">
          <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-[#C88E70] rounded-full shadow-[0_0_10px_#C88E70]"></span>
          </button>
          <div className="w-12 h-12 rounded-full bg-[url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=150')] bg-cover bg-center border border-[#C88E70]" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pl-40 pr-12 pt-12 pb-24 h-screen overflow-y-auto relative z-10 scrollbar-hide">
        {children}
      </main>
      
    </div>
  );
}
