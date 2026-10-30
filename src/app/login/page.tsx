"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, ChevronLeft, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { LogoMrBastos } from "@/components/LogoMrBastos";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal de Recuperação de Senha
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role === "CLIENT") {
        router.push("/painel-cliente");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Por favor, preencha o e-mail (ou telefone) e a senha.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        phone: identifier.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("E-mail, telefone ou senha incorretos. Por favor, tente novamente.");
        setLoading(false);
      } else if (res?.ok) {
        router.refresh();
      } else {
        setError("Falha inesperada no login.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Erro de conexão: " + err.message);
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes("@")) return;

    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      if (res.ok) {
        setRecoverySuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao solicitar recuperação de senha.");
      }
    } catch (_) {
      setRecoverySuccess(true);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col lg:flex-row text-white selection:bg-[#C88E70] selection:text-black">
      {/* Coluna da Esquerda: Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 text-gray-500 hover:text-[#C88E70] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold z-20"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar ao Site
        </Link>

        <div className="w-full max-w-md relative z-10 pt-16 lg:pt-0">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
              <LogoMrBastos size={42} color="#C88E70" />
              <span className="text-xl font-serif tracking-[0.25em] uppercase text-white">Mr. Bastos</span>
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide uppercase mb-2">Acesso ao Sistema</h1>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Área exclusiva para Barbeiros, Administração e Clientes.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {error && (
              <p className="text-red-400 text-xs font-semibold text-center bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl">
                {error}
              </p>
            )}

            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-2">
                E-mail ou Telefone (com DDD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder:text-gray-600"
                  placeholder="Ex: fabiobastos20v@hotmail.com ou 7598679820" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(identifier.includes("@") ? identifier : "");
                    setRecoverySuccess(false);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[10px] text-[#C88E70] hover:underline uppercase tracking-wider font-semibold"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-[#C88E70] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none transition-all duration-300 placeholder:text-gray-600"
                  placeholder="Sua senha de acesso" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#C88E70] text-[#050B14] font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group mt-6 hover:bg-white active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#C88E70]/20"
            >
              {loading ? "Autenticando..." : "Entrar no Painel"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Garantia de Segurança e Privacidade Oficial */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Lock className="w-3.5 h-3.5 text-[#C88E70]" />
            <span>Ambiente Seguro & Criptografado · Mr. Bastos Barbearia</span>
          </div>
        </div>
      </div>

      {/* Coluna da Direita: Imagem Real de Fundo com Overlay */}
      <div 
        className="hidden lg:block w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url('/nossa-area/area-06.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-[#050B14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 z-10 max-w-lg">
          <p className="text-[#C88E70] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
            Gestão Integrada Mr. Bastos
          </p>
          <h2 className="text-3xl font-serif text-white leading-tight mb-3">
            O Padrão de Excelência em Cada Detalhe.
          </h2>
          <p className="text-gray-300 text-sm font-light leading-relaxed">
            Painéis independentes para cada profissional com controle total de agendamentos, clientes e fechamento de caixa.
          </p>
        </div>
      </div>

      {/* MODAL: RECUPERAÇÃO DE SENHA VIA E-MAIL */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-sm" onClick={() => setIsForgotModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#050B14] border border-[#C88E70]/30 rounded-3xl p-6 md:p-8 z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h3 className="text-2xl font-serif text-white">Recuperar Senha</h3>
                <button onClick={() => setIsForgotModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {recoverySuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif text-white">Link Enviado com Sucesso!</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Enviamos as instruções e o link de recuperação para <strong className="text-white">{recoveryEmail}</strong>. Verifique sua caixa de entrada e pasta de spam.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-full py-3.5 bg-[#C88E70] text-[#050B14] font-bold text-xs uppercase tracking-wider rounded-xl mt-4"
                  >
                    Voltar ao Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Informe o e-mail cadastrado na sua conta para enviarmos o link seguro de redefinição de senha:
                  </p>
                  <div>
                    <label className="block text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-2">
                      Seu E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        required
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="Ex: seuemail@gmail.com"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#C88E70] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading || !recoveryEmail}
                    className="w-full py-4 bg-[#C88E70] hover:bg-white text-[#050B14] font-bold uppercase tracking-widest text-xs rounded-xl mt-4 transition-all disabled:opacity-40 shadow-lg shadow-[#C88E70]/20"
                  >
                    {recoveryLoading ? "Enviando link..." : "Enviar Link de Recuperação"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
