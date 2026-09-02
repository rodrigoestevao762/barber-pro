"use client";

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft, Menu, Scissors, Star, MapPin, Clock } from "lucide-react";
import { useState, useEffect, useRef, ReactNode } from "react";
import BookingModal from "@/components/BookingModal";

// --- DADOS ---
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512496015851-a1cbfc779bb6?q=80&w=2000&auto=format&fit=crop"
];

const SERVICES = [
  { title: "Corte Clássico", price: "R$ 80", desc: "Corte na tesoura ou máquina com acabamento impecável e finalização.", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop" },
  { title: "Barba Terapia", price: "R$ 60", desc: "Alinhamento com navalha, toalha quente, massagem facial e óleos essenciais.", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop" },
  { title: "Combo Premium", price: "R$ 120", desc: "A experiência completa de Corte, Barba e hidratação capilar profunda.", img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop" }
];

// --- COMPONENTES ANIMADOS PREMIUM ---
const RevealText = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "100%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.33, 1, 0.68, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const MagneticButton = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Efeito Parallax suave para a imagem de fundo
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Simula um carregamento premium inicial
    setTimeout(() => setIsLoading(false), 1500);
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
  const prevSlide = () => setCurrentImage((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);

  return (
    <div className="min-h-screen bg-[#050B14] text-white font-sans selection:bg-[#C88E70] selection:text-white">
      
      {/* LOADER INICIAL */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-[#050B14] flex items-center justify-center flex-col"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Scissors className="w-12 h-12 text-[#C88E70]" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 font-serif text-[#C88E70] tracking-[0.3em] uppercase text-sm"
            >
              ARTHUR BARBER
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? -20 : 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="fixed top-0 w-full px-8 py-6 flex justify-between items-center z-50 mix-blend-difference"
      >
        <div className="flex items-center gap-3 cursor-pointer group">
           <Scissors className="w-6 h-6 text-[#C88E70] group-hover:rotate-180 transition-transform duration-700" />
           <span className="text-xl font-serif tracking-[0.3em] text-white uppercase">ARTHUR BARBER</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12 text-xs uppercase tracking-[0.2em] text-gray-300 font-semibold">
          <a href="#servicos" className="hover:text-[#C88E70] transition-colors relative group">
            Serviços
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#experiencia" className="hover:text-[#C88E70] transition-colors relative group">
            A Experiência
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <div onClick={() => setIsModalOpen(true)}>
            <MagneticButton className="bg-[#C88E70] text-[#050B14] px-8 py-4 flex items-center gap-3 hover:bg-white transition-colors duration-300">
              <Calendar className="w-4 h-4" /> AGENDAR
            </MagneticButton>
          </div>
        </div>
        <button className="md:hidden text-white"><Menu className="w-8 h-8" /></button>
      </motion.nav>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* HERO SECTION COM PARALLAX E MÁSCARAS */}
      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* Imagem de Fundo (Parallax + Slider) */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000"
              style={{ backgroundImage: `url(${HERO_IMAGES[currentImage]})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-[#050B14]/60" />
        </motion.div>

        {/* Textos Centrais com Máscara */}
        <div className="relative z-10 text-center flex flex-col items-center mt-20">
          <RevealText delay={1.2}>
            <p className="text-[#C88E70] uppercase tracking-[0.4em] text-sm font-semibold mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[#C88E70]"></span>
              Arte & Precisão
              <span className="w-12 h-[1px] bg-[#C88E70]"></span>
            </p>
          </RevealText>
          
          <h1 className="text-6xl md:text-[7rem] font-serif leading-[0.9] tracking-tight uppercase flex flex-col items-center">
            <RevealText delay={1.3}>VISUAL <span className="italic text-transparent [-webkit-text-stroke:1px_white] hover:text-white transition-colors duration-500">IMPECÁVEL,</span></RevealText>
            <RevealText delay={1.4}><span className="text-[#C88E70]">ATITUDE</span> ÚNICA.</RevealText>
          </h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }} transition={{ delay: 1.8, duration: 1 }}
            className="mt-12 flex gap-6"
          >
            <div onClick={() => setIsModalOpen(true)}>
              <MagneticButton className="border border-white/20 px-10 py-5 uppercase tracking-[0.2em] text-xs hover:bg-[#C88E70] hover:border-[#C88E70] hover:text-[#050B14] transition-all duration-500 flex items-center gap-4 group backdrop-blur-md bg-white/5">
                Agendar Experiência
                <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Controles do Slider (Absoluto na base) */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: isLoading ? 0 : 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-12 flex items-center gap-6 z-20"
        >
           <button onClick={prevSlide} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
             <ChevronLeft className="w-4 h-4" />
           </button>
           <div className="flex gap-3">
             {HERO_IMAGES.map((_, idx) => (
               <div key={idx} onClick={() => setCurrentImage(idx)} className={`h-1 cursor-pointer transition-all duration-700 ease-out ${idx === currentImage ? "w-16 bg-[#C88E70]" : "w-6 bg-white/20 hover:bg-white/50"}`} />
             ))}
           </div>
           <button onClick={nextSlide} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
             <ChevronRight className="w-4 h-4" />
           </button>
        </motion.div>
      </main>

      {/* MARQUEE GIGANTE E INVERTIDO */}
      <div className="bg-[#050B14] border-y border-white/10 py-6 overflow-hidden flex whitespace-nowrap -rotate-1 scale-105 transform-gpu relative z-20">
        <motion.div 
          animate={{ x: ["-50%", "0%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex font-serif text-5xl uppercase tracking-widest text-[#C88E70] opacity-80"
        >
           {[...Array(6)].map((_, i) => (
              <span key={i} className="mx-12 flex items-center gap-12">
                 Corte Premium <span className="text-white/20">✦</span> Barboterapia <span className="text-white/20">✦</span> Estilo <span className="text-white/20">✦</span>
              </span>
           ))}
        </motion.div>
      </div>

      {/* SESSÃO DE SERVIÇOS (SCROLL REVEAL BENTO) */}
      <section id="servicos" className="py-40 px-8 md:px-24 bg-[#050B14]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div className="max-w-2xl">
            <RevealText>
              <h2 className="text-5xl md:text-7xl font-serif mb-6">A <span className="text-[#C88E70] italic">Arte</span> do Cuidar</h2>
            </RevealText>
            <RevealText delay={0.1}>
              <p className="text-gray-400 font-light text-lg leading-relaxed">Não somos apenas uma barbearia. Somos um refúgio masculino onde técnica clássica encontra luxo contemporâneo.</p>
            </RevealText>
          </div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:block">
             <div onClick={() => setIsModalOpen(true)}>
               <MagneticButton className="text-[#C88E70] uppercase tracking-[0.2em] text-sm border-b border-[#C88E70] pb-1 hover:text-white transition-colors">
                 Ver todos os serviços
               </MagneticButton>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={idx}
              onClick={() => setIsModalOpen(true)}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.2, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className={`group relative overflow-hidden bg-gray-900 cursor-pointer ${idx === 1 ? "md:-translate-y-12" : ""}`}
              style={{ height: idx === 1 ? '550px' : '450px' }}
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-50 grayscale group-hover:grayscale-0" style={{ backgroundImage: `url(${service.img})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 w-full p-10 translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-serif text-white">{service.title}</h3>
                </div>
                <p className="text-gray-400 text-sm font-light mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 max-w-[80%]">
                  {service.desc}
                </p>
                <div className="flex justify-between items-center border-t border-white/10 pt-6">
                  <span className="text-[#C88E70] font-sans tracking-widest text-lg">{service.price}</span>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#C88E70] group-hover:border-[#C88E70] group-hover:text-black transition-all duration-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SESSÃO: A EXPERIÊNCIA (REFINADA) */}
      <section id="experiencia" className="py-40 px-8 md:px-24 bg-[#050B14] relative">
        {/* Linha arquitetônica de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-[#C88E70]/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
          
          {/* Coluna da Imagem com Parallax Suave */}
          <div className="w-full md:w-1/2 relative">
             <motion.div 
               initial={{ opacity: 0, y: 100 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative h-[70vh] md:h-[80vh] w-full rounded-2xl overflow-hidden"
             >
                {/* Máscara escura nas bordas para mesclar com o fundo */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(5,11,20,1)] z-10 pointer-events-none" />
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-cover bg-center grayscale-[50%] hover:grayscale-0 transition-all duration-1000"
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=1000&auto=format&fit=crop)` }}
                />
             </motion.div>
             
             {/* Bloco de Valores flutuante */}
             <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
               className="absolute -bottom-8 -right-8 md:-right-16 bg-[#C88E70] text-[#050B14] p-8 rounded-xl shadow-2xl backdrop-blur-md max-w-[280px] z-20"
             >
                <Star className="w-8 h-8 mb-4" />
                <p className="font-serif text-xl leading-tight mb-2">Tradição & Respeito</p>
                <p className="text-xs font-sans font-medium opacity-80 uppercase tracking-widest leading-relaxed">
                  O cuidado que passa de geração em geração, moldando o homem moderno com raízes clássicas.
                </p>
             </motion.div>
          </div>

          {/* Coluna de Texto */}
          <div className="w-full md:w-1/2 space-y-12 relative z-20">
            <RevealText>
               <p className="text-[#C88E70] uppercase tracking-[0.4em] text-sm font-semibold flex items-center gap-4">
                 <span className="w-12 h-[1px] bg-[#C88E70]"></span>
                 O Seu Espaço
               </p>
            </RevealText>
            
            <RevealText delay={0.2}>
               <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">
                 Um ambiente <br /><span className="text-transparent [-webkit-text-stroke:1px_#C88E70] hover:text-[#C88E70] transition-colors duration-500">Familiar</span> <br/>e Acolhedor.
               </h2>
            </RevealText>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
              className="space-y-6 text-gray-400 font-light text-lg leading-relaxed"
            >
              <p>
                Acreditamos que cuidar da aparência vai muito além da estética. É sobre confiança, bem-estar e o prazer de se sentir bem consigo mesmo em um ambiente que te respeita.
              </p>
              <p>
                Construímos a Arthur Barber para ser o refúgio seguro onde pais e filhos podem compartilhar momentos. Oferecemos um atendimento atencioso, serviço de excelência e uma atmosfera de respeito onde todos são bem-vindos para relaxar e renovar suas energias.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 1 }}
              className="pt-8 flex flex-wrap gap-8"
            >
              <div className="flex flex-col gap-2">
                 <div className="w-12 h-[2px] bg-white/20" />
                 <span className="text-white font-serif text-2xl">Excelência</span>
                 <span className="text-xs text-gray-500 uppercase tracking-widest">No Atendimento</span>
              </div>
              <div className="flex flex-col gap-2">
                 <div className="w-12 h-[2px] bg-white/20" />
                 <span className="text-white font-serif text-2xl">Conforto</span>
                 <span className="text-xs text-gray-500 uppercase tracking-widest">Para Você e sua Família</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION (ULTRA PREMIUM) */}
      <section className="py-32 px-8 bg-[#C88E70] text-[#050B14] relative overflow-hidden flex justify-center">
         {/* Partículas flutuantes para dar vida ao fundo dourado */}
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[50%] -left-[20%] w-[150%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"
         />
         
         <motion.div
           initial={{ scale: 0.8, opacity: 0, y: 50 }}
           whileInView={{ scale: 1, opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center"
         >
           <Scissors className="w-12 h-12 mb-8 opacity-80" />
           <RevealText>
              <h2 className="text-5xl md:text-[5rem] font-serif mb-6 leading-[0.9] tracking-tight">
                Pronto para se <br /><span className="text-white italic">Reinventar?</span>
              </h2>
           </RevealText>
           
           <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.5, duration: 1 }}
             className="font-medium text-xl md:text-2xl mb-12 opacity-80 max-w-2xl"
           >
             Sua melhor versão aguarda. Reserve seu momento e deixe nossa equipe cuidar dos detalhes.
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.8, duration: 0.8 }}
             onClick={() => setIsModalOpen(true)} 
           >
             <MagneticButton className="group relative bg-[#050B14] text-white px-12 py-6 uppercase tracking-[0.3em] text-sm font-bold overflow-hidden">
               <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
               <span className="relative z-10 group-hover:text-[#050B14] transition-colors duration-500">Agendar Seu Horário</span>
             </MagneticButton>
           </motion.div>
         </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#02050A] border-t border-white/5 py-12 px-8 text-center">
         <p className="text-gray-500 text-xs tracking-widest uppercase">
           © {new Date().getFullYear()} ARTHUR BARBER. TODOS OS DIREITOS RESERVADOS.
         </p>
      </footer>

    </div>
  );
}
