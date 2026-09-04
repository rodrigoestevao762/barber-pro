"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

export default function ExperienciaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // -- FASE 1: ZOOM IN DO BACKGROUND E FADE DO TÍTULO --
  const bgScale = useTransform(scrollYProgress, [0, 0.2], [1.3, 1]);
  const bgFilter = useTransform(scrollYProgress, [0, 0.4, 0.6], ["brightness(0.3) blur(0px)", "brightness(0.7) blur(0px)", "brightness(0.2) blur(10px)"]);
  
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.5]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], ["0%", "-50%"]);

  // -- FASE 2: FOTOS LATERAIS DESLIZANDO (TRÍPTICO) --
  // A foto central diminui para virar um quadro
  const centerWidth = useTransform(scrollYProgress, [0.2, 0.4], ["100vw", "30vw"]);
  const centerHeight = useTransform(scrollYProgress, [0.2, 0.4], ["100vh", "70vh"]);
  const centerBorderRadius = useTransform(scrollYProgress, [0.2, 0.4], ["0px", "24px"]);
  
  // Fotos da esquerda e direita entram
  const leftX = useTransform(scrollYProgress, [0.2, 0.4], ["-100vw", "0vw"]);
  const leftRotate = useTransform(scrollYProgress, [0.2, 0.4], [-15, -6]);
  
  const rightX = useTransform(scrollYProgress, [0.2, 0.4], ["100vw", "0vw"]);
  const rightRotate = useTransform(scrollYProgress, [0.2, 0.4], [15, 6]);

  const sideImagesOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const allImagesOpacity = useTransform(scrollYProgress, [0.6, 0.7], [1, 0.2]); // Escurece tudo na fase 3

  // -- FASE 3: TEXTO FINAL 3D E VALORES --
  const finalTextOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const finalTextY = useTransform(scrollYProgress, [0.6, 0.8], [100, 0]);
  const finalTextScale = useTransform(scrollYProgress, [0.6, 0.8], [0.8, 1]);

  return (
    <section ref={sectionRef} id="experiencia" className="relative h-[300vh] bg-black">
      
      {/* CONTAINER STICKY QUE FICA PRESO NA TELA */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* IMAGEM CENTRAL GIGANTE QUE VIRA QUADRO */}
        <motion.div 
          style={{ 
            width: centerWidth, 
            height: centerHeight,
            borderRadius: centerBorderRadius,
            opacity: allImagesOpacity,
            zIndex: 10
          }}
          className="absolute flex items-center justify-center overflow-hidden shadow-2xl"
        >
          <motion.div 
            style={{ 
              scale: bgScale, 
              filter: bgFilter,
              backgroundImage: "url('https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2000')"
            }}
            className="absolute inset-0 bg-cover bg-center grayscale-[20%]"
          />
        </motion.div>

        {/* IMAGEM ESQUERDA (TRÍPTICO) */}
        <motion.div
          style={{
            x: leftX,
            rotate: leftRotate,
            opacity: sideImagesOpacity,
            zIndex: 5
          }}
          className="absolute left-[5%] md:left-[10%] w-[35vw] md:w-[20vw] h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="absolute inset-0 bg-cover bg-center grayscale-[40%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512496015851-a1cbfc3a3642?q=80&w=1000')" }} />
        </motion.div>

        {/* IMAGEM DIREITA (TRÍPTICO) */}
        <motion.div
          style={{
            x: rightX,
            rotate: rightRotate,
            opacity: sideImagesOpacity,
            zIndex: 5
          }}
          className="absolute right-[5%] md:right-[10%] w-[35vw] md:w-[20vw] h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="absolute inset-0 bg-cover bg-center grayscale-[40%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000')" }} />
        </motion.div>

        {/* TÍTULO INICIAL - FASE 1 */}
        <motion.div 
          style={{ opacity: titleOpacity, scale: titleScale, y: titleY, zIndex: 20 }}
          className="absolute flex flex-col items-center pointer-events-none"
        >
          <p className="text-[#C88E70] uppercase tracking-[1em] text-xs md:text-sm font-semibold mb-6 flex items-center gap-6">
            <span className="w-16 h-[1px] bg-[#C88E70]"></span>
            A Experiência
            <span className="w-16 h-[1px] bg-[#C88E70]"></span>
          </p>
          <h2 className="text-7xl md:text-[10rem] font-serif uppercase tracking-tighter text-white mix-blend-overlay opacity-90 leading-none">
            Barbearia
          </h2>
          <h2 className="text-7xl md:text-[10rem] font-serif uppercase tracking-tighter text-transparent leading-none" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)" }}>
            Clássica
          </h2>
        </motion.div>

        {/* TEXTO FINAL E CARDS - FASE 3 */}
        <motion.div 
          style={{ opacity: finalTextOpacity, y: finalTextY, scale: finalTextScale, zIndex: 30 }}
          className="absolute w-full max-w-6xl px-8 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <h3 
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black mb-8 text-transparent bg-clip-text leading-tight pointer-events-auto"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #a0a0a0 50%, #C88E70 100%)",
              filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.9))"
            }}
          >
            Um ambiente<br />Familiar e Acolhedor.
          </h3>
          
          <p className="text-gray-300 font-light text-lg md:text-2xl max-w-3xl leading-relaxed mb-16 drop-shadow-md pointer-events-auto">
            Elevamos o cuidado masculino a um patamar cinematográfico. Muito além da estética, entregamos confiança, bem-estar e o prazer do auto-cuidado em uma atmosfera forjada pela tradição.
          </p>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full justify-center pointer-events-auto">
            
            <div className="group relative bg-[#050B14]/40 backdrop-blur-xl border border-white/10 p-10 rounded-2xl flex flex-col items-center overflow-hidden hover:border-[#C88E70]/50 transition-all duration-500 w-full md:w-auto min-w-[300px]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#C88E70]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Star className="w-8 h-8 text-[#C88E70] mb-6 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-white font-serif text-3xl md:text-4xl shadow-black drop-shadow-xl mb-2 relative z-10">Excelência</span>
              <span className="text-xs text-[#C88E70] uppercase tracking-[0.3em] font-semibold relative z-10">No Atendimento</span>
            </div>

            <div className="group relative bg-[#050B14]/40 backdrop-blur-xl border border-white/10 p-10 rounded-2xl flex flex-col items-center overflow-hidden hover:border-[#C88E70]/50 transition-all duration-500 w-full md:w-auto min-w-[300px]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#C88E70]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-8 h-8 mb-6 rounded-full border-2 border-[#C88E70] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-2 h-2 bg-[#C88E70] rounded-full" />
              </div>
              <span className="text-white font-serif text-3xl md:text-4xl shadow-black drop-shadow-xl mb-2 relative z-10">Conforto</span>
              <span className="text-xs text-[#C88E70] uppercase tracking-[0.3em] font-semibold relative z-10">Para a Família</span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
