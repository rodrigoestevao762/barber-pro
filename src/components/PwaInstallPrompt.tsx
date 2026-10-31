"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMrBastos } from "./LogoMrBastos";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Registra o Service Worker para PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker ativo:", reg.scope))
        .catch((err) => console.warn("Erro no SW:", err));
    }

    // 2. Verifica se já está instalado (standalone)
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(checkStandalone);

    // 3. Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Captura evento de instalação (Android/Chrome/Edge/PC)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!checkStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Detecta se foi instalado com sucesso
    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setShowBanner(false);
      setShowModal(false);
      setDeferredPrompt(null);
    });

    // Se for iOS e não for standalone e ainda não tiver dispensado, mostra banner suave após 4s
    if (isIosDevice && !checkStandalone) {
      const timer = setTimeout(() => {
        const wasDismissed = sessionStorage.getItem("pwa_dismissed");
        if (!wasDismissed) {
          setShowBanner(true);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Ouvinte para evento customizado de disparar o modal de instalação de qualquer lugar
    const handleTriggerInstall = () => {
      handleInstallClick();
    };
    window.addEventListener("trigger-pwa-install", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("trigger-pwa-install", handleTriggerInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // Abre o modal de instruções (iOS ou navegadores que não disparam prompt nativo)
      setShowModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (isStandalone) {
    return null; // Já está rodando dentro do App instalado!
  }

  return (
    <>
      {/* BANNER FLUTUANTE DISCRETO PARA INSTALAÇÃO (TODOS OS DISPOSITIVOS) */}
      <AnimatePresence>
        {showBanner && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[380px] z-[90] bg-[#0A1220]/95 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <LogoMrBastos size={28} color="#3B82F6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">App Mr. Bastos</h4>
                <p className="text-[11px] text-gray-400">Instale no seu celular para agendar com 1 toque</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-[11px] font-bold uppercase tracking-wider py-2 px-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </button>
              <button
                onClick={dismissBanner}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE INSTRUÇÕES DE INSTALAÇÃO (ESPECIAL PARA IPHONE / IPAD OU OUTROS) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[#050B14]/85 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#091220] border border-blue-500/40 rounded-3xl p-6 md:p-8 z-10 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <LogoMrBastos size={32} color="#3B82F6" />
                  <div>
                    <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                      Instalar Aplicativo
                    </h3>
                    <p className="text-[11px] text-blue-400">Mr. Bastos Barbearia Oficial</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                /* INSTRUÇÕES PARA IPHONE / IPAD (SAFARI) */
                <div className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    No seu iPhone ou iPad, você pode adicionar o app direto na sua tela de início em apenas 3 passos:
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <Share className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-white">1. Toque em Compartilhar</p>
                        <p className="text-gray-400 text-[11px]">No menu inferior do Safari (ícone do quadrado com seta).</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-white">2. Adicionar à Tela de Início</p>
                        <p className="text-gray-400 text-[11px]">Role as opções para baixo e toque nessa opção.</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-white">3. Toque em "Adicionar"</p>
                        <p className="text-gray-400 text-[11px]">No canto superior direito para confirmar o ícone.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INSTRUÇÕES PARA ANDROID / COMPUTADOR */
                <div className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Você pode instalar o Mr. Bastos como um aplicativo completo no seu dispositivo com suporte a tela cheia e agendamentos instantâneos.
                  </p>

                  <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-blue-400 shrink-0" />
                    <p className="text-xs text-gray-200">
                      Caso o botão automático não apareça, toque no menu do seu navegador (três pontinhos <strong>⋮</strong>) e escolha <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>

                  {deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Instalar Agora
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider font-semibold"
                >
                  Entendi, fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
