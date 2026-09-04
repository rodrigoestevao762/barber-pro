"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

// Fotos CINEMÁTICAS e diferentes da capa (Modelos, Cortes Premium, Fades)
const CINEMATIC_IMAGES = [
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=2000&auto=format&fit=crop", // Barbeiro cortando, luz premium
  "https://images.unsplash.com/photo-1622288432450-277d0fce5b95?q=80&w=2000&auto=format&fit=crop", // Detalhe de barba com toalha
  "https://images.unsplash.com/photo-1508898558739-c08127376c96?q=80&w=2000&auto=format&fit=crop", // Modelo masculino perfil elegante
  "https://images.unsplash.com/photo-1618086054817-27b68da4017e?q=80&w=2000&auto=format&fit=crop", // Close up de máquina no fade
  "https://images.unsplash.com/photo-1532710093739-9470acff878b?q=80&w=2000&auto=format&fit=crop", // Ação com tesoura
];

export default function ExperienciaSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efeito Ken Burns: Troca a cada 5 segundos para uma transição majestosa
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CINEMATIC_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="experiencia" className="relative min-h-[120vh] flex items-center justify-center bg-[#010204] overflow-hidden py-32 px-4 md:px-8">
      
      {/* FUNDO ANIMADO CINEMÁTICO (SLIDESHOW) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-top grayscale-[15%]"
            style={{ backgroundImage: `url(${CINEMATIC_IMAGES[currentIndex]})` }}
          />
        </AnimatePresence>
        
        {/* OVERLAY DE CINEMA - Gradiente profundo e Vignette escura nas bordas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,2,4,0.9)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#010204] via-[#050B14]/70 to-[#010204] opacity-90" />
      </div>

      {/* CAIXA DE TEXTO CINEMÁTICA (GLASSMORPHISM MONOLITH) */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl mx-auto p-8 md:p-16 lg:p-20 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/5 backdrop-blur-xl bg-[#050B14]/40"
      >
        {/* LUZES VOLUMÉTRICAS (Flares) */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C88E70]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <p className="text-[#C88E70] uppercase tracking-[0.6em] text-xs md:text-sm font-semibold flex items-center gap-4 mb-8 drop-shadow-md">
              <span className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#C88E70]"></span>
              A Experiência
              <span className="w-8 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#C88E70]"></span>
            </p>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-black leading-[1.05] tracking-tighter mb-10 text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 10%, #a0a0a0 60%, #C88E70 100%)",
              WebkitTextStroke: "1px rgba(200, 142, 112, 0.4)",
              filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.8))"
            }}
          >
            A Arte de Forjar <br className="hidden md:block" /> Grandes Homens.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#C88E70]/50 to-transparent mb-10"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="max-w-3xl text-gray-300 font-light text-lg md:text-2xl leading-relaxed mb-16 drop-shadow-lg"
          >
            Não vendemos apenas cortes de cabelo. Entregamos um ritual cinematográfico de resgate da confiança e do bem-estar, onde o respeito às raízes clássicas encontra a excelência do homem moderno.
          </motion.p>

          {/* BADGES CINEMÁTICOS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col md:flex-row gap-6 md:gap-10 w-full justify-center"
          >
            {/* Badge 1 */}
            <div className="group flex-1 bg-black/30 border border-[#C88E70]/20 p-6 rounded-2xl flex items-center gap-6 hover:bg-[#C88E70]/10 hover:border-[#C88E70]/50 transition-all duration-500 overflow-hidden relative">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
               <div className="p-4 bg-[#050B14] rounded-full border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck className="w-8 h-8 text-[#C88E70]" />
               </div>
               <div className="text-left">
                 <h4 className="text-white font-serif text-2xl mb-1">Mestria</h4>
                 <p className="text-xs text-gray-400 uppercase tracking-widest">Técnica Impecável</p>
               </div>
            </div>

            {/* Badge 2 */}
            <div className="group flex-1 bg-black/30 border border-[#C88E70]/20 p-6 rounded-2xl flex items-center gap-6 hover:bg-[#C88E70]/10 hover:border-[#C88E70]/50 transition-all duration-500 overflow-hidden relative">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
               <div className="p-4 bg-[#050B14] rounded-full border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                 <Award className="w-8 h-8 text-[#C88E70]" />
               </div>
               <div className="text-left">
                 <h4 className="text-white font-serif text-2xl mb-1">Premium</h4>
                 <p className="text-xs text-gray-400 uppercase tracking-widest">Atmosfera de Luxo</p>
               </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
