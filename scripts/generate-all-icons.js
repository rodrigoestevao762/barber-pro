const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIcoFromPngBuffers(pngBuffersWithSizes) {
  // pngBuffersWithSizes: array of { size: number, buffer: Buffer }
  const count = pngBuffersWithSizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = headerSize + count * dirEntrySize;

  let currentOffset = totalDirSize;
  const dirEntries = [];

  for (const item of pngBuffersWithSizes) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = item.size >= 256 ? 0 : item.size;
    const h = item.size >= 256 ? 0 : item.size;
    
    entry.writeUInt8(w, 0); // Width
    entry.writeUInt8(h, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size
    entry.writeUInt32LE(currentOffset, 12); // Offset

    dirEntries.push(entry);
    currentOffset += item.buffer.length;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Count

  return Buffer.concat([header, ...dirEntries, ...pngBuffersWithSizes.map(i => i.buffer)]);
}

async function buildAllIcons() {
  const jpgPath = "C:/Users/Maria/.gemini/antigravity/brain/e5dbd460-7f5c-49b4-bb07-8cd121600368/.user_uploaded/media_1793411562680_d3ff6630.jpg";
  
  // Content bounds were: minX: 32, minY: 70, maxX: 303, maxY: 350 (271x280)
  // Extract content with 2px extra
  const content = await sharp(jpgPath)
    .extract({ left: 30, top: 68, width: 275, height: 284 })
    .toBuffer();

  // Create a 340x340 white canvas and composite the content in the center
  // 340 - 275 = 65 -> left 32
  // 340 - 284 = 56 -> top 28
  const padded = await sharp({
    create: {
      width: 340,
      height: 340,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: content,
    left: 32,
    top: 28
  }])
  .png()
  .toBuffer();

  // Now create a circular mask with radius 170 (340 / 2)
  // and a subtle gold border
  const circleSvg = Buffer.from(`
    <svg width="340" height="340">
      <circle cx="170" cy="170" r="169" fill="#ffffff" />
      <circle cx="170" cy="170" r="167" fill="none" stroke="#C5A880" stroke-width="4" />
    </svg>
  `);

  // Mask it so corners are transparent and edge has gold stroke
  const circleMask = Buffer.from(`
    <svg width="340" height="340">
      <circle cx="170" cy="170" r="169" fill="#ffffff" />
    </svg>
  `);

  const masterCircular = await sharp(padded)
    .composite([
      { input: circleMask, blend: 'dest-in' },
      {
        input: Buffer.from(`
          <svg width="340" height="340">
            <circle cx="170" cy="170" r="167" fill="none" stroke="#C5A880" stroke-width="4" />
          </svg>
        `),
        blend: 'over'
      }
    ])
    .png()
    .toBuffer();

  // Generate various sizes
  const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
  const pngBuffers = {};

  for (const s of sizes) {
    pngBuffers[s] = await sharp(masterCircular)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  // Generate ICO (16, 32, 48, 64, 128, 256)
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoData = createIcoFromPngBuffers(icoSizes.map(s => ({ size: s, buffer: pngBuffers[s] })));

  // Write files
  // 1. Next.js App Router root icons
  fs.writeFileSync('C:/Users/Maria/barber-pro/src/app/favicon.ico', icoData);
  fs.writeFileSync('C:/Users/Maria/barber-pro/src/app/icon.png', pngBuffers[32]);
  fs.writeFileSync('C:/Users/Maria/barber-pro/src/app/apple-icon.png', pngBuffers[180]);

  // 2. Public folder static assets
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/favicon.ico', icoData);
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/icon.png', pngBuffers[32]);
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/apple-icon.png', pngBuffers[180]);
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/icon-192.png', pngBuffers[192]);
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/icon-512.png', pngBuffers[512]);
  fs.writeFileSync('C:/Users/Maria/barber-pro/public/logo-mrbastos-badge.png', masterCircular);

  console.log('Successfully generated all icons!');
  console.log('favicon.ico size:', icoData.length);
  console.log('icon.png size:', pngBuffers[32].length);
  console.log('apple-icon.png size:', pngBuffers[180].length);
}

buildAllIcons().catch(console.error);

