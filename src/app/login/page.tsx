"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Preencha todos os campos para continuar.");
      return;
    }
    setLoading(true);
    setError("");

    const cleanPhone = phone.replace(/\D/g, "");

    try {
      const res = await signIn("credentials", {
        phone: cleanPhone,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciais inválidas ou número não encontrado.");
        setLoading(false);
      } else if (res?.ok) {
        router.refresh();
        router.push("/dashboard");
      } else {
        setError("Falha inesperada no login.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Erro de conexão: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-[#C88E70] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold z-20">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-3xl font-serif text-white tracking-wide uppercase mb-2">Acesso ao Sistema</h1>
            <p className="text-gray-400 text-sm font-light">Insira suas credenciais para continuar.</p>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            {error && <p className="text-red-400 text-xs font-semibold text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Phone className="w-5 h-5 text-gray-600 group-focus-within:text-[#C88E70] transition-colors" />
              </div>
              <input 
                type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder-transparent peer"
                placeholder="Telefone" id="phone"
              />
              <label htmlFor="phone" className="absolute left-12 top-4 text-gray-500 text-sm transition-all duration-300 peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C88E70] peer-focus:bg-[#050B14] peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[10px] peer-valid:uppercase peer-valid:tracking-widest peer-valid:text-gray-400 peer-valid:bg-[#050B14] peer-valid:px-2 cursor-text">
                TELEFONE
              </label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-[#C88E70] transition-colors" />
              </div>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder-transparent peer"
                placeholder="Senha" id="password"
              />
              <label htmlFor="password" className="absolute left-12 top-4 text-gray-500 text-sm transition-all duration-300 peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#C88E70] peer-focus:bg-[#050B14] peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[10px] peer-valid:uppercase peer-valid:tracking-widest peer-valid:text-gray-400 peer-valid:bg-[#050B14] peer-valid:px-2 cursor-text">
                SENHA
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#C88E70] text-[#050B14] font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group mt-4 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Processando..." : "Acessar Sistema"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
      <div className="hidden lg:block w-1/2 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070')] bg-cover bg-center" />
    </div>
  );
}
