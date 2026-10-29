const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace the straight razor (navalhete) image with the new salon photo
const oldRazorImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop';
content = content.replace(
  oldRazorImg,
  '/hero-mrbastos-salon.jpg'
);

// Also make sure /hero-mrbastos-salon.jpg is the first image in HERO_IMAGES
content = content.replace(
  /const HERO_IMAGES = \[\r?\n\s*"[^"]+",\r?\n\s*"[^"]+",\r?\n\s*"\/hero-mrbastos-salon\.jpg"\r?\n\];/,
  `const HERO_IMAGES = [
  "/hero-mrbastos-salon.jpg",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
];`
);

// Enhance hero image overlay and styling for premium color grading
content = content.replace(
  'className="absolute inset-0 bg-cover bg-center grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-1000"',
  'className="absolute inset-0 bg-cover bg-center transition-all duration-1000"'
);

content = content.replace(
  '<div className="absolute inset-0 bg-[#050B14]/40 md:bg-[#050B14]/60 pointer-events-none" />',
  '<div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/60 via-[#050B14]/30 to-[#050B14]/80 pointer-events-none" />'
);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log('src/app/page.tsx successfully updated with the new cover photo!');

