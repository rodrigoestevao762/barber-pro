const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add import statement at the top
if (!content.includes('import ExperienciaSection')) {
    content = content.replace(
        'import BookingModal from "@/components/BookingModal";', 
        'import BookingModal from "@/components/BookingModal";\nimport ExperienciaSection from "@/components/ExperienciaSection";'
    );
}

// 2. Replace the old section
const lines = content.split(/\r?\n/);
const startIdx = 315;
const endIdx = 433; // 434 is MEGA BRAIN FINAL CTA
lines.splice(startIdx, endIdx - startIdx, "      <ExperienciaSection />");

fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf8');