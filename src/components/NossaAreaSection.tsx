"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Clock, ChevronRight, Play, Pause, Volume2, VolumeX, Star, ExternalLink, Sparkles } from "lucide-react";
import { LogoMrBastos } from "@/components/LogoMrBastos";

const GOOGLE_REVIEW_URL = "https://g.page/r/CRXf9JwKqxNQEBM/review";

const GALLERY_PHOTOS = [
  {
    src: "/nossa-area/area-02.jpg",
    label: "O Espaço",
    desc: "Ambiente climatizado e pensado para você.",
    col: "col-span-2 row-span-1",
  },
  {
    src: "/nossa-area/area-01.jpg",
    label: "O Mestre",
    desc: "Técnica e estilo em cada detalhe.",
    col: "col-span-1 row-span-1",
  },
  {
    src: "/nossa-area/area-07.jpg",
    label: "O Resultado",
    desc: "Cliente satisfeito é nossa assinatura.",
    col: "col-span-1 row-span-1",
  },
  {
    src: "/nossa-area/area-06.jpg",
    label: "Nossa Casa",
    desc: "Cadeiras premium, iluminação cinematográfica.",
    col: "col-span-1 row-span-1",
  },
  {
    src: "/nossa-area/area-05.jpg",
    label: "Nossa Família",
    desc: "Gerações de clientes que confiam na nossa arte.",
    col: "col-span-1 row-span-1",
  },
  {
    src: "/nossa-area/area-04.jpg",
    label: "A Maestria",
    desc: "Precisão cirúrgica em cada corte.",
    col: "col-span-1 row-span-1",
  },
  {
    src: "/nossa-area/area-03.jpg",
    label: "Nossa Estrutura",
    desc: "Equipamentos de alto padrão e recepção VIP.",
    col: "col-span-2 row-span-1",
  },
];

const HORARIOS = [
  { dia: "Segunda – Sexta", hora: "09:00 – 20:00" },
  { dia: "Sábado", hora: "09:00 – 19:00" },
];

// Card do Vídeo Tour em Formato Maior e Interativo
function VideoTourCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onClick={togglePlay}
      className="relative overflow-hidden rounded-3xl cursor-pointer col-span-1 row-span-2 border-2 border-[#C88E70]/40 shadow-[0_20px_60px_rgba(200,142,112,0.18)] group bg-[#050B14]"
      style={{ minHeight: 520 }}
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        src="/video-mrbastos-tour.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradientes de contraste para controles e textos */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-[#050B14]/20 to-[#050B14]/70 pointer-events-none" />

      {/* Topo: Badge Tour VIP */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#050B14]/85 text-[#C88E70] border border-[#C88E70]/40 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Tour em Vídeo
        </span>
        <span className="text-[10px] text-gray-300 font-serif italic bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          Mr. Bastos
        </span>
      </div>

      {/* Centro: Botão Play/Pause Flutuante */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <motion.div
          animate={{ scale: isPlaying ? 0.9 : 1.1, opacity: isPlaying ? 0 : 1 }}
          className="w-16 h-16 rounded-full bg-[#C88E70] text-[#050B14] flex items-center justify-center shadow-2xl transition-opacity duration-300 group-hover:opacity-90"
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
        </motion.div>
      </div>

      {/* Base: Informações e Botão de Som */}
      <div className="absolute bottom-0 left-0 w-full p-5 md:p-6 z-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[#C88E70] text-[10px] uppercase tracking-[0.3em] font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ao Vivo
            </p>
            <h3 className="text-white font-serif text-2xl leading-tight drop-shadow-md">Nossa Barbearia</h3>
            <p className="text-gray-300 text-xs mt-1 font-light leading-snug drop-shadow-sm max-w-[220px]">
              Assista ao tour e veja cada detalhe da nossa casa.
            </p>
          </div>

          {/* Botão de Som */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
            className="p-3 rounded-full bg-[#050B14]/90 border border-[#C88E70]/50 text-[#C88E70] hover:bg-[#C88E70] hover:text-[#050B14] transition-all duration-300 shadow-xl backdrop-blur-md shrink-0 flex items-center gap-1.5 active:scale-95"
            title={isMuted ? "Clique para ativar som" : "Clique para silenciar"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {isMuted ? "Som" : "Ativo"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Card de Avaliação no Google (Google Reviews)
function GoogleReviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl col-span-1 row-span-1 border border-amber-500/30 bg-gradient-to-br from-white/[0.05] via-amber-500/[0.04] to-transparent p-6 flex flex-col justify-between shadow-2xl group hover:border-amber-400/60 transition-all duration-500"
      style={{ minHeight: 220 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            5.0 ★
          </span>
        </div>

        <h3 className="text-white font-serif text-xl leading-tight">Avaliações no Google</h3>
        <p className="text-gray-300 text-xs mt-1.5 font-light leading-relaxed">
          Mr. Bastos Barbearia · Sua opinião faz parte da nossa história e excelência.
        </p>
      </div>

      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full bg-gradient-to-r from-amber-500 to-[#C88E70] text-[#050B14] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all"
      >
        <Star className="w-3.5 h-3.5 fill-[#050B14]" />
        <span>Avaliar no Google</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}

function GalleryCard({
  item,
  index,
}: {
  item: (typeof GALLERY_PHOTOS)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${item.col}`}
      style={{
        minHeight: item.col.includes("row-span-2") ? 500 : item.col.includes("col-span-2") ? 250 : 220,
      }}
    >
      <motion.div
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.src})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-[#050B14]/20 to-transparent" />
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-gradient-to-br from-[#C88E70]/15 via-transparent to-transparent pointer-events-none"
      />
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C88E70] to-transparent origin-left"
      />
      <div className="absolute bottom-0 left-0 w-full p-5 md:p-6">
        <motion.p
          animate={{ y: hovered ? 0 : 6, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="text-[#C88E70] text-[10px] uppercase tracking-[0.3em] mb-1 font-semibold"
        >
          {item.label}
        </motion.p>
        <h3 className="text-white font-serif text-xl leading-tight">{item.label}</h3>
        <motion.p
          animate={{ y: hovered ? 0 : 10, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-gray-300 text-sm mt-1 font-light"
        >
          {item.desc}
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function NossaAreaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.35], [50, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="nossa-area"
      className="relative bg-[#02050A] py-28 md:py-40 px-5 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Luzes atmosféricas */}
      <div className="absolute -top-60 -left-40 w-[600px] h-[600px] bg-[#C88E70]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#C88E70]/7 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-5 md:left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />

      {/* ── HEADER ── */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">

          {/* Título */}
          <motion.div style={{ y: titleY, opacity: titleOpacity }} className="flex-1">
            <p className="text-[#C88E70] uppercase tracking-[0.45em] text-xs font-semibold flex items-center gap-3 mb-8">
              <span className="w-10 h-[1px] bg-[#C88E70]" />
              Nossa Área
            </p>
            <h2 className="text-5xl md:text-7xl font-serif leading-[0.95] tracking-tight">
              Um Espaço{" "}
              <span className="text-transparent [-webkit-text-stroke:1px_#C88E70] italic">
                Criado
              </span>
              <br /> Para{" "}
              <span className="text-[#C88E70]">Você.</span>
            </h2>
            <p className="text-gray-400 font-light text-base leading-relaxed mt-8 max-w-md">
              Cada detalhe do nosso espaço foi pensado para que você se sinta em
              casa — com o conforto e o requinte que você merece.
            </p>
          </motion.div>

          {/* ── CARD DE LOCALIZAÇÃO, HORÁRIO & AVALIAÇÃO GOOGLE ── */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[340px] shrink-0"
          >
            <div className="relative rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">

              {/* Fundo dourado sutil */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C88E70]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Cabeçalho do card — Logo + Nome */}
              <div className="relative flex flex-col items-center py-8 px-6 border-b border-white/[0.06]">
                <LogoMrBastos size={96} color="white" className="mb-3 opacity-90" />
                <p className="text-white font-serif text-xl tracking-wide">Mr. Bastos</p>
                <p className="text-[#C88E70] text-[10px] uppercase tracking-[0.45em] mt-1">Barbearia</p>
              </div>

              {/* Horários */}
              <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[#C88E70]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Horário de Funcionamento</span>
                </div>
                <div className="space-y-3">
                  {HORARIOS.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm font-light">{h.dia}</span>
                      <span className="text-white text-sm font-semibold font-mono tracking-wider">{h.hora}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endereço */}
              <div className="relative px-6 pt-5 pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#C88E70]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Localização</span>
                </div>
                <p className="text-gray-200 text-sm font-light leading-relaxed">
                  Av. Dantas Bião, s/n<br />
                  <span className="text-gray-400">Estacionamento do Hiper Gbarbosa</span><br />
                  <span className="text-[#C88E70] text-xs font-medium tracking-wide">Alagoinhas – BA</span>
                </p>
                <a
                  href="https://maps.google.com/?q=Hiper+Gbarbosa+Alagoinhas+BA+Av+Dantas+Bião"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[#C88E70] text-xs uppercase tracking-[0.2em] font-semibold group"
                >
                  Ver no mapa
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Bloco de Avaliações no Google */}
              <div className="relative px-6 py-5 bg-amber-500/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1">5.0</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-bold">Google</span>
                </div>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 bg-white/5 hover:bg-[#C88E70] text-gray-200 hover:text-[#050B14] border border-white/10 hover:border-[#C88E70] py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Avaliar Barbearia no Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Faixa editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-b border-white/[0.06] py-7"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-600 mb-1">Especialidade</p>
              <p className="text-white font-serif text-2xl">Corte & Barba</p>
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-600 mb-1">Atendimento</p>
              <p className="text-white font-serif text-2xl">Seg – Sáb</p>
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-600 mb-1">Experiência</p>
              <p className="text-white font-serif text-2xl">Premium</p>
            </div>
          </div>
          <div className="flex items-center gap-4 max-w-xs">
            <div className="w-10 h-[1px] bg-[#C88E70]/50 shrink-0" />
            <p className="text-gray-400 text-sm font-light italic leading-snug">
              "Não fazemos apenas cortes. Moldamos identidades."
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── GALERIA COM VÍDEO TOUR EM FORMATO MAIOR E FOTOS OFICIAIS ── */}
      <div className="max-w-7xl mx-auto">

        {/* Versão Mobile: Vídeo Tour em Destaque Vertical Maior + Fotos */}
        <div className="flex flex-col gap-5 md:hidden">
          {/* Vídeo Tour em Formato Maior no Celular */}
          <VideoTourCard />

          {/* Fotos da Galeria */}
          {GALLERY_PHOTOS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: i * 0.07 }}
              className="relative overflow-hidden rounded-2xl"
              style={{ height: 240 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.src})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 via-[#050B14]/10 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-[#C88E70] text-[10px] uppercase tracking-widest mb-1 font-semibold">{item.label}</p>
                <p className="text-gray-200 text-sm font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Card Google Reviews no Mobile */}
          <GoogleReviewCard />
        </div>

        {/* Versão Desktop: Bento Grid com Vídeo Tour em Formato Maior (2 Linhas) + 7 Fotos + Card Google Reviews */}
        <div className="hidden md:grid grid-cols-3 gap-4" style={{ gridAutoRows: "250px" }}>
          {/* 1. Vídeo Tour Maior ocupando 2 linhas inteiras (520px+ altura) */}
          <VideoTourCard />

          {/* 2. Fotos Oficiais da Barbearia */}
          {GALLERY_PHOTOS.map((item, i) => (
            <GalleryCard key={i} item={item} index={i} />
          ))}

          {/* 3. Card Google Reviews integrado ao Bento Grid */}
          <GoogleReviewCard />
        </div>
      </div>

      {/* ── RODAPÉ DA SEÇÃO ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-7xl mx-auto mt-14 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/[0.06]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-400">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#C88E70]" />
            <span className="text-sm font-light tracking-wide">
              Seg – Sex: <span className="text-white font-medium">09:00 – 20:00</span>
              <span className="mx-3 text-white/20">·</span>
              Sáb: <span className="text-white font-medium">09:00 – 19:00</span>
            </span>
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-semibold tracking-wider transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Avalie-nos no Google (5.0 ★)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <motion.a
          href="#servicos"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto text-center border border-[#C88E70]/40 text-[#C88E70] hover:bg-[#C88E70] hover:text-[#050B14] px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300"
        >
          Agendar Visita
        </motion.a>
      </motion.div>
    </section>
  );
}
