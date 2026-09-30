import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// SVG for standard icon (512x512)
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>

    <!-- Outer Ring Glow -->
    <linearGradient id="ringGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Medical Cross Gradient -->
    <linearGradient id="crossGrad" x1="160" y1="140" x2="352" y2="372" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <!-- Droplet Gradient -->
    <linearGradient id="dropGrad" x1="256" y1="170" x2="256" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <!-- Pulse Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
    </filter>
  </defs>

  <!-- Base Rounded Container with subtle border -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="url(#ringGrad)" stroke-width="4" stroke-opacity="0.35" />

  <!-- Inner Soft Radial Highlight -->
  <circle cx="256" cy="180" r="190" fill="#38bdf8" opacity="0.06" />

  <!-- Distinctive Medical Cross Shield (Clean Flat Depth) -->
  <g filter="url(#softShadow)">
    <!-- Medical Cross Shape with rounded ends -->
    <path d="
      M 204 116
      H 308
      C 321.2 116 332 126.8 332 140
      V 204
      H 396
      C 409.2 204 420 214.8 420 228
      V 332
      C 420 345.2 409.2 356 396 356
      H 332
      V 420
      C 332 433.2 321.2 444 308 444
      H 204
      C 190.8 444 180 433.2 180 420
      V 356
      H 116
      C 102.8 356 92 345.2 92 332
      V 228
      C 92 214.8 102.8 204 116 204
      H 180
      V 140
      C 180 126.8 190.8 116 204 116
      Z
    " fill="url(#crossGrad)" />

    <!-- Cross Outline Sheen -->
    <path d="
      M 204 116
      H 308
      C 321.2 116 332 126.8 332 140
      V 204
      H 396
      C 409.2 204 420 214.8 420 228
      V 332
      C 420 345.2 409.2 356 396 356
      H 332
      V 420
      C 332 433.2 321.2 444 308 444
      H 204
      C 190.8 444 180 433.2 180 420
      V 356
      H 116
      C 102.8 356 92 345.2 92 332
      V 228
      C 92 214.8 102.8 204 116 204
      H 180
      V 140
      C 180 126.8 190.8 116 204 116
      Z
    " fill="none" stroke="#60a5fa" stroke-width="3" stroke-opacity="0.4" />
  </g>

  <!-- Central Precision Infusion Droplet & Gauge -->
  <!-- Droplet Body -->
  <path d="
    M 256 168
    C 256 168 184 274 184 326
    A 72 72 0 0 0 328 326
    C 328 274 256 168 256 168
    Z
  " fill="url(#dropGrad)" />

  <!-- Droplet Inner Glass Refraction Highlight -->
  <path d="
    M 236 210
    C 220 240 206 280 206 312
    A 50 50 0 0 0 220 348
    C 212 334 210 300 226 264
    C 234 246 242 226 242 226
    Z
  " fill="#ffffff" opacity="0.65" />

  <!-- Medical Calculator Display Grid & EKG Line inside Droplet -->
  <!-- Subtle measurement ticks on right side of droplet -->
  <line x1="284" y1="270" x2="304" y2="270" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  <line x1="284" y1="295" x2="300" y2="295" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
  <line x1="284" y1="320" x2="306" y2="320" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  <line x1="284" y1="345" x2="298" y2="345" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />

  <!-- Glowing Digital Pulse Line Passing through Center -->
  <path d="
    M 124 280
    H 162
    L 174 280
    L 182 258
    L 194 302
    L 204 274
    L 212 280
    H 230
  " fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />

  <path d="
    M 124 280
    H 162
    L 174 280
    L 182 258
    L 194 302
    L 204 274
    L 212 280
    H 230
  " fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Syringe Needle Accent & Precision Sparkle at Top -->
  <circle cx="256" cy="144" r="7" fill="#38bdf8" />
  <circle cx="256" cy="144" r="3" fill="#ffffff" />

  <!-- Top Right Math / Medical Accent Dot -->
  <circle cx="396" cy="120" r="10" fill="#38bdf8" opacity="0.85" />
  <path d="M 391 120 H 401 M 396 115 V 125" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
</svg>
`;

// Maskable SVG (Full bleed background, 20% safe zone padding around main symbol)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0b132b" />
      <stop offset="50%" stop-color="#1c2541" />
      <stop offset="100%" stop-color="#0a0f1d" />
    </linearGradient>

    <linearGradient id="mCrossGrad" x1="180" y1="160" x2="332" y2="352" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <linearGradient id="mDropGrad" x1="256" y1="190" x2="256" y2="330" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <filter id="mShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Full Bleed Background (Edge-to-edge for circular/squircle mask) -->
  <rect width="512" height="512" fill="url(#mBgGrad)" />

  <!-- Subtle Ambient Glow in Safe Zone -->
  <circle cx="256" cy="256" r="160" fill="#38bdf8" opacity="0.08" />

  <!-- Scaled Group inside Safe Zone (scaled down to 78% centered) -->
  <g transform="translate(56, 56) scale(0.78)">
    <g filter="url(#mShadow)">
      <!-- Medical Cross -->
      <path d="
        M 204 116
        H 308
        C 321.2 116 332 126.8 332 140
        V 204
        H 396
        C 409.2 204 420 214.8 420 228
        V 332
        C 420 345.2 409.2 356 396 356
        H 332
        V 420
        C 332 433.2 321.2 444 308 444
        H 204
        C 190.8 444 180 433.2 180 420
        V 356
        H 116
        C 102.8 356 92 345.2 92 332
        V 228
        C 92 214.8 102.8 204 116 204
        H 180
        V 140
        C 180 126.8 190.8 116 204 116
        Z
      " fill="url(#mCrossGrad)" stroke="#60a5fa" stroke-width="4" stroke-opacity="0.4" />
    </g>

    <!-- Droplet Body -->
    <path d="
      M 256 168
      C 256 168 184 274 184 326
      A 72 72 0 0 0 328 326
      C 328 274 256 168 256 168
      Z
    " fill="url(#mDropGrad)" />

    <!-- Droplet Inner Highlight -->
    <path d="
      M 236 210
      C 220 240 206 280 206 312
      A 50 50 0 0 0 220 348
      C 212 334 210 300 226 264
      C 234 246 242 226 242 226
      Z
    " fill="#ffffff" opacity="0.65" />

    <!-- Graduations -->
    <line x1="284" y1="270" x2="304" y2="270" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.85" />
    <line x1="284" y1="295" x2="300" y2="295" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85" />
    <line x1="284" y1="320" x2="306" y2="320" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.85" />
    <line x1="284" y1="345" x2="298" y2="345" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85" />

    <!-- Pulse Line -->
    <path d="
      M 124 280
      H 162
      L 174 280
      L 182 258
      L 194 302
      L 204 274
      L 212 280
      H 230
    " fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

    <circle cx="256" cy="144" r="7" fill="#38bdf8" />
    <circle cx="256" cy="144" r="3" fill="#ffffff" />
  </g>
</svg>
`;

async function buildIcons() {
  const publicDir = path.resolve('public');

  console.log('Generating medical calculator PWA icons...');

  // 1. Write icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg.trim(), 'utf8');
  console.log('✔ Generated public/icon.svg');

  // 2. Generate 512x512 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✔ Generated public/pwa-512x512.png');

  // 3. Generate 192x192 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✔ Generated public/pwa-192x192.png');

  // 4. Generate Maskable 512x512 PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✔ Generated public/pwa-maskable-512x512.png (Safe zone padding)');

  // 5. Generate Apple Touch Icon 180x180 PNG
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✔ Generated public/apple-touch-icon.png');

  // 6. Generate Favicon (64x64 PNG or ico)
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✔ Generated public/favicon.ico');

  console.log('All icons generated successfully!');
}

buildIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
