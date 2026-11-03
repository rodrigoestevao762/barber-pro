const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAllBrandAssets() {
  const badgePath = path.join(__dirname, '../public/logo-mrbastos-badge.png');
  const badgeBuffer = fs.readFileSync(badgePath);

  // 1. Gera ícones em múltiplos tamanhos (16, 32, 48, 180, 192, 512)
  const icon16 = await sharp(badgeBuffer).resize(16, 16).png().toBuffer();
  const icon32 = await sharp(badgeBuffer).resize(32, 32).png().toBuffer();
  const icon48 = await sharp(badgeBuffer).resize(48, 48).png().toBuffer();
  const icon180 = await sharp(badgeBuffer).resize(180, 180).png().toBuffer();
  const icon192 = await sharp(badgeBuffer).resize(192, 192).png().toBuffer();
  const icon256 = await sharp(badgeBuffer).resize(256, 256).png().toBuffer();
  const icon512 = await sharp(badgeBuffer).resize(512, 512).png().toBuffer();

  // Salva os ícones do App Router e Public
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), icon192);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), icon192);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), icon180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), icon180);
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), icon192);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), icon512);
  fs.writeFileSync(path.join(__dirname, '../public/project-avatar.png'), icon256);

  // 2. Constrói um favicon.ico padronizado (16x16, 32x32, 48x48)
  const icoList = [
    { size: 16, buffer: icon16 },
    { size: 32, buffer: icon32 },
    { size: 48, buffer: icon48 }
  ];

  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + icoList.length * dirEntrySize;
  const dirEntries = [];

  for (const item of icoList) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.size, 0); // Width
    entry.writeUInt8(item.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  const icoHeader = Buffer.alloc(headerSize);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type = 1 (ICO)
  icoHeader.writeUInt16LE(icoList.length, 4); // Count

  const finalIcoBuffer = Buffer.concat([
    icoHeader,
    ...dirEntries,
    ...icoList.map(i => i.buffer)
  ]);

  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), finalIcoBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), finalIcoBuffer);

  // 3. Constrói a imagem Open Graph oficial (1200x630) para Vercel Preview, WhatsApp e Redes Sociais
  const ogWidth = 1200;
  const ogHeight = 630;
  const ogBadgeSize = 280;
  const badgeResized = await sharp(badgeBuffer).resize(ogBadgeSize, ogBadgeSize).png().toBuffer();

  const ogSvgOverlay = Buffer.from(`
    <svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#2563EB" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#050B14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <!-- Fundo dark executivo -->
      <rect width="100%" height="100%" fill="#050B14"/>
      
      <!-- Brilho azul de fundo -->
      <rect width="100%" height="100%" fill="url(#glow)"/>
      
      <!-- Moldura sutil -->
      <rect x="24" y="24" width="${ogWidth - 48}" height="${ogHeight - 48}" rx="32" fill="none" stroke="#2563EB" stroke-width="2" stroke-opacity="0.25"/>

      <!-- Textos -->
      <text x="600" y="440" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">
        Mr. Bastos Barbearia
      </text>

      <text x="600" y="485" font-family="sans-serif" font-size="18" font-weight="600" fill="#60A5FA" text-anchor="middle" letter-spacing="4">
        O PADRÃO DE EXCELÊNCIA EM ALAGOINHAS – BA
      </text>

      <text x="600" y="535" font-family="sans-serif" font-size="15" font-weight="400" fill="#9CA3AF" text-anchor="middle">
        Hiper Gbarbosa · Cortes Clássicos · Barboterapia · Agendamento Online
      </text>
    </svg>
  `);

  const ogBadgeLeft = Math.round((ogWidth - ogBadgeSize) / 2);
  const ogBadgeTop = 90;

  const finalOgImage = await sharp(ogSvgOverlay)
    .composite([
      {
        input: badgeResized,
        left: ogBadgeLeft,
        top: ogBadgeTop
      }
    ])
    .png()
    .toBuffer();

  // Grava nos caminhos suportados pelo Next.js e Vercel
  fs.writeFileSync(path.join(__dirname, '../src/app/opengraph-image.png'), finalOgImage);
  fs.writeFileSync(path.join(__dirname, '../src/app/twitter-image.png'), finalOgImage);
  fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), finalOgImage);

  // Também grava og-image.jpg para compatibilidade máxima
  const finalOgJpg = await sharp(finalOgImage).jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/og-image.jpg'), finalOgJpg);

  console.log('✅ Todos os ícones, favicons, project-avatar e Open Graph foram gerados com sucesso!');
}

generateAllBrandAssets().catch(console.error);
