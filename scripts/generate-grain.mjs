// Generates the site's film-grain tiles from the family desktop recipe
// (KillerUI Controls/GrainTexture.cs): every pixel is a gray speck with a
// Gaussian shade, lightly blended with its neighbours, at a flat tile alpha of
// 70 scaled by the theme's GrainOpacity. Black asks for highlights only, which
// fades the midtones so only the brightest specks show on near-black.
//
// The desktop apps seed .NET's Random, so the pattern differs; the texture and
// strength match. Run with `node scripts/generate-grain.mjs`.

import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const SIZE = 256;
const ALPHA = 70;
const SHADE_SPREAD = 150;
const SOFTEN = 0.10;
const CONTRAST = 1.35;

// Same names and opacities as the desktop themes' GrainOpacity
const TILES = [
  { file: 'grain-a17.png', opacity: 0.24, highlightsOnly: false }, // every dark theme
  { file: 'grain-a17-highlights.png', opacity: 0.24, highlightsOnly: true }, // Black
  { file: 'grain-a28.png', opacity: 0.4, highlightsOnly: false }, // Light
];

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = v => Math.max(0, Math.min(255, v));

function shades() {
  const rng = mulberry32(1337);
  const raw = new Float64Array(SIZE * SIZE);
  for (let i = 0; i < raw.length; i++) {
    const u1 = 1 - rng();
    const u2 = rng();
    raw[i] = clamp(128 + SHADE_SPREAD * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
  }
  const out = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Wrapping neighbours keep the tile seamless
      const around = (raw[((y + SIZE - 1) % SIZE) * SIZE + x] + raw[((y + 1) % SIZE) * SIZE + x]
        + raw[y * SIZE + (x + SIZE - 1) % SIZE] + raw[y * SIZE + (x + 1) % SIZE]) / 4;
      const soft = raw[y * SIZE + x] * (1 - SOFTEN) + around * SOFTEN;
      out[y * SIZE + x] = Math.round(clamp(128 + (soft - 128) * CONTRAST));
    }
  }
  return out;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) {
    c = CRC_TABLE[(c ^ b) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function encodePng(rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const rows = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  for (let y = 0; y < SIZE; y++) {
    rows[y * (SIZE * 4 + 1)] = 0; // no filter
    rgba.copy(rows, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const shade = shades();
for (const { file, opacity, highlightsOnly } of TILES) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < shade.length; i++) {
    const s = shade[i];
    const alpha = highlightsOnly ? ALPHA * (s / 255) ** 6 : ALPHA;
    rgba[i * 4] = s;
    rgba[i * 4 + 1] = s;
    rgba[i * 4 + 2] = s;
    rgba[i * 4 + 3] = Math.round(alpha * opacity);
  }
  writeFileSync(resolve('public', file), encodePng(rgba));
  console.log(`public/${file}`);
}
