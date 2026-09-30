import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer with filter byte at the start of each row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // Calculate CRC32 over type + data
  const crcTarget = chunk.subarray(4, 8 + len);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. App Icon Generator (Modern Indigo/Blue gradient with stylized PWA Lightning / Diamond geometric mark)
function appIconShader(isMaskable) {
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;
    const cx = w / 2;
    const cy = h / 2;
    const dx = (x - cx) / (w / 2);
    const dy = (y - cy) / (h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Background: Deep vibrant indigo/violet gradient
    const bgR = Math.round(30 + nx * 20);
    const bgG = Math.round(58 + ny * 40);
    const bgB = Math.round(138 + (nx + ny) * 55);

    if (!isMaskable) {
      // Rounded corner for standard icon
      const cornerRadius = 0.22;
      const ax = Math.abs(dx) - (1 - cornerRadius);
      const ay = Math.abs(dy) - (1 - cornerRadius);
      if (ax > 0 && ay > 0 && Math.sqrt(ax * ax + ay * ay) > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }

    // Emblem in the safe center zone (scale adjusted for maskable safe margin)
    const scale = isMaskable ? 0.38 : 0.46;
    const ex = (x - cx) / (w * scale);
    const ey = (y - cy) / (h * scale);

    // Dynamic Hexagon / Gem shape + Lightning / Spark
    const hexDist = Math.max(Math.abs(ex) * 0.866 + Math.abs(ey) * 0.5, Math.abs(ey));
    if (hexDist < 0.95) {
      // Inside badge outline
      if (hexDist > 0.82) {
        // Glowing cyan/electric blue border
        return [56, 189, 248, 255];
      }
      
      // Central icon: Lightning / Letter P geometric mark
      const inSpark = (ey > -0.6 && ey < 0.1 && ex > -0.15 - ey * 0.3 && ex < 0.3 - ey * 0.3) ||
                      (ey >= 0.0 && ey < 0.6 && ex > -0.3 - (ey - 0.2) * 0.4 && ex < 0.15 - (ey - 0.2) * 0.4);
      if (inSpark) {
        // Bright white/amber highlight
        return [255, 255, 255, 255];
      }
      return [15, 23, 42, 255]; // Dark backdrop for contrast
    }

    return [bgR, bgG, bgB, 255];
  };
}

// 2. Wide Screenshot Generator (1280 x 720)
function wideScreenshotShader(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  // Sleek dashboard preview mockup
  // Header bar (y < 60)
  if (y < 60) {
    if (y > 15 && y < 45 && x > 30 && x < 240) return [59, 130, 246, 255]; // brand logo pill
    if (y > 20 && y < 40 && x > w - 180 && x < w - 40) return [30, 41, 59, 255]; // actions
    return [15, 23, 42, 255]; // dark header
  }
  // Sidebar (x < 220)
  if (x < 220) {
    return [30, 41, 59, 255];
  }
  // Main canvas background
  const bg = Math.round(241 + ny * 6);
  // Grid cards inside main content
  const inCard1 = x > 260 && x < 560 && y > 100 && y < 280;
  const inCard2 = x > 590 && x < 890 && y > 100 && y < 280;
  const inCard3 = x > 920 && x < 1220 && y > 100 && y < 280;
  const inBigChart = x > 260 && x < 1220 && y > 310 && y < 660;

  if (inCard1 || inCard2 || inCard3 || inBigChart) {
    // White card with subtle border
    return [255, 255, 255, 255];
  }

  return [bg, bg, bg + 4, 255];
}

// 3. Narrow Screenshot Generator (720 x 1280)
function narrowScreenshotShader(x, y, w, h) {
  const ny = y / h;
  // Mobile app layout
  if (y < 80) return [15, 23, 42, 255]; // Top App Bar
  if (y > h - 70) return [15, 23, 42, 255]; // Bottom Nav Bar
  const inCard = x > 30 && x < w - 30 && ((y > 110 && y < 320) || (y > 350 && y < 580) || (y > 610 && y < 840));
  if (inCard) return [255, 255, 255, 255];
  return [243, 244, 246, 255];
}

console.log('Generating PWA assets...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, appIconShader(false)));
console.log('Created pwa-192x192.png');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, appIconShader(false)));
console.log('Created pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, appIconShader(true)));
console.log('Created pwa-maskable-512x512.png');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, appIconShader(false)));
console.log('Created apple-touch-icon.png');

fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), createPng(1280, 720, wideScreenshotShader));
console.log('Created screenshot-desktop.png');

fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), createPng(720, 1280, narrowScreenshotShader));
console.log('Created screenshot-mobile.png');

// Also create icon.svg and favicon.ico
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="115" fill="url(#grad)" />
  <path d="M256 96L384 170V342L256 416L128 342V170L256 96Z" stroke="#38BDF8" stroke-width="24" fill="#0F172A" />
  <path d="M280 160L190 280H260L232 352L322 232H252L280 160Z" fill="#FFFFFF" />
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A8A" />
      <stop offset="1" stop-color="#4338CA" />
    </linearGradient>
  </defs>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(48, 48, appIconShader(false)));
console.log('All PWA assets generated successfully!');
