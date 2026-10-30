"use client";

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft, Menu, X, Scissors, Star, MapPin, Clock } from "lucide-react";
import { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import { useSession } from "next-auth/react";
import ExperienciaSection from "@/components/ExperienciaSection";
import NossaAreaSection from "@/components/NossaAreaSection";
import { LogoMrBastos } from "@/components/LogoMrBastos";

// --- DADOS ---
const HERO_IMAGES = [
  "/hero-mrbastos-salon.jpg",
  "/hero-mrbastos-interior.jpg",
  "/hero-mrbastos-corte.jpg",
];

const SERVICES_HIGHLIGHT = [
  { 
    id: "corte",
    title: "Corte", 
    price: "R$ 35", 
    desc: "Corte na tesoura ou máquina com acabamento impecável, alinhamento milimétrico e estilo autêntico.", 
    badge: "O Clássico",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: "combo-corte-barba",
    title: "Corte + Barba", 
    price: "R$ 55", 
    desc: "A combinação de mestre: corte completo e barba esculpida na navalha com toalha e alinhamento.", 
    badge: "Mais Pedido",
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: "barba",
    title: "Barba", 
    price: "R$ 25", 
    desc: "Desenho e alinhamento com lâmina precisa, hidratação e produtos de alto padrão.", 
    badge: "Tradição",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop" 
  }
];

const INDIVIDUAL_SERVICES = [
  { id: "corte", name: "Corte", price: "R$ 35", desc: "Tesoura ou máquina com acabamento impecável" },
  { id: "barba", name: "Barba", price: "R$ 25", desc: "Alinhamento com navalha, toalha e contorno" },
  { id: "cabeca-navalha", name: "Cabeça raspada navalha", price: "R$ 25", desc: "Raspagem completa na navalha com acabamento suave" },
  { id: "pezinho", name: "Pezinho", price: "R$ 20", desc: "Alinhamento milimétrico e acabamento de contorno" },
  { id: "barba-maquina", name: "Barba raspada na máquina", price: "R$ 20", desc: "Aparação rápida e uniforme na máquina" },
  { id: "sobrancelha", name: "Sobrancelha", price: "R$ 15", desc: "Design masculino e limpeza precisa" },
];

const COMBOS = [
  { 
    id: "combo-corte-barba", 
    name: "Corte + Barba", 
    price: "R$ 55", 
    desc: "Corte completo e barba com navalha e toalha", 
    badge: "Mais Escolhido" 
  },
  { 
    id: "combo-corte-sobrancelha", 
    name: "Corte + Sobrancelha", 
    price: "R$ 45", 
    desc: "Corte no estilo + design de sobrancelha alinhado", 
    badge: "Visual Completo" 
  },
  { 
    id: "combo-pezinho-barba", 
    name: "Pezinho + Barba", 
    price: "R$ 40", 
    desc: "Contorno do pezinho e barba esculpida na navalha", 
    badge: "Praticidade" 
  },
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
  const { data: session } = useSession();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Trava a rolagem de fundo quando o menu mobile estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);
  const { scrollYProgress } = useScroll();
  
  // Efeito Parallax suave para a imagem de fundo
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const footerY = useTransform(scrollYProgress, [0.8, 1], [0, 150]);
  const footerOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 0.4]);

  useEffect(() => {
    // Pré-carrega todas as fotos na GPU para transição perfeitamente fluida
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
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
              <LogoMrBastos size={80} color="#C88E70" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 font-serif text-[#C88E70] tracking-[0.3em] uppercase text-sm"
            >
              MR. BASTOS
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR (TRANSPARENTE E TOTALMENTE INTEGRADA À FOTO, SEM BARRA FIXA ESCURA BLOQUEANDO A IMAGEM) */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? -20 : 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="fixed top-0 left-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50 bg-transparent pointer-events-auto"
      >
        <Link href="/" className="flex items-center gap-3 cursor-pointer group drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
           <LogoMrBastos size={36} color="#C88E70" className="group-hover:scale-110 transition-transform duration-500" />
           <span className="text-xl font-serif tracking-[0.25em] text-white uppercase">MR. BASTOS</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12 text-xs uppercase tracking-[0.2em] text-gray-200 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <a href="#servicos" className="hover:text-[#C88E70] transition-colors relative group">
            Serviços
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#experiencia" className="hover:text-[#C88E70] transition-colors relative group">
            A Experiência
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#nossa-area" className="hover:text-[#C88E70] transition-colors relative group">
            Nossa Área
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <Link href={session ? ((session?.user as any)?.role === "CLIENT" ? "/painel-cliente" : "/dashboard") : "/login"} className="hover:text-[#C88E70] transition-colors relative group">
            {session ? "Painel" : "Login"}
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C88E70] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <div onClick={() => setIsModalOpen(true)}>
            <MagneticButton className="bg-[#C88E70] text-[#050B14] px-8 py-4 flex items-center gap-3 hover:bg-white transition-colors duration-300 shadow-xl shadow-black/40 font-bold">
              <Calendar className="w-4 h-4" /> AGENDAR
            </MagneticButton>
          </div>
        </div>

        {/* Três Traços do Menu Mobile (Direto sobre a foto, sem card ou caixa cinza atrapalhando) */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          aria-label="Abrir Menu de Navegação"
          className="md:hidden text-white hover:text-[#C88E70] transition-colors p-2 -mr-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
        >
          <Menu className="w-8 h-8" />
        </button>
      </motion.nav>

      {/* MENU MOBILE CINEMATOGRÁFICO DE LUXO (100% ISOLADO DOS COMPONENTES DO SITE) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-[#03070E] flex flex-col justify-between p-6 overflow-y-auto md:hidden"
          >
            {/* Topo do Menu Mobile */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <LogoMrBastos size={32} color="#C88E70" />
                <span className="text-lg font-serif tracking-[0.25em] text-white uppercase">MR. BASTOS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links Estilo Cards VIP */}
            <div className="flex-1 py-6 flex flex-col justify-center gap-3.5">
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#C88E70] mb-0.5">Navegação Exclusiva</p>
              
              <a
                href="#servicos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#C88E70]/40 active:bg-[#C88E70]/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-mono font-bold text-[#C88E70]">01</span>
                  <div>
                    <span className="text-base font-serif text-white block">Serviços Oficiais</span>
                    <span className="text-[11px] text-gray-400 font-light">Cortes, barboterapia e combos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </a>

              <a
                href="#experiencia"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#C88E70]/40 active:bg-[#C88E70]/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-mono font-bold text-[#C88E70]">02</span>
                  <div>
                    <span className="text-base font-serif text-white block">A Experiência</span>
                    <span className="text-[11px] text-gray-400 font-light">Ritual de forjar grandes homens</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </a>

              <a
                href="#nossa-area"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#C88E70]/40 active:bg-[#C88E70]/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-mono font-bold text-[#C88E70]">03</span>
                  <div>
                    <span className="text-base font-serif text-white block">Nossa Barbearia</span>
                    <span className="text-[11px] text-gray-400 font-light">Ambiente premium e estrutura</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </a>

              <Link
                href={session ? ((session?.user as any)?.role === "CLIENT" ? "/painel-cliente" : "/dashboard") : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#C88E70]/40 active:bg-[#C88E70]/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-mono font-bold text-[#C88E70]">04</span>
                  <div>
                    <span className="text-base font-serif text-white block">
                      {session ? "Meu Painel VIP" : "Área do Cliente / Barbeiro"}
                    </span>
                    <span className="text-[11px] text-gray-400 font-light">
                      {session ? "Consulte seus cortes e fidelidade" : "Acesse com seu login e senha"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>

              {/* Avaliação no Google no Menu Mobile */}
              <a
                href="https://g.page/r/CRXf9JwKqxNQEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 active:bg-amber-500/20 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-base font-serif text-white block">Avalie no Google (5.0 ★)</span>
                    <span className="text-[11px] text-amber-300/80 font-light">Mr. Bastos Barbearia no Google</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </a>
            </div>

            {/* Ações Inferiores do Menu */}
            <div className="space-y-3.5 pt-4 border-t border-white/10 shrink-0">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true); }}
                className="w-full bg-[#C88E70] text-[#050B14] py-3.5 px-4 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C88E70]/20 hover:bg-white active:scale-[0.99] transition-all"
              >
                <Calendar className="w-4 h-4" /> AGENDAR EXPERIÊNCIA
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-1">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#C88E70]" /> Ter a Sáb · 09h às 19h</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#C88E70]" /> Mr. Bastos Barbearia</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedServiceId(undefined); }} 
        initialServiceId={selectedServiceId} 
        initialUserData={session?.user ? {
          name: session.user.name || undefined,
          email: session.user.email || undefined,
          phone: (session.user as any)?.phone || undefined,
        } : undefined}
      />

      {/* HERO SECTION COM PARALLAX E MÁSCARAS */}
      <main className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        
        {/* Imagem de Fundo (Parallax + Slider Ultra Suave Sem Tremor) */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none">
          {HERO_IMAGES.map((img, idx) => {
            const isActive = idx === currentImage;

            return (
              <div
                key={img}
                aria-hidden={!isActive}
                className={`absolute inset-0 bg-cover ${idx === 2 ? "bg-[center_35%]" : "bg-center"} transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{
                  backgroundImage: `url(${img})`,
                  transform: "translate3d(0, 0, 0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
            );
          })}
          {/* Vinheta Cinematográfica de Luxo Mr. Bastos - Iluminação Equilibrada (Fotos com Cores Vivas e Brilho Natural) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/40 via-transparent to-[#050B14]/85 pointer-events-none z-10" />
        </motion.div>

        {/* Textos Centrais com Máscara e Brilho Impecável */}
        <div className="relative z-20 text-center flex flex-col items-center mt-16 md:mt-20 px-4">
          <RevealText delay={1.2}>
            <p className="text-[#C88E70] uppercase tracking-[0.4em] text-xs md:text-sm font-semibold mb-4 md:mb-6 flex items-center gap-3 md:gap-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="w-8 md:w-12 h-[1px] bg-[#C88E70]"></span>
              Arte & Precisão
              <span className="w-8 md:w-12 h-[1px] bg-[#C88E70]"></span>
            </p>
          </RevealText>
          
          <h1 className="text-5xl sm:text-6xl md:text-[7rem] font-serif leading-[0.92] tracking-tight uppercase flex flex-col items-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <RevealText delay={1.3}>
              VISUAL{" "}
              <span className="italic text-transparent [-webkit-text-stroke:1px_white] hover:text-white transition-colors duration-500 cursor-pointer">
                IMPECÁVEL,
              </span>
            </RevealText>
            <RevealText delay={1.4}>
              <span className="text-[#C88E70]">ATITUDE</span> ÚNICA.
            </RevealText>
          </h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }} transition={{ delay: 1.8, duration: 1 }}
            className="mt-8 md:mt-12 flex gap-6"
          >
            <div onClick={() => setIsModalOpen(true)}>
              <MagneticButton className="border border-white/20 px-8 md:px-10 py-4 md:py-5 uppercase tracking-[0.2em] text-xs hover:bg-[#C88E70] hover:border-[#C88E70] hover:text-[#050B14] transition-all duration-500 flex items-center gap-4 group backdrop-blur-md bg-white/5 shadow-xl shadow-black/40">
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

      {/* SESSÃO DE SERVIÇOS E PREÇOS OFICIAIS */}
      <section id="servicos" className="py-32 md:py-40 px-6 md:px-16 lg:px-24 bg-[#050B14] relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div className="max-w-2xl">
              <RevealText>
                <p className="text-[#C88E70] uppercase tracking-[0.45em] text-xs font-semibold flex items-center gap-3 mb-4">
                  <span className="w-10 h-[1px] bg-[#C88E70]"></span>
                  Tabela Oficial
                </p>
              </RevealText>
              <RevealText delay={0.1}>
                <h2 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
                  Nossos <span className="text-[#C88E70] italic">Serviços</span> & Valores
                </h2>
              </RevealText>
              <RevealText delay={0.2}>
                <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed">
                  Excelência clássica, navalha afiada e respeito ao seu tempo. Escolha seu serviço ou combo preferido e garanta seu horário.
                </p>
              </RevealText>
            </div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:block mt-8 md:mt-0">
               <button onClick={() => openBooking()} className="text-[#C88E70] uppercase tracking-[0.2em] text-xs font-semibold border border-[#C88E70]/40 px-8 py-4 hover:bg-[#C88E70] hover:text-[#050B14] transition-all duration-300">
                 Agendar Qualquer Horário
               </button>
            </motion.div>
          </div>

          {/* CARDS DE DESTAQUE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {SERVICES_HIGHLIGHT.map((service, idx) => (
              <motion.div
                key={service.id}
                onClick={() => openBooking(service.id)}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                className={`group relative overflow-hidden bg-gray-900 cursor-pointer rounded-2xl border border-white/5 ${idx === 1 ? "md:-translate-y-6 md:border-[#C88E70]/30 shadow-[0_20px_50px_rgba(200,142,112,0.15)]" : ""}`}
                style={{ height: idx === 1 ? '520px' : '460px' }}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out md:group-hover:scale-110 opacity-90 md:opacity-50 md:group-hover:opacity-100 grayscale-0 md:grayscale md:group-hover:grayscale-0" style={{ backgroundImage: `url(${service.img})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/40 md:via-[#050B14]/60 to-transparent opacity-90 md:group-hover:opacity-100 transition-opacity" />
                
                {/* Badge Superior */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#C88E70] text-[#050B14]">
                    {service.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 translate-y-0 md:translate-y-8 md:group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-3xl font-serif text-white">{service.title}</h3>
                  </div>
                  <p className="text-gray-300 md:text-gray-400 text-sm font-light mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 delay-100 max-w-[90%] md:max-w-[85%] leading-relaxed">
                    {service.desc}
                  </p>
                  <div className="flex justify-between items-center border-t border-white/10 pt-5">
                    <span className="text-[#C88E70] font-sans tracking-widest text-2xl font-bold">{service.price}</span>
                    <div className="px-4 py-2 rounded-full border border-[#C88E70] md:border-white/20 bg-[#C88E70] md:bg-transparent text-black md:text-white flex items-center gap-2 text-xs uppercase tracking-wider font-semibold md:group-hover:bg-[#C88E70] md:group-hover:border-[#C88E70] md:group-hover:text-black transition-all duration-300">
                      <span>Agendar</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* TABELA COMPLETA DE SERVIÇOS E COMBOS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* SERVIÇOS INDIVIDUAIS */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 bg-[#02050A]/70 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-8 pb-5 border-b border-white/5">
                <Scissors className="w-5 h-5 text-[#C88E70]" />
                <h3 className="font-serif text-2xl text-white tracking-wide">Serviços Individuais</h3>
              </div>

              <div className="space-y-6">
                {INDIVIDUAL_SERVICES.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => openBooking(item.id)}
                    className="group flex items-baseline justify-between py-3 border-b border-white/[0.04] hover:border-[#C88E70]/30 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-white text-lg font-serif group-hover:text-[#C88E70] transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs font-light mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-white font-mono text-lg font-semibold tracking-wider group-hover:text-[#C88E70] transition-colors">
                        {item.price}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:border-[#C88E70] group-hover:bg-[#C88E70] group-hover:text-[#050B14] transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* COMBOS ESPECIAIS */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col justify-between gap-6"
            >
              <div className="bg-gradient-to-b from-[#C88E70]/10 via-[#02050A]/80 to-[#02050A] border border-[#C88E70]/25 rounded-3xl p-6 md:p-10 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C88E70]/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[#C88E70]" />
                      <h3 className="font-serif text-2xl text-white tracking-wide">Combos</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#C88E70] font-semibold">
                      Mais Vantagem
                    </span>
                  </div>

                  <div className="space-y-5">
                    {COMBOS.map((combo) => (
                      <div
                        key={combo.id}
                        onClick={() => openBooking(combo.id)}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C88E70]/50 hover:bg-[#C88E70]/5 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-white font-serif text-xl group-hover:text-[#C88E70] transition-colors">
                            {combo.name}
                          </span>
                          <span className="text-[#C88E70] font-mono text-xl font-bold">
                            {combo.price}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs font-light mb-3">
                          {combo.desc}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                            {combo.badge}
                          </span>
                          <span className="text-xs uppercase tracking-widest text-[#C88E70] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Agendar Combo <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-400 font-light">
                    Atendimento com hora marcada ou ordem de chegada.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SESSÃO: A EXPERIÊNCIA (REFINADA) */}
      <ExperienciaSection />

      {/* NOSSA AREA */}
      <NossaAreaSection />

      {/* MEGA BRAIN FINAL CTA & FOOTER */}
      <section className="relative bg-[#02050A] text-[#C88E70] min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Fundo Parallax Sombrio */}
        <motion.div 
          style={{ y: footerY, opacity: footerOpacity }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520338661084-3522f7c00683?q=80&w=2070')] bg-cover bg-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-[#02050A]/90 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-center flex-1 py-32">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-24 h-24 rounded-full border border-[#C88E70]/30 flex items-center justify-center mb-12 backdrop-blur-sm"
          >
            <Scissors className="w-10 h-10 text-[#C88E70]" />
          </motion.div>

          <div className="text-center space-y-4 mb-16 relative">
             <motion.h2 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
               className="text-[3.5rem] sm:text-[4.5rem] md:text-[8rem] font-serif leading-[0.88] tracking-tighter uppercase"
             >
               A Sua Nova <br /> 
               <span className="text-transparent [-webkit-text-stroke:2px_#C88E70] hover:text-[#C88E70] transition-colors duration-1000">
                 Assinatura
               </span>
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2, duration: 0.8 }}
               className="text-lg md:text-2xl text-gray-400 font-light max-w-2xl mx-auto italic"
             >
               Onde tradição e sofisticação se encontram para redefinir o seu estilo.
             </motion.p>
          </div>

          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.8, duration: 1, type: "spring" }}
             onClick={() => setIsModalOpen(true)} 
             className="relative group cursor-pointer"
           >
             <div className="absolute -inset-4 rounded-full bg-[#C88E70]/20 blur-2xl group-hover:bg-[#C88E70]/40 transition-all duration-700" />
             <MagneticButton className="relative bg-[#C88E70] text-[#050B14] px-16 py-8 rounded-full uppercase tracking-[0.4em] text-sm font-black overflow-hidden transform hover:scale-110 transition-transform duration-500">
               <motion.div 
                 animate={{ y: ["0%", "-100%", "0%"] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[45deg]"
               />
               <span className="relative z-10 flex items-center gap-4">
                 <Calendar className="w-5 h-5" /> Reservar Horário
               </span>
             </MagneticButton>
           </motion.div>
        </div>

        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5, duration: 2 }}
          className="w-full border-t border-white/5 py-8 flex flex-col md:flex-row items-center justify-between px-12 z-20 bg-[#02050A]/80 backdrop-blur-xl"
        >
           <div className="flex items-center gap-2 mb-4 md:mb-0">
              <LogoMrBastos size={32} color="#C88E70" />
              <span className="text-white font-serif text-lg tracking-widest uppercase">MR. BASTOS</span>
           </div>
           <p className="text-gray-600 text-[10px] tracking-[0.3em] uppercase">
             © {new Date().getFullYear()} O PADRÃO DE EXCELÊNCIA.
           </p>
           <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
              <a 
                href="https://g.page/r/CRXf9JwKqxNQEBM/review" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Avalie no Google (5.0 ★)
              </a>
              <a href="#" className="text-gray-500 hover:text-[#C88E70] transition-colors text-xs">Instagram</a>
              <a href="https://maps.google.com/?q=Hiper+Gbarbosa+Alagoinhas+BA+Av+Dantas+Bião" target="_blank" rel="noopener noreferrer" title="Alagoinhas - BA" className="text-gray-500 hover:text-[#C88E70] transition-colors"><MapPin className="w-4 h-4" /></a>
           </div>
        </motion.footer>
      </section>

    </div>
  );
}
