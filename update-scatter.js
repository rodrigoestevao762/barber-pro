const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split(/\r?\n/);

const startIdx = 321;
const endIdx = 379;

const newContent = "          {/* Coluna da Galeria Scatter (Mega Brain Collage) */}\n" +
"          <div className=\"w-full md:w-1/2 relative h-[600px] md:h-[800px] flex items-center justify-center\">\n" +
"             <div className=\"relative w-full h-full\">\n" +
"                {[\n" +
"                  { src: \"https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=600\", w: \"w-[40%]\", h: \"h-[30%]\", t: \"5%\", l: \"0%\", z: 20, rotate: -4, delay: 0.1 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600\", w: \"w-[30%]\", h: \"h-[25%]\", t: \"0%\", l: \"45%\", z: 10, rotate: 6, delay: 0.2 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1512496015851-a1cbfc3a3642?q=80&w=600\", w: \"w-[35%]\", h: \"h-[35%]\", t: \"20%\", l: \"60%\", z: 30, rotate: 12, delay: 0.3 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600\", w: \"w-[45%]\", h: \"h-[40%]\", t: \"35%\", l: \"10%\", z: 40, rotate: -8, delay: 0.4 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600\", w: \"w-[25%]\", h: \"h-[20%]\", t: \"30%\", l: \"35%\", z: 15, rotate: 2, delay: 0.5 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600\", w: \"w-[35%]\", h: \"h-[35%]\", t: \"55%\", l: \"55%\", z: 35, rotate: -5, delay: 0.6 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600\", w: \"w-[30%]\", h: \"h-[30%]\", t: \"65%\", l: \"0%\", z: 25, rotate: 10, delay: 0.7 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=600\", w: \"w-[20%]\", h: \"h-[20%]\", t: \"80%\", l: \"35%\", z: 12, rotate: -12, delay: 0.8 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1633362141505-188849b29158?q=80&w=600\", w: \"w-[25%]\", h: \"h-[25%]\", t: \"75%\", l: \"70%\", z: 22, rotate: 4, delay: 0.9 },\n" +
"                  { src: \"https://images.unsplash.com/photo-1532710093739-9470acff878b?q=80&w=600\", w: \"w-[35%]\", h: \"h-[20%]\", t: \"45%\", l: \"60%\", z: 5, rotate: -15, delay: 1.0 },\n" +
"                ].map((img, i) => (\n" +
"                  <motion.div\n" +
"                    key={i}\n" +
"                    initial={{ opacity: 0, scale: 0.5, y: 50, rotate: img.rotate + (Math.random() * 20 - 10) }}\n" +
"                    whileInView={{ opacity: 1, scale: 1, y: 0, rotate: img.rotate }}\n" +
"                    viewport={{ once: true, margin: \"-100px\" }}\n" +
"                    transition={{ \n" +
"                      duration: 1.2, \n" +
"                      delay: img.delay, \n" +
"                      type: \"spring\", \n" +
"                      stiffness: 80, \n" +
"                      damping: 20 \n" +
"                    }}\n" +
"                    whileHover={{ \n" +
"                      scale: 1.15, \n" +
"                      rotate: 0, \n" +
"                      zIndex: 100,\n" +
"                      boxShadow: \"0 30px 60px -15px rgba(0,0,0,0.8)\"\n" +
"                    }}\n" +
"                    className={\"absolute \" + img.w + \" \" + img.h + \" rounded-xl overflow-hidden shadow-2xl border-[3px] border-[#050B14] cursor-crosshair grayscale-[60%] hover:grayscale-0 transition-all duration-300 will-change-transform\"}\n" +
"                    style={{ top: img.t, left: img.l, zIndex: img.z }}\n" +
"                  >\n" +
"                    <div \n" +
"                      className=\"absolute inset-0 bg-cover bg-center\"\n" +
"                      style={{ backgroundImage: 'url(' + img.src + ')' }}\n" +
"                    />\n" +
"                    <div className=\"absolute inset-0 bg-[#C88E70]/20 opacity-0 hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none\" />\n" +
"                  </motion.div>\n" +
"                ))}\n" +
"             </div>\n" +
"             \n" +
"             {/* Bloco de Valores flutuante - Posicionado sobre a bagunça */}\n" +
"             <motion.div\n" +
"               initial={{ opacity: 0, y: 50 }}\n" +
"               whileInView={{ opacity: 1, y: 0 }}\n" +
"               viewport={{ once: true }}\n" +
"               transition={{ delay: 1.5, duration: 1, ease: \"easeOut\" }}\n" +
"               className=\"absolute -bottom-8 md:bottom-12 -left-4 md:-left-8 bg-[#C88E70] text-[#050B14] p-8 rounded-xl shadow-[0_30px_60px_rgba(200,142,112,0.3)] backdrop-blur-md max-w-[300px] z-[120]\"\n" +
"             >\n" +
"                <Star className=\"w-8 h-8 mb-4\" />\n" +
"                <p className=\"font-serif text-xl leading-tight mb-2\">A Essência da Tradição</p>\n" +
"                <p className=\"text-xs font-sans font-medium opacity-80 uppercase tracking-widest leading-relaxed\">\n" +
"                  Uma rede de histórias interligadas, moldando o homem moderno com raízes clássicas e excelência implacável.\n" +
"                </p>\n" +
"             </motion.div>\n" +
"          </div>";

lines.splice(startIdx, endIdx - startIdx, newContent);
fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf8');