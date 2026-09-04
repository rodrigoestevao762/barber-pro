const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split(/\r?\n/);

const startIdx = 321; // 322 in 1-based
const endIdx = 356;   // 357 in 1-based

const newContent = `          {/* Coluna do Leque de Fotos (Mega Brain Fan) */}
          <div className="w-full md:w-1/2 relative h-[60vh] md:h-[80vh] flex items-center justify-center">
             
             {/* Container do Leque */}
             <div className="relative w-full max-w-[280px] md:max-w-[320px] aspect-[3/4] group perspective-[1200px]">
                {[
                  { id: 1, src: "https://images.unsplash.com/photo-1512496015851-a1cbfc3a3642?q=80&w=800", rotate: -15, x: "-35%", y: "5%", z: -10 },
                  { id: 2, src: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=1000", rotate: 0, x: "0%", y: "0%", z: 10 },
                  { id: 3, src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800", rotate: 15, x: "35%", y: "5%", z: -10 },
                ].map((img, i) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, y: 150, rotate: 0, x: 0 }}
                    whileInView={{ opacity: 1, y: img.y, rotate: img.rotate, x: img.x }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                      duration: 1.2, 
                      delay: 0.2 + (i * 0.1), 
                      type: "spring", 
                      stiffness: 70, 
                      damping: 20 
                    }}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 0, 
                      x: img.x === "0%" ? 0 : (img.x.includes("-") ? "-40%" : "40%"), 
                      y: "-5%", 
                      zIndex: 50,
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)"
                    }}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#050B14] cursor-pointer grayscale-[40%] hover:grayscale-0 transition-all duration-500 will-change-transform"
                    style={{ transformOrigin: "bottom center", zIndex: img.z }}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: 'url(' + img.src + ')' }}
                    />
                    {/* Inner Shadow for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(5,11,20,0.5)] pointer-events-none transition-opacity group-hover:opacity-0" />
                  </motion.div>
                ))}
             </div>
             
             {/* Bloco de Valores flutuante */}
             <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
               className="absolute -bottom-8 md:bottom-12 -left-4 md:-left-8 bg-[#C88E70] text-[#050B14] p-8 rounded-xl shadow-[0_20px_50px_rgba(200,142,112,0.15)] backdrop-blur-md max-w-[280px] z-[60]"
             >
                <Star className="w-8 h-8 mb-4" />
                <p className="font-serif text-xl leading-tight mb-2">Tradição & Respeito</p>
                <p className="text-xs font-sans font-medium opacity-80 uppercase tracking-widest leading-relaxed">
                  O cuidado que passa de geração em geração, moldando o homem moderno com raízes clássicas.
                </p>
             </motion.div>
          </div>`;

lines.splice(startIdx, endIdx - startIdx, newContent);
fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf8');