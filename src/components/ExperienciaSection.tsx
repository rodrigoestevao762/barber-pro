"use client";

import { motion } from "framer-motion";
import { Award, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

// Fotos Oficiais dos Cortes Realizados na Barbearia MR. BASTOS
const EXPERIENCIA_IMAGES = [
  "/experiencia-corte-1.jpg", // Corte Fade Clássico na Mr. Bastos
  "/experiencia-corte-2.jpg", // Corte Taper / Moicano Texturizado na Mr. Bastos
];

export default function ExperienciaSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Pré-carregamento e transição cinematográfica fluida
  useEffect(() => {
    EXPERIENCIA_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % EXPERIENCIA_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      id="experiencia" 
      className="relative min-h-screen flex items-center justify-center bg-[#010204] overflow-hidden py-24 md:py-36 px-4 md:px-8"
    >
      {/* FUNDO COM SLIDESHOW DOS CORTES OFICIAIS MR. BASTOS (Zero Lag, GPU Acoplada) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {EXPERIENCIA_IMAGES.map((src, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={src}
              aria-hidden={!isActive}
              className={`absolute inset-0 bg-cover transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: "center 32%",
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
          );
        })}

        {/* OVERLAYS SUAVES - Mantém as fotos de cortes nítidas, vivas e bem visíveis */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#010204]/80 via-transparent to-[#010204]/90 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(1,2,4,0.4)_100%)] pointer-events-none z-10" />
      </div>

      {/* CAIXA DE TEXTO CINEMÁTICA (GLASSMORPHISM COM ALTA VISIBILIDADE DAS FOTOS AO FUNDO) */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-full max-w-5xl mx-auto p-7 sm:p-12 md:p-16 lg:p-20 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.7)] border border-[#C88E70]/30 bg-[#050B14]/60 md:bg-[#050B14]/75 backdrop-blur-md"
      >
        {/* Iluminação de borda dourada sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C88E70]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center text-center">
          
          {/* Subtítulo Badge */}
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-6 md:w-12 h-[1px] bg-gradient-to-r from-transparent to-[#C88E70]" />
            <p className="text-[#C88E70] uppercase tracking-[0.45em] text-xs md:text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C88E70]" />
              A Experiência
            </p>
            <span className="w-6 md:w-12 h-[1px] bg-gradient-to-l from-transparent to-[#C88E70]" />
          </div>

          {/* Título Principal de Impacto */}
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.2rem] font-serif font-black leading-[1.08] tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-[#C88E70] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            A Arte de Forjar <br className="hidden md:block" /> Grandes Homens.
          </h2>

          {/* Divisor de Luxo */}
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#C88E70]/80 to-transparent mb-8" />

          {/* Texto de Filosofia da Barbearia */}
          <p className="max-w-3xl text-gray-100 font-light text-base sm:text-lg md:text-2xl leading-relaxed mb-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Não vendemos apenas cortes de cabelo. Entregamos um ritual cinematográfico de resgate da confiança e do bem-estar, onde o respeito às raízes clássicas encontra a excelência do homem moderno.
          </p>

          {/* BADGES CINEMÁTICOS DE ALTA PERFORMANCE */}
          <div className="flex flex-col sm:flex-row gap-5 md:gap-8 w-full max-w-2xl justify-center mb-8">
            
            {/* Badge 1 - Mestria */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm border border-[#C88E70]/30 hover:border-[#C88E70] p-5 sm:p-6 rounded-2xl flex items-center gap-5 transition-all duration-300 hover:bg-[#C88E70]/10 group shadow-lg">
              <div className="p-3.5 bg-[#050B14] rounded-full border border-[#C88E70]/40 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-[#C88E70]" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-serif text-xl sm:text-2xl font-bold mb-0.5">Mestria</h4>
                <p className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">Técnica Impecável</p>
              </div>
            </div>

            {/* Badge 2 - Premium */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm border border-[#C88E70]/30 hover:border-[#C88E70] p-5 sm:p-6 rounded-2xl flex items-center gap-5 transition-all duration-300 hover:bg-[#C88E70]/10 group shadow-lg">
              <div className="p-3.5 bg-[#050B14] rounded-full border border-[#C88E70]/40 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Award className="w-7 h-7 text-[#C88E70]" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-serif text-xl sm:text-2xl font-bold mb-0.5">Premium</h4>
                <p className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">Atmosfera de Luxo</p>
              </div>
            </div>

          </div>

          {/* Indicador de Transição de Fotos */}
          <div className="flex items-center gap-2 pt-2">
            {EXPERIENCIA_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide 
                    ? "w-8 bg-[#C88E70]" 
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}
