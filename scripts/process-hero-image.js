const sharp = require('sharp');
const fs = require('fs');

async function processHero() {
  const inputPath = 'C:/Users/Maria/.gemini/antigravity/brain/e5dbd460-7f5c-49b4-bb07-8cd121600368/.user_uploaded/media_1793250643441_51a47991.jpg';
  
  // 1. Get image metadata
  const meta = await sharp(inputPath).metadata();
  console.log('Source:', meta.width, 'x', meta.height);
  
  // 2. We want a rich, dark cinematic luxury feel:
  // - High contrast
  // - Rich caramel leather highlights
  // - Deep shadow depth so text on top is perfectly legible
  // - Warm tint (#C88E70 / amber / deep bronze)
  
  const width = 1920;
  const height = Math.round((1920 / meta.width) * meta.height);
  
  // Create an SVG gradient overlay to create cinematic depth and vignette
  const vignetteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Radial dark vignette -->
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="30%" stop-color="#000000" stop-opacity="0.1" />
          <stop offset="70%" stop-color="#02050A" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#02050A" stop-opacity="0.85" />
        </radialGradient>
        <!-- Warm golden tone filter -->
        <linearGradient id="warmTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C88E70" stop-opacity="0.12" />
          <stop offset="50%" stop-color="#1E2A4A" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#050B14" stop-opacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#warmTone)" />
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  `);
  
  // Process the base image with color correction
  const processedBuffer = await sharp(inputPath)
    .resize(width, height, { fit: 'cover' })
    .modulate({
      brightness: 0.88,   // slightly deeper so white walls don't overpower
      saturation: 1.15,   // rich colors for leather chairs and blue walls
    })
    .linear(1.18, -14)    // boost contrast (richer blacks, pop highlights)
    .composite([
      {
        input: vignetteSvg,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile('public/hero-mrbastos-salon.jpg');
    
  console.log('Saved public/hero-mrbastos-salon.jpg successfully!');
}

processHero().catch(console.error);

