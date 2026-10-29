"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { LogoMrBastos } from "@/components/LogoMrBastos";

const GALLERY = [
  {
    src: "/nossa-area/area-01.jpg",
    label: "O Mestre",
    desc: "Técnica e estilo em cada detalhe.",
    col: "col-span-1 row-span-2",
  },
  {
    src: "/nossa-area/area-02.jpg",
    label: "O Espaço",
    desc: "Ambiente pensado para você.",
    col: "col-span-2 row-span-1",
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
    desc: "Equipamentos de alto padrão.",
    col: "col-span-2 row-span-1",
  },
];

const HORARIOS = [
  { dia: "Segunda – Sexta", hora: "09:00 – 20:00" },
  { dia: "Sábado", hora: "09:00 – 19:00" },
];

function GalleryCard({
  item,
  index,
}: {
  item: (typeof GALLERY)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${item.col}`}
      style={{
        minHeight: item.col.includes("row-span-2") ? 500 : item.col.includes("col-span-2") ? 260 : 220,
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

          {/* ── CARD DE LOCALIZAÇÃO & HORÁRIO ── */}
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
              <div className="relative px-6 pt-5 pb-6">
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
                  className="mt-4 inline-flex items-center gap-2 text-[#C88E70] text-xs uppercase tracking-[0.2em] font-semibold group"
                >
                  Ver no mapa
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

      {/* ── GALERIA ── */}
      <div className="max-w-7xl mx-auto">

        {/* Mobile */}
        <div className="flex flex-col gap-4 md:hidden">
          {GALLERY.map((item, i) => (
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
        </div>

        {/* Desktop Bento */}
        <div className="hidden md:grid grid-cols-3 gap-4" style={{ gridAutoRows: "220px" }}>
          {GALLERY.map((item, i) => (
            <GalleryCard key={i} item={item} index={i} />
          ))}
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
        <div className="flex items-center gap-3 text-gray-400">
          <Clock className="w-4 h-4 text-[#C88E70]" />
          <span className="text-sm font-light tracking-wide">
            Seg – Sex: <span className="text-white font-medium">09:00 – 20:00</span>
            <span className="mx-3 text-white/20">·</span>
            Sáb: <span className="text-white font-medium">09:00 – 19:00</span>
          </span>
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
