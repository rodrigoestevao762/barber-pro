const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

async function main() {
  const imgPath = 'C:/Users/Maria/.gemini/antigravity/brain/e5dbd460-7f5c-49b4-bb07-8cd121600368/.user_uploaded/media_1793227255286_bd5a139a.png';
  
  // Crop the 344x345 square
  // Upscale 3x to 1032x1035 with lanczos3 for maximum vector precision
  const buffer = await sharp(imgPath)
    .extract({ left: 340, top: 163, width: 344, height: 345 })
    .resize(1032, 1035, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  // In potrace: if we set blackOnWhite: false, it traces the light foreground!
  const params = {
    color: 'currentColor',
    optCurve: true,
    optTolerance: 0.2,
    threshold: 110,
    blackOnWhite: false, // THIS IS THE KEY!
    turdSize: 3
  };

  potrace.trace(buffer, params, (err, svg) => {
    if (err) {
      console.error('Potrace error:', err);
      return;
    }
    console.log('Vectorized with blackOnWhite: false! SVG length:', svg.length);
    fs.writeFileSync('public/logo-mr-bastos.svg', svg);
    
    // Also extract the path data 'd'
    const match = svg.match(/<path d="([^"]+)"/);
    if (match) {
      console.log('Path d length:', match[1].length);
      fs.writeFileSync('public/logo-path-d.txt', match[1]);
    }
  });
}

main().catch(console.error);
