const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split(/\r?\n/);

// Insert import at line 8
lines.splice(8, 0, 'import ExperienciaSection from "@/components/ExperienciaSection";');

// Find section indices
let startIdx = lines.findIndex(l => l.includes('<section id="experiencia"'));
let endIdx = lines.findIndex(l => l.includes('{/* MEGA BRAIN FINAL CTA & FOOTER */}'));

// Remove the section and insert the component
lines.splice(startIdx, endIdx - startIdx, '      <ExperienciaSection />\n');

fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf8');