// Port of KillerUI Controls/GrainTexture.cs: the family film grain as one
// procedural 256px tile. Every pixel is a gray speck, lightly blended with its
// neighbours; 40% of the specks lean toward the complement of the accent hue
// (or of the background hue when the accent is neutral). Seed 1337 through a
// port of .NET's seeded System.Random, so the speck pattern matches the apps.

const SIZE = 256;
const SEED = 1337;
const ALPHA = 70;
const SHADE_SPREAD = 150;
const SOFTEN = 0.10;
const CONTRAST = 1.35;
const LEAN_SHARE = 0.40;
const LEAN_MIX = 0.80;

type Rgb = [number, number, number];

// .NET Math.Round is banker's rounding (half to even).
function roundEven(v: number): number {
  const f = Math.floor(v);
  const d = v - f;
  if (d > 0.5) {
    return f + 1;
  }
  if (d < 0.5) {
    return f;
  }
  return f % 2 === 0 ? f : f + 1;
}

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

// System.Random(int seed): Knuth's subtractive generator (Net5CompatSeedImpl).
function dotnetRandom(seed: number): () => number {
  const MBIG = 2147483647;
  const MSEED = 161803398;
  const seedArray = new Int32Array(56);
  const subtraction = seed === -2147483648 ? MBIG : Math.abs(seed);
  let mj = MSEED - subtraction;
  seedArray[55] = mj;
  let mk = 1;
  let ii = 0;
  for (let i = 1; i < 55; i++) {
    ii += 21;
    if (ii >= 55) {
      ii -= 55;
    }
    seedArray[ii] = mk;
    mk = mj - mk;
    if (mk < 0) {
      mk += MBIG;
    }
    mj = seedArray[ii];
  }
  for (let k = 1; k < 5; k++) {
    for (let i = 1; i < 56; i++) {
      let n = i + 30;
      if (n >= 55) {
        n -= 55;
      }
      seedArray[i] -= seedArray[1 + n];
      if (seedArray[i] < 0) {
        seedArray[i] += MBIG;
      }
    }
  }
  let inext = 0;
  let inextp = 21;
  return () => {
    if (++inext >= 56) {
      inext = 1;
    }
    if (++inextp >= 56) {
      inextp = 1;
    }
    let ret = seedArray[inext] - seedArray[inextp];
    if (ret === MBIG) {
      ret--;
    }
    if (ret < 0) {
      ret += MBIG;
    }
    seedArray[inext] = ret;
    return ret * (1.0 / MBIG);
  };
}

let shades: Uint8Array | null = null;
let leaning: Uint8Array | null = null;

function buildBase() {
  const rng = dotnetRandom(SEED);
  const raw = new Float64Array(SIZE * SIZE);
  leaning = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < raw.length; i++) {
    const u1 = 1.0 - rng();
    const u2 = rng();
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    raw[i] = clamp(128 + SHADE_SPREAD * gauss);
    leaning[i] = rng() < LEAN_SHARE ? 1 : 0;
  }
  shades = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const around = (raw[((y + SIZE - 1) % SIZE) * SIZE + x] + raw[((y + 1) % SIZE) * SIZE + x]
        + raw[y * SIZE + (x + SIZE - 1) % SIZE] + raw[y * SIZE + (x + 1) % SIZE]) / 4;
      const soft = raw[y * SIZE + x] * (1 - SOFTEN) + around * SOFTEN;
      shades[y * SIZE + x] = roundEven(clamp(128 + (soft - 128) * CONTRAST));
    }
  }
}

function tryHue([r8, g8, b8]: Rgb): number | null {
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (max < 0.08 || d / max < 0.25) {
    return null;
  }
  let hue: number;
  if (max === r) {
    hue = 60 * (((g - b) / d) % 6);
  }
  else if (max === g) {
    hue = 60 * ((b - r) / d + 2);
  }
  else {
    hue = 60 * ((r - g) / d + 4);
  }
  return hue < 0 ? hue + 360 : hue;
}

function fromHsv(hue: number, s: number, v: number): Rgb {
  const c = v * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (hue < 60) {
    rgb = [c, x, 0];
  }
  else if (hue < 120) {
    rgb = [x, c, 0];
  }
  else if (hue < 180) {
    rgb = [0, c, x];
  }
  else if (hue < 240) {
    rgb = [0, x, c];
  }
  else if (hue < 300) {
    rgb = [x, 0, c];
  }
  else {
    rgb = [c, 0, x];
  }
  return rgb.map(n => roundEven((n + m) * 255)) as Rgb;
}

export function leanFor(accent: Rgb, background: Rgb): Rgb | null {
  let hue = tryHue(accent);
  if (hue === null) {
    hue = tryHue(background);
  }
  if (hue === null) {
    return null;
  }
  // Reds and peaches lean orange-brown like the blues.
  if (hue >= 330 || hue < 31) {
    return fromHsv(25, 0.55, 0.85);
  }
  hue = (hue + 180) % 360;
  // The plain complement of a green lands on pink; the family leans greens to purple.
  if (hue >= 300 && hue < 345) {
    hue = 285;
  }
  return fromHsv(hue, 0.55, 0.85);
}

/** RGBA tile pixels, before the theme's GrainOpacity is applied. */
export function grainPixels(lean: Rgb | null, highlightsOnly: boolean): Uint8ClampedArray {
  if (!shades || !leaning) {
    buildBase();
  }
  const sh = shades!;
  const ln = leaning!;
  const px = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let i = 0; i < sh.length; i++) {
    const shade = sh[i];
    let r = shade;
    let g = shade;
    let b = shade;
    if (lean && ln[i]) {
      // The leaning speck keeps its own lightness, so it tints without brightening.
      const k = 0.35 + 1.1 * shade / 255.0;
      r = shade * (1 - LEAN_MIX) + clamp(lean[0] * k) * LEAN_MIX;
      g = shade * (1 - LEAN_MIX) + clamp(lean[1] * k) * LEAN_MIX;
      b = shade * (1 - LEAN_MIX) + clamp(lean[2] * k) * LEAN_MIX;
    }
    const p = i * 4;
    px[p] = roundEven(r);
    px[p + 1] = roundEven(g);
    px[p + 2] = roundEven(b);
    // Fade midtones on near-black surfaces without dimming the brightest specks.
    px[p + 3] = highlightsOnly ? roundEven(ALPHA * (shade / 255.0) ** 6) : ALPHA;
  }
  return px;
}

const cache = new Map<string, string>();

/** A data URL for the theme's tile, with GrainOpacity baked into the alpha. */
export function grainTileUrl(accent: Rgb, background: Rgb, opacity: number, highlightsOnly: boolean): string {
  const lean = leanFor(accent, background);
  const key = `${lean?.join(',') ?? '-'}|${opacity}|${highlightsOnly ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const px = grainPixels(lean, highlightsOnly);
  for (let p = 3; p < px.length; p += 4) {
    px[p] = Math.round(px[p] * opacity);
  }
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  const image = ctx.createImageData(SIZE, SIZE);
  image.data.set(px);
  ctx.putImageData(image, 0, 0);
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

/** Parses #rgb, #rrggbb or rgb()/rgba() into channels. */
export function parseColor(value: string): Rgb | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map(c => c + c).join('') : hex[1];
    return [Number.parseInt(h.slice(0, 2), 16), Number.parseInt(h.slice(2, 4), 16), Number.parseInt(h.slice(4, 6), 16)];
  }
  const fn = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number);
    if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
      return parts as Rgb;
    }
  }
  return null;
}
