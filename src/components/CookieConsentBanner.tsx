"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("mrbastos_cookie_consent");
      if (!consent) {
        // Exibe após 1.5s suavemente
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (_) {
      // Ignora erro de localStorage desabilitado em modo anônimo extremo
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("mrbastos_cookie_consent", "accepted");
    } catch (_) {}
    setShow(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem("mrbastos_cookie_consent", "necessary");
    } catch (_) {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:max-w-xl z-[100] bg-[#091220]/95 border border-blue-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-white"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold tracking-wide flex items-center gap-2">
                  Privacidade & Segurança de Dados (LGPD)
                </h4>
                <button
                  onClick={handleAcceptNecessary}
                  className="text-gray-400 hover:text-white p-1 rounded-md"
                  aria-label="Dispensar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Utilizamos cookies e tecnologias essenciais para garantir o funcionamento seguro do sistema de agendamentos, login e proteção dos seus dados pessoais, em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>. Seus dados nunca são comercializados.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                >
                  Aceitar Todos
                </button>
                <button
                  type="button"
                  onClick={handleAcceptNecessary}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold py-2 px-3 rounded-xl border border-white/10 transition-colors"
                >
                  Apenas Necessários
                </button>
                <Link
                  href="/politica-de-privacidade"
                  className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 ml-auto"
                >
                  Ler Política de Privacidade
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
