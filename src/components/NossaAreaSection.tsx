"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Clock, ChevronRight } from "lucide-react";

const GALLERY = [
  {
    src: "/nossa-area/area-01.jpg",
    label: "O Mestre",
    desc: "Técnica e estilo reunidos em cada corte.",
    col: "col-span-1 row-span-2",
    aspect: "tall",
  },
  {
    src: "/nossa-area/area-02.jpg",
    label: "O Espaço",
    desc: "Ambiente projetado para a sua melhor experiência.",
    col: "col-span-2 row-span-1",
    aspect: "wide",
  },
  {
    src: "/nossa-area/area-05.jpg",
    label: "Nossa Família",
    desc: "Gerações de clientes que confiam na nossa arte.",
    col: "col-span-1 row-span-1",
    aspect: "square",
  },
  {
    src: "/nossa-area/area-03.jpg",
    label: "Nossa Estrutura",
    desc: "Equipamentos premium para um resultado impecável.",
    col: "col-span-1 row-span-1",
    aspect: "square",
  },
  {
    src: "/nossa-area/area-04.jpg",
    label: "A Maestria",
    desc: "Cada detalhe executado com precisão cirúrgica.",
    col: "col-span-1 row-span-1",
    aspect: "square",
  },
];

const STATS = [
  { value: "8+", label: "Anos de Experiência" },
  { value: "2K+", label: "Clientes Satisfeitos" },
  { value: "100%", label: "Dedicação Total" },
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
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${item.col}`}
      style={{
        minHeight: item.aspect === "tall" ? 480 : item.aspect === "wide" ? 260 : 220,
      }}
    >
      {/* Imagem */}
      <motion.div
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.src})` }}
      />

      {/* Overlay escuro gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/30 to-transparent" />

      {/* Brilho dourado no hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-br from-[#C88E70]/20 via-transparent to-transparent pointer-events-none"
      />

      {/* Linha dourada inferior animada */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C88E70] to-transparent origin-left"
      />

      {/* Número do índice */}
      <motion.span
        animate={{ opacity: hovered ? 0 : 0.15, y: hovered ? -10 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-5 right-6 font-serif text-7xl text-white leading-none select-none"
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 w-full p-5 md:p-7">
        <motion.div
          animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-[#C88E70] text-xs uppercase tracking-[0.25em] mb-1 font-semibold"
        >
          {item.label}
        </motion.div>
        <h3 className="text-white font-serif text-xl md:text-2xl leading-tight">
          {item.label}
        </h3>
        <motion.p
          animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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

  const titleY = useSpring(useTransform(scrollYProgress, [0, 0.4], [80, 0]), {
    stiffness: 80,
    damping: 20,
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="nossa-area"
      className="relative bg-[#02050A] py-28 md:py-40 px-5 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Luzes de fundo atmosféricas */}
      <div className="absolute -top-60 -left-40 w-[600px] h-[600px] bg-[#C88E70]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#C88E70]/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Linhas decorativas verticais */}
      <div className="absolute left-5 md:left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Título */}
          <motion.div style={{ y: titleY, opacity: titleOpacity }}>
            <p className="text-[#C88E70] uppercase tracking-[0.45em] text-xs font-semibold flex items-center gap-3 mb-5">
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
          </motion.div>

          {/* Bloco de descrição + localização */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xs"
          >
            <p className="text-gray-400 font-light text-base leading-relaxed mb-6">
              Cada detalhe do nosso espaço foi pensado para que você se sinta em
              casa — com o conforto e o requinte que você merece.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#C88E70] text-xs uppercase tracking-[0.2em] font-semibold group"
            >
              <MapPin className="w-4 h-4" />
              Ver localização
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex gap-0 mt-14 border border-white/5 rounded-2xl overflow-hidden"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`flex-1 px-6 md:px-10 py-6 text-center ${
                i < STATS.length - 1 ? "border-r border-white/5" : ""
              } hover:bg-white/[0.02] transition-colors`}
            >
              <p className="text-3xl md:text-4xl font-serif text-[#C88E70] mb-1">
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-light">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* BENTO GRID GALLERY */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile: stack vertical */}
        <div className="flex flex-col gap-4 md:hidden">
          {GALLERY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl"
              style={{ height: 240 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.src})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-[#C88E70] text-xs uppercase tracking-widest mb-1 font-semibold">
                  {item.label}
                </p>
                <p className="text-gray-300 text-sm font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: bento grid */}
        <div className="hidden md:grid grid-cols-3 grid-rows-3 gap-4">
          {GALLERY.map((item, i) => (
            <GalleryCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* Rodapé da seção: horário */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-7xl mx-auto mt-16 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5"
      >
        <div className="flex items-center gap-3 text-gray-400">
          <Clock className="w-5 h-5 text-[#C88E70]" />
          <span className="text-sm font-light tracking-wide">
            Seg – Sáb:{" "}
            <span className="text-white font-semibold">08:00 – 20:00</span>
            <span className="mx-3 text-white/20">|</span>
            Dom:{" "}
            <span className="text-white font-semibold">09:00 – 15:00</span>
          </span>
        </div>
        <motion.div
          className="w-full md:w-auto"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <a
            href="#servicos"
            className="block w-full md:w-auto text-center border border-[#C88E70]/40 text-[#C88E70] hover:bg-[#C88E70] hover:text-[#050B14] px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300"
          >
            Agendar Visita
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
