"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, ArrowRight, ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isManager, setIsManager] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Remove formatting from phone
    const cleanPhone = phone.replace(/\D/g, "");

    const res = await signIn("credentials", {
      phone: cleanPhone,
      password: isManager ? password : "",
      redirect: false,
    });

    if (res?.error) {
      setError(isManager ? "Credenciais inválidas." : "Número não encontrado. Faça um agendamento primeiro.");
      setLoading(false);
    } else {
      // Check session to route
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/cliente");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex font-sans selection:bg-[#C88E70] selection:text-black">
      
      {/* Esquerda: Imagem Interativa */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <motion.div 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B14]/80 via-[#050B14]/40 to-[#050B14]" />
        
        <div className="relative z-10 p-16 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}>
            <Scissors className="w-12 h-12 text-[#C88E70] mb-8" />
            <h2 className="text-5xl font-serif text-white leading-tight mb-6">A ARTE DO <span className="text-[#C88E70] italic">CUIDAR.</span></h2>
            <p className="text-gray-400 font-light leading-relaxed mb-12">Acesse sua conta para gerenciar seus horários, conferir os serviços mais recentes e desfrutar de uma experiência premium antes mesmo de chegar à cadeira.</p>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                  <div className="w-10 h-10 rounded-full border-2 border-[#050B14] bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100')] bg-cover" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#050B14] bg-[url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100')] bg-cover" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#050B14] bg-[#C88E70] flex items-center justify-center text-[10px] font-bold text-black">+2k</div>
               </div>
               <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Clientes Satisfeitos</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Direita: Formulário de Acesso */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C88E70]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-[#C88E70] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold z-20">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-3xl font-serif text-white tracking-wide uppercase mb-2">{isLogin ? "Acesso Exclusivo" : "Novo Cliente"}</h1>
            <p className="text-gray-400 text-sm font-light">{isLogin ? "Insira suas credenciais para continuar." : "Preencha os dados e junte-se ao clube."}</p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-5" 
                onSubmit={handleAuth}
              >
                {error && <p className="text-red-400 text-xs font-semibold text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}

                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <User className="w-5 h-5 text-gray-600 group-focus-within:text-[#C88E70] transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder-transparent peer"
                      placeholder="Nome Completo" id="name"
                    />
                    <label htmlFor="name" className="absolute left-12 top-4 text-gray-500 text-sm transition-all duration-300 peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C88E70] peer-focus:bg-[#050B14] peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[10px] peer-valid:uppercase peer-valid:tracking-widest peer-valid:text-gray-400 peer-valid:bg-[#050B14] peer-valid:px-2 cursor-text">
                      NOME COMPLETO
                    </label>
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-600 group-focus-within:text-[#C88E70] transition-colors" />
                  </div>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder-transparent peer"
                    placeholder="E-mail" id="email"
                  />
                  <label htmlFor="email" className="absolute left-12 top-4 text-gray-500 text-sm transition-all duration-300 peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C88E70] peer-focus:bg-[#050B14] peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[10px] peer-valid:uppercase peer-valid:tracking-widest peer-valid:text-gray-400 peer-valid:bg-[#050B14] peer-valid:px-2 cursor-text">
                    E-MAIL
                  </label>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-[#C88E70] transition-colors" />
                  </div>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder-transparent peer"
                    placeholder="Senha" id="password"
                  />
                  <label htmlFor="password" className="absolute left-12 top-4 text-gray-500 text-sm transition-all duration-300 peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C88E70] peer-focus:bg-[#050B14] peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[10px] peer-valid:uppercase peer-valid:tracking-widest peer-valid:text-gray-400 peer-valid:bg-[#050B14] peer-valid:px-2 cursor-text">
                    SENHA
                  </label>
                </div>

                <motion.button 
                  disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#C88E70] text-[#050B14] font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group mt-4 relative overflow-hidden disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? "Processando..." : (isLogin ? "Acessar Sistema" : "Criar Conta")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
            <p className="text-xs text-gray-500 tracking-wide">{isLogin ? "Ainda não faz parte do clube?" : "Já possui um acesso VIP?"}</p>
            <button 
              onClick={() => {setIsLogin(!isLogin); setError("");}}
              className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white border-b border-[#C88E70] pb-1 hover:text-[#C88E70] transition-colors font-semibold"
            >
              {isLogin ? "Cadastre-se Aqui" : "Fazer Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
