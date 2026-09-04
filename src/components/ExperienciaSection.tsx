"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

// Fotos profissionais e luxuosas de barbearia
const PREMIUM_IMAGES = [
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2000&auto=format&fit=crop", // Corte com tesoura close
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2000&auto=format&fit=crop", // Navalha reta
  "https://images.unsplash.com/photo-1512496015851-a1cbfc3a3642?q=80&w=2000&auto=format&fit=crop", // Interior luxuoso
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2000&auto=format&fit=crop", // Acabamento de barba premium
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2000&auto=format&fit=crop", // Materiais de barbearia
];

export default function ExperienciaSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efeito tipo vídeo: as fotos trocam a cada 4 segundos com animação lenta
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PREMIUM_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="experiencia" className="relative min-h-[100vh] md:min-h-[120vh] flex items-center justify-center bg-[#010204] overflow-hidden py-32">
      
      {/* FUNDO ANIMADO (SLIDESHOW KEN BURNS) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center grayscale-[20%]"
            style={{ backgroundImage: `url(${PREMIUM_IMAGES[currentIndex]})` }}
          />
        </AnimatePresence>
        
        {/* Overlay Escuro para o texto brilhar */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010204] via-[#050B14]/80 to-[#010204] opacity-95" />
      </div>

      {/* LETRAS 3D E CONTEÚDO CENTRAL */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 flex flex-col items-center justify-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mb-8 flex flex-col items-center"
        >
          <p className="text-[#C88E70] uppercase tracking-[0.5em] text-sm md:text-base font-semibold flex items-center gap-6 mb-8">
            <span className="w-16 h-[1px] bg-[#C88E70]"></span>
            A Experiência
            <span className="w-16 h-[1px] bg-[#C88E70]"></span>
          </p>

          <h2 
            className="text-5xl md:text-8xl lg:text-[6rem] font-serif font-black leading-[1.1] tracking-tighter text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #d4d4d4 50%, #C88E70 100%)",
              WebkitTextStroke: "1.5px rgba(200, 142, 112, 0.5)",
              filter: "drop-shadow(0px 30px 40px rgba(0,0,0,0.9)) drop-shadow(0px 0px 20px rgba(200,142,112,0.2))"
            }}
          >
            Um ambiente <br /> Familiar e Acolhedor.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-3xl text-gray-300 font-light text-xl md:text-2xl leading-relaxed mb-16 drop-shadow-2xl"
        >
          <p className="mb-6">
            Acreditamos que cuidar da aparência vai muito além da estética. É sobre confiança, bem-estar e o prazer de se sentir bem consigo mesmo em um ambiente que te respeita.
          </p>
          <p>
            Construímos a SUA BARBEARIA para ser o refúgio seguro onde pais e filhos podem compartilhar momentos inesquecíveis, com atendimento de alta excelência e uma atmosfera forjada pela tradição.
          </p>
        </motion.div>

        {/* CARDS FLUTUANTES (EFEITO GLASSMORPHISM) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-6 md:gap-12 w-full justify-center"
        >
          {/* Card Excelência */}
          <div className="group relative bg-[#050B14]/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl flex flex-col items-center hover:bg-[#C88E70]/10 hover:border-[#C88E70]/50 transition-all duration-500 overflow-hidden min-w-[280px]">
             <div className="absolute inset-0 bg-gradient-to-br from-[#C88E70]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <Star className="w-10 h-10 text-[#C88E70] mb-6 drop-shadow-[0_0_15px_rgba(200,142,112,0.8)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
             <span className="text-white font-serif text-3xl md:text-4xl shadow-black drop-shadow-xl mb-3 relative z-10">Excelência</span>
             <span className="text-xs text-[#C88E70] uppercase tracking-[0.3em] font-bold relative z-10">No Atendimento</span>
          </div>

          {/* Card Conforto */}
          <div className="group relative bg-[#050B14]/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl flex flex-col items-center hover:bg-[#C88E70]/10 hover:border-[#C88E70]/50 transition-all duration-500 overflow-hidden min-w-[280px]">
             <div className="absolute inset-0 bg-gradient-to-br from-[#C88E70]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="w-10 h-10 mb-6 rounded-full border-2 border-[#C88E70] flex items-center justify-center drop-shadow-[0_0_15px_rgba(200,142,112,0.5)] group-hover:scale-110 transition-all duration-500">
               <div className="w-3 h-3 bg-[#C88E70] rounded-full" />
             </div>
             <span className="text-white font-serif text-3xl md:text-4xl shadow-black drop-shadow-xl mb-3 relative z-10">Conforto</span>
             <span className="text-xs text-[#C88E70] uppercase tracking-[0.3em] font-bold relative z-10">Para a Família</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
