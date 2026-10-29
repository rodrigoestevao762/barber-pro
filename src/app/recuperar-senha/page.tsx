"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LogoMrBastos } from "@/components/LogoMrBastos";
import { Lock, CheckCircle2, ArrowRight, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de redefinição não encontrado. Solicite um novo link na página de login.");
      return;
    }

    if (newPassword.length < 3) {
      setError("A senha deve ter no mínimo 3 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Erro ao redefinir senha.");
      }
    } catch (err: any) {
      setError("Erro de conexão ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#050B14] border border-[#C88E70]/30 rounded-3xl p-8 z-10 shadow-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-3">
          <LogoMrBastos size={72} color="#C88E70" />
        </Link>
        <h2 className="text-2xl font-serif text-white tracking-wide">Redefinir Senha</h2>
        <p className="text-gray-400 text-xs mt-1">Crie uma nova senha segura para sua conta</p>
      </div>

      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif text-white">Senha Alterada com Sucesso!</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Sua nova senha já está ativa. Você pode fazer login agora mesmo com suas novas credenciais.
          </p>
          <Link
            href="/login"
            className="w-full py-4 bg-[#C88E70] hover:bg-white text-[#050B14] font-bold uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group mt-6"
          >
            Fazer Login Agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-[#C88E70] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-[#C88E70] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#C88E70] hover:bg-white text-[#050B14] font-bold uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-[#C88E70]/20 disabled:opacity-50 mt-6"
          >
            {loading ? "Salvando..." : "Salvar Nova Senha"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar ao Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6 text-white selection:bg-[#C88E70] selection:text-black">
      <Suspense fallback={<div className="text-[#C88E70] animate-pulse">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
