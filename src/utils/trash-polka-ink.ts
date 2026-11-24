// Trash Polka ink: a straight port of KillerUI Controls/TrashPolkaInk.cs (the E7 piece
// Steve picked on 2026-11-16, built on his own forearm tattoo). The same seed draws
// the same marks in the same places as the apps, so .NET Framework's seeded Random is
// ported below and every R()/Next() call stays in the C# order. Keep the call order
// intact when editing: hoisting one call changes the whole picture.

/** System.Random (.NET Framework, Knuth subtractive) with a seed, bit for bit. */
class NetRandom {
  private readonly seedArray: number[] = Array.from<number>({ length: 56 }).fill(0);
  private inext = 0;
  private inextp = 21;

  constructor(seed: number) {
    const MBIG = 2147483647;
    const MSEED = 161803398;
    const subtraction = seed === -2147483648 ? 2147483647 : Math.abs(seed);
    let mj = MSEED - subtraction;
    this.seedArray[55] = mj;
    let mk = 1;
    for (let i = 1; i < 55; i++) {
      const ii = (21 * i) % 55;
      this.seedArray[ii] = mk;
      mk = mj - mk;
      if (mk < 0) {
        mk += MBIG;
      }
      mj = this.seedArray[ii];
    }
    for (let k = 1; k < 5; k++) {
      for (let i = 1; i < 56; i++) {
        this.seedArray[i] -= this.seedArray[1 + ((i + 30) % 55)];
        if (this.seedArray[i] < 0) {
          this.seedArray[i] += MBIG;
        }
      }
    }
  }

  private internalSample(): number {
    const MBIG = 2147483647;
    if (++this.inext >= 56) {
      this.inext = 1;
    }
    if (++this.inextp >= 56) {
      this.inextp = 1;
    }
    let ret = this.seedArray[this.inext] - this.seedArray[this.inextp];
    if (ret === MBIG) {
      ret--;
    }
    if (ret < 0) {
      ret += MBIG;
    }
    this.seedArray[this.inext] = ret;
    return ret;
  }

  nextDouble(): number {
    return this.internalSample() * (1.0 / 2147483647);
  }

  next(max: number): number {
    return Math.trunc(this.nextDouble() * max);
  }
}

export const NetRandomForTest = NetRandom;

type Rgb = [number, number, number];
interface Pt { x: number, y: number }

const BLACK: Rgb = [0x0B, 0x0B, 0x0B];
const BONE: Rgb = [0xE8, 0xE4, 0xDC];

/** The pieces' seeds and opacities, as in TrashPolkaInk.cs. */
export const TP_WINDOW_SEED = 160;
export const TP_SPLIT_SEED = 161;
export const TP_BACKGROUND_SEED = 162;
export const TP_SCALE = 1.25;
export const TP_OPACITY = { pane: 0.41, background: 0.26, popup: 0.18, screen: 0.2, cell: 0.14, page: 0.32 };

// C# Math.Round rounds halves to even
function roundEven(x: number): number {
  const f = Math.floor(x);
  const d = x - f;
  if (d > 0.5) {
    return f + 1;
  }
  if (d < 0.5) {
    return f;
  }
  return f % 2 === 0 ? f : f + 1;
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function rgba(c: Rgb, alphaByte: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${alphaByte / 255})`;
}

class Ink {
  private readonly r: NetRandom;
  private readonly layers: CanvasRenderingContext2D[] = [];

  constructor(private ctx: CanvasRenderingContext2D, private readonly accent: Rgb, seed: number, private readonly w: number, private readonly h: number, private readonly base: DOMMatrix) {
    this.r = new NetRandom(seed);
  }

  private R(a: number, b: number) {
    return a + this.r.nextDouble() * (b - a);
  }

  private isAccent(c: Rgb) {
    return c === this.accent;
  }

  // TrashPolkaInk.Shade: alpha in 5% steps, the dark shade at 55%
  private accentStyle(alpha: number, dark: boolean) {
    const key = roundEven(clamp(alpha, 0, 1) * 20);
    const f = dark ? 0.55 : 1;
    const c = this.accent;
    return rgba([Math.trunc(c[0] * f), Math.trunc(c[1] * f), Math.trunc(c[2] * f)], Math.trunc(key * 255 / 20));
  }

  private B(c: Rgb, a = 1) {
    if (this.isAccent(c)) {
      return this.accentStyle(a, false);
    }
    return rgba(c, Math.trunc(a * 255));
  }

  private ellipse(fill: string | null, stroke: { style: string, width: number } | null, p: Pt, rx: number, ry: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke.style;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
  }

  private line(style: string, width: number, a: Pt, b: Pt, cap: CanvasLineCap = 'butt') {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.lineCap = cap;
    ctx.stroke();
  }

  private poly(points: Pt[], fill: string) {
    const ctx = this.ctx;
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill('evenodd');
  }

  // A group drawn at an opacity (DrawingContext.PushOpacity / PushOpacityMask): marks go to a
  // scratch canvas with the same transform, then land on the parent in one pass.
  private pushLayer() {
    const depth = this.layers.length;
    const c = document.createElement('canvas');
    c.width = this.ctx.canvas.width;
    c.height = this.ctx.canvas.height;
    const lctx = c.getContext('2d')!;
    lctx.setTransform(this.ctx.getTransform());
    this.layers.push(this.ctx);
    this.ctx = lctx;
    return depth;
  }

  private popLayer(opacity: number, mask?: (ctx: CanvasRenderingContext2D) => void) {
    const layer = this.ctx;
    if (mask) {
      layer.save();
      layer.globalCompositeOperation = 'destination-in';
      mask(layer);
      layer.restore();
    }
    this.ctx = this.layers.pop()!;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.globalAlpha = opacity;
    this.ctx.drawImage(layer.canvas, 0, 0);
    this.ctx.restore();
    layer.canvas.width = 0;
  }

  piece() {
    this.ctx.setTransform(this.base);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.w, this.h);
    this.ctx.clip();
    this.sleeve();
    const l = 0;
    const t = 0;
    const r = this.w;
    const h = this.h;
    this.splatter({ x: r - 0.4 * 430, y: t + 0.82 * h }, 44, BLACK);
    this.splatter({ x: l + 0.6 * 430, y: t + 0.25 * h }, 24, this.accent);
  }

  private sleeve() {
    const left = 0;
    const top = 0;
    const right = this.w;
    const bottom = this.h;
    const width = this.w;
    const height = this.h;
    const accent = this.accent;

    this.pushLayer();
    const across = Math.max(3, Math.trunc(width / 300));
    for (let i = 0; i < across * 3; i++) {
      const x = left + (i % across + this.R(0.1, 0.9)) * width / across;
      const y = top + (Math.trunc(i / across) + this.R(0.1, 0.9)) * height / 3;
      this.hexCluster({ x, y }, this.R(12, 30), 6 + this.r.next(8), this.R(0, 1) < 0.5, this.R(0, 1) < 0.5);
      const hx = x + this.R(-80, 80);
      const hy = y + this.R(-80, 80);
      this.halftoneArc({ x: hx, y: hy }, this.R(50, 90), this.R(110, 180), this.R(0, 360), this.R(70, 160), this.R(0, 1) < 0.5 ? accent : BLACK);
      const sx = x + this.R(-120, 120);
      const sy = y + this.R(-120, 120);
      this.splatter({ x: sx, y: sy }, this.R(14, 30), this.R(0, 1) < 0.3 ? accent : BLACK);
    }
    this.popLayer(0.35);

    const angles = [-62, -35, -12, 8, 27, 51, 74];
    for (let col = left + 60; col < right; col += this.R(230, 320)) {
      for (let y = top + this.R(20, 120); y < bottom; y += this.R(170, 260)) {
        const x = col + this.R(-70, 70);
        const c = { x, y };
        const ang = angles[this.r.next(angles.length)];
        switch (this.r.next(4)) {
          case 0: {
            this.tilted(c, ang, () => this.dryBrush({ x: c.x - 180, y: c.y }, { x: c.x + 180, y: c.y }, this.R(26, 50), BLACK));
            const px = c.x + this.R(-60, 60);
            const py = c.y + this.R(-60, 60);
            this.hexCluster({ x: px, y: py }, this.R(14, 24), 5 + this.r.next(6), false, this.R(0, 1) < 0.5);
            break;
          }
          case 1: {
            this.tilted(c, ang, () => this.smearBar({ x: c.x - 160, y: c.y - 13, w: 320, h: this.R(16, 30) }, false, accent));
            const px = c.x + this.R(-50, 50);
            const py = c.y + this.R(-30, 30);
            this.splatter({ x: px, y: py }, this.R(22, 44), BLACK);
            break;
          }
          case 2:
            this.brushArc(c, this.R(70, 130), this.R(0, 360), this.R(90, 170), this.R(22, 38), BLACK);
            this.halftoneArc(c, 40, 90, this.R(0, 360), this.R(80, 140), accent);
            break;
          default: {
            this.starburst(c, 14, this.R(70, 120));
            const rx = this.R(50, 90);
            const ry = this.R(50, 90);
            this.ellipse(null, { style: this.B(accent, 0.9), width: 2 }, c, rx, ry);
            const px = c.x + this.R(-40, 40);
            const py = c.y + this.R(-40, 40);
            this.hexCluster({ x: px, y: py }, this.R(10, 18), 6, true, this.R(0, 1) < 0.5);
            break;
          }
        }
      }
    }

    for (let i = 0; i < across * 3; i++) {
      const x0 = this.R(left - 60, right - 200);
      const y0 = this.R(top, bottom - 150);
      this.dotWave({ x: x0, y: y0 }, this.R(260, 420), this.R(-50, 50), this.R(18, 40), this.R(0.012, 0.03), 4 + this.r.next(4), i % 3 === 0 ? BLACK : accent);
    }

    for (let i = 0; i < across * 5; i++) {
      const px = this.R(left, right);
      const py = this.R(top + 20, bottom - 40);
      this.hexMix({ x: px, y: py }, this.R(11, 30), 5 + this.r.next(9));
    }

    const mid = { x: left + width * 0.5, y: top + height * 0.42 };
    this.hexCluster({ x: mid.x - 60, y: mid.y - 80 }, 28, 12, false, false);
    this.tilted(mid, -18, () => this.smearBar({ x: mid.x - width * 0.45, y: mid.y + 40, w: width * 0.9, h: 36 }, false, accent));
    this.brushArc(mid, 220, 160, 150, 56, BLACK);
    this.dryBrush({ x: mid.x - 300, y: mid.y + 260 }, { x: mid.x + 320, y: mid.y - 240 }, 60, BLACK);
    this.halftoneArc({ x: mid.x + 80, y: mid.y + 60 }, 120, 220, 200, 130, accent);
    this.splatter({ x: mid.x + 140, y: mid.y + 200 }, 58, BLACK);
    this.starburst({ x: mid.x - 220, y: mid.y - 60 }, 20, 160);
    this.ellipse(null, { style: this.B(accent, 0.9), width: 2.4 }, mid, 170, 160);

    const m = { x: right - 200, y: top + height * 0.58 };
    this.halftoneArc(m, 150, 200, -150, 120, accent);
    this.tilted(m, 12, () => this.smearBar({ x: m.x - 22, y: top - 20, w: 44, h: height * 0.9 }, true, accent));
    this.brushArc({ x: m.x + 40, y: m.y - 30 }, 175, 200, 140, 46, BLACK);
    this.hexCluster({ x: m.x + 50, y: m.y - 230 }, 26, 9, false, false);
    this.hexCluster({ x: m.x - 120, y: m.y - 150 }, 14, 7, true, true);
    this.splatter({ x: m.x - 10, y: m.y + 90 }, 70, BLACK);
    this.dryBrush({ x: m.x - 230, y: m.y + 210 }, { x: m.x + 230, y: m.y - 20 }, 52, BLACK);
    this.starburst({ x: m.x - 150, y: m.y - 20 }, 22, 140);
    this.ellipse(null, { style: this.B(accent, 0.9), width: 2.2 }, { x: m.x + 20, y: m.y - 60 }, 110, 104);
    this.splatter({ x: m.x + 120, y: m.y - 330 }, 20, accent);

    const s = { x: left + 140, y: top + 230 };
    this.hexCluster({ x: s.x - 40, y: s.y - 90 }, 20, 10, false, true);
    this.hexCluster({ x: s.x + 70, y: s.y + 40 }, 11, 6, true, false);
    this.tilted(s, -28, () => this.smearBar({ x: s.x - 200, y: s.y + 30, w: 380, h: 24 }, false, accent));
    this.dryBrush({ x: s.x + 60, y: s.y - 220 }, { x: s.x - 40, y: s.y + 260 }, 40, BLACK);
    this.halftoneArc({ x: s.x + 20, y: s.y + 120 }, 70, 120, 20, 140, BLACK);
    this.splatter({ x: s.x + 90, y: s.y + 170 }, 30, accent);
    this.ellipse(null, { style: this.B(BLACK, 0.85), width: 1.4 }, s, 120, 112);

    const t1 = { x: left + width * 0.38, y: top + height * 0.18 };
    this.bubbleHalo({ x: t1.x + 180, y: t1.y + 260 }, 300);
    this.tattooPiece(t1, clamp(height / 22, 26, 44));
    const t2 = { x: right - width * 0.2, y: top + height * 0.12 };
    this.bubbleHalo({ x: t2.x + 120, y: t2.y + 220 }, 220);
    this.tattooPiece(t2, clamp(height / 30, 20, 34));
    this.dotClump({ x: left + width * 0.18, y: top + height * 0.78 }, 90);
    this.dotClump({ x: right - width * 0.12, y: top + height * 0.82 }, 70);
    this.streakSplat({ x: left + width * 0.12, y: top + height * 0.3 }, 46);
    this.streakSplat({ x: left + width * 0.7, y: top + height * 0.85 }, 40);

    for (let i = 0; i < across * 20; i++) {
      const px = this.R(left, right);
      const py = this.R(top, bottom);
      const rr = this.R(0, 1) ** 3 * 4 + 0.7;
      this.ellipse(this.B(i % 4 === 0 ? accent : BLACK, 0.9), null, { x: px, y: py }, rr, rr);
    }
  }

  // ---- Steve's tattoo ----

  private tattooPiece(at: Pt, r: number) {
    const gap = Math.max(3, r * 0.12);
    const dx = r * Math.sqrt(3) + gap;
    const dy = r * 1.5 + gap * 0.87;
    const cell = (q: number, s: number): Pt => ({ x: at.x + dx * (q + s / 2.0), y: at.y + r * 4.2 + dy * s });
    const cells: [number, number][] = [];
    for (let s = 0; s < 7; s++) {
      const width = s === 0 || s === 6 ? 2 : 3 + (s % 2);
      const start = Math.trunc(-s / 2) + (s > 3 ? 1 : 0);
      for (let q = start; q < start + width; q++) {
        cells.push([q, s]);
      }
    }
    const bone = this.B(BONE);
    const ink = this.B(BLACK);
    for (const [q, s] of cells) {
      const p = cell(q, s);
      this.hex(p, r, BLACK, true);
      switch (this.r.next(7)) {
        case 0:
        case 1:
          this.hex(p, r * 0.62, BONE, true);
          this.hex(p, r * 0.4, BLACK, true);
          break;
        case 2:
          this.ellipse(this.B(this.accent), null, p, r * 0.17, r * 0.17);
          break;
        case 3:
          this.hex(p, r * 0.6, BONE, true);
          this.hex(p, r * 0.46, BLACK, true);
          this.hex(p, r * 0.3, BONE, true);
          break;
        default:
          break;
      }
    }
    const traceW = Math.max(2, r * 0.1);
    for (let i = 0; i < 4; i++) {
      const a = cells[this.r.next(cells.length)];
      const bq = a[0] + (this.r.next(2) === 0 ? 0 : -1);
      const bs = a[1] + 1 + this.r.next(2);
      const pa = cell(a[0], a[1]);
      const pb = cell(bq, bs);
      this.line(bone, traceW, pa, { x: pa.x, y: (pa.y + pb.y) / 2 });
      this.line(bone, traceW, { x: pa.x, y: (pa.y + pb.y) / 2 }, pb);
      this.ellipse(ink, { style: bone, width: traceW }, pb, r * 0.24, r * 0.24);
    }
    const fanW = Math.max(1.6, r * 0.07);
    const last = cells[cells.length - 1];
    const origin = cell(last[0], last[1]);
    for (let k = 0; k < 6; k++) {
      const s0 = { x: origin.x + r * 0.3 * k, y: origin.y + r };
      const s1 = { x: s0.x, y: s0.y + r * (1.2 + k * 0.35) };
      const s2 = { x: s1.x + r * (1 + k * 0.2), y: s1.y + r * (1 + k * 0.2) };
      const s3 = { x: s2.x, y: s2.y + r * this.R(0.8, 2) };
      this.line(ink, fanW, s0, s1);
      this.line(ink, fanW, s1, s2);
      this.line(ink, fanW, s2, s3);
      this.ellipse(ink, null, s3, r * 0.13, r * 0.13);
    }
    const first = cell(cells[0][0], cells[0][1]);
    for (let k = 0; k < 4; k++) {
      const s0 = { x: first.x - r * 1.2, y: first.y - r * 0.4 * k };
      const s1 = { x: s0.x - r * (1.5 + k * 0.5), y: s0.y - r * (1.5 + k * 0.5) };
      const s2 = { x: s1.x - r * 2, y: s1.y };
      this.line(ink, fanW, s0, s1);
      this.line(ink, fanW, s1, s2);
      this.ellipse(ink, null, s2, r * 0.12, r * 0.12);
    }
    this.gauge({ x: at.x + dx * 0.2, y: at.y + r * 0.6 }, r * 2.6);
  }

  private gauge(c: Pt, rad: number) {
    const ink = this.B(BLACK);
    this.brushArc(c, rad, 0, 360, rad * 0.22, BLACK);
    this.ellipse(null, { style: this.B(this.accent, 0.8), width: 1.6 }, c, rad * 1.04, rad * 1.04);
    for (let i = 0; i < 40; i++) {
      const a = this.R(0, Math.PI * 2);
      const d = rad * this.R(0.95, 1.25);
      const rr = this.R(0.6, 2.4);
      this.ellipse(this.B(i % 3 === 0 ? BLACK : this.accent, 0.9), null, { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d }, rr, rr);
    }
    const thinW = Math.max(1.4, rad * 0.025);
    for (const f of [0.78, 0.62, 0.48]) {
      const a0 = this.R(0, 360);
      const sweep = this.R(120, 260);
      const rr = rad * f;
      this.arc(c, rr, a0, a0 + sweep, ink, rad * 0.06, 'butt');
    }
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9 + this.R(-0.1, 0.1);
      const o = { x: c.x + Math.cos(a) * rad * 0.86, y: c.y + Math.sin(a) * rad * 0.86 };
      const m = { x: c.x + Math.cos(a) * rad * 0.55, y: c.y + Math.sin(a) * rad * 0.55 };
      const n = { x: c.x + Math.cos(a + 0.3) * rad * 0.4, y: c.y + Math.sin(a + 0.3) * rad * 0.4 };
      this.line(ink, thinW, o, m);
      this.line(ink, thinW, m, n);
    }
    this.ellipse(null, { style: this.B(this.accent), width: rad * 0.04 }, c, rad * 0.24, rad * 0.24);
    this.hex(c, rad * 0.16, this.accent, true);
    this.hex(c, rad * 0.08, BLACK, true);
  }

  private bubbleHalo(c: Pt, radius: number) {
    const ink = this.B(BLACK, 0.9);
    for (let i = 0; i < 420; i++) {
      const a = this.R(0, Math.PI * 2);
      const d = radius * Math.sqrt(this.R(0, 1));
      if (this.R(0, 1) < d / radius * 0.6) {
        continue;
      }
      const rr = this.R(2.5, 6.5) * (1 - d / radius * 0.5);
      const p = { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d };
      if (this.R(0, 1) < 0.5) {
        this.ellipse(ink, null, p, rr, rr);
      }
      else {
        this.ellipse(null, { style: ink, width: rr * 0.5 }, p, rr * 0.8, rr * 0.8);
      }
    }
  }

  private dotClump(c: Pt, radius: number) {
    for (let i = 0; i < 70; i++) {
      const a = this.R(0, Math.PI * 2);
      const d = radius * this.R(0, 1) ** 0.8;
      const rr = (1 - d / radius) * this.R(6, 16) + 1.2;
      this.ellipse(this.B(this.accent, 0.9), null, { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d }, rr, rr);
    }
  }

  private streakSplat(c: Pt, size: number) {
    this.splatter(c, size, BLACK);
    const ink = this.B(BLACK);
    for (let i = 0; i < 5; i++) {
      const a = this.R(0, Math.PI * 2);
      const len = size * this.R(2.5, 5);
      const end = { x: c.x + Math.cos(a) * len, y: c.y + Math.sin(a) * len };
      this.line(ink, this.R(1.5, 3.5), c, end);
      const rx = this.R(2, 5);
      const ry = this.R(2, 5);
      this.ellipse(ink, null, end, rx, ry);
    }
  }

  private tilted(about: Pt, degrees: number, draw: () => void) {
    this.ctx.save();
    this.ctx.translate(about.x, about.y);
    this.ctx.rotate(degrees * Math.PI / 180);
    this.ctx.translate(-about.x, -about.y);
    draw();
    this.ctx.restore();
  }

  private arc(c: Pt, r: number, fromDeg: number, toDeg: number, style: string, width: number, cap: CanvasLineCap) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, fromDeg * Math.PI / 180, toDeg * Math.PI / 180, false);
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.lineCap = cap;
    ctx.stroke();
  }

  private brushArc(c: Pt, radius: number, startDeg: number, sweepDeg: number, width: number, col: Rgb) {
    const bristles = Math.trunc(width * 1.4);
    for (let i = 0; i < bristles; i++) {
      const rr = radius + (i / bristles - 0.5) * width;
      const edge = Math.abs(i / bristles - 0.5) * 2;
      const a0 = startDeg + this.R(0, 15 + edge * 30);
      const a1 = startDeg + sweepDeg - this.R(0, 10 + edge * 50);
      let a = a0;
      while (a < a1) {
        const b = Math.min(a1, a + this.R(15, 70));
        const w = edge < 0.6 ? this.R(2.4, 4) : this.R(1, 2.4);
        this.arc(c, rr, a, b, this.B(col, this.R(0.7, 1)), w, 'round');
        a = b + (this.R(0, 1) < 0.1 + edge * 0.45 ? this.R(2, 10) : 0);
      }
    }
  }

  private dotWave(start: Pt, length: number, angleDeg: number, amp: number, freq: number, rows: number, col: Rgb) {
    const a = angleDeg * Math.PI / 180;
    const ph = this.R(0, 6);
    const dir = { x: Math.cos(a), y: Math.sin(a) };
    const nrm = { x: -dir.y, y: dir.x };
    for (let row = 0; row < rows; row++) {
      const across = 1 - Math.abs(row - (rows - 1) / 2.0) / ((rows + 1) / 2.0);
      for (let t = 0; t < length; t += 11) {
        const wave = amp * Math.sin(t * freq * Math.PI * 2 / 10 + ph);
        const pulse = 0.5 + 0.5 * Math.sin(t / length * Math.PI);
        const rad = 4.8 * across * pulse;
        if (rad < 0.9) {
          continue;
        }
        const off = wave + (row - (rows - 1) / 2.0) * 11 + ((t / 11) % 2) * 2;
        this.ellipse(this.B(col, 0.92), null, { x: start.x + dir.x * t + nrm.x * off, y: start.y + dir.y * t + nrm.y * off }, rad, rad);
      }
    }
  }

  private halftoneArc(c: Pt, r0: number, r1: number, startDeg: number, sweepDeg: number, col: Rgb) {
    for (let r = r0; r <= r1; r += 13) {
      const step = 13 / r * 180 / Math.PI;
      for (let a = 0; a <= sweepDeg; a += step) {
        const t = a / sweepDeg;
        const across = 1 - Math.abs((r - r0) / (r1 - r0) - 0.5) * 2;
        const rad = 5.6 * t ** 0.9 * (0.45 + 0.55 * across);
        if (rad < 0.9) {
          continue;
        }
        const ang = (startDeg + a) * Math.PI / 180;
        this.ellipse(this.B(col, 0.95), null, { x: c.x + r * Math.cos(ang), y: c.y + r * Math.sin(ang) }, rad, rad);
      }
    }
  }

  private starburst(c: Pt, rays: number, reach: number) {
    const pen = this.B(BLACK, 0.8);
    for (let i = 0; i < rays; i++) {
      const a = this.R(0, Math.PI * 2);
      const len = reach * this.R(0.2, 1) ** 0.6;
      const end = { x: c.x + Math.cos(a) * len, y: c.y + Math.sin(a) * len };
      this.line(pen, 1, c, end);
      if (this.R(0, 1) < 0.35) {
        this.ellipse(this.B(BLACK), null, end, 3.2, 3.2);
      }
    }
    this.ellipse(this.B(BLACK), null, c, 4.5, 4.5);
  }

  private growCells(count: number): [number, number][] {
    const taken = new Set<string>(['0,0']);
    const cells: [number, number][] = [[0, 0]];
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
    while (cells.length < count) {
      const [q, s] = cells[this.r.next(cells.length)];
      const d = n[this.r.next(6)];
      const key = `${q + d[0]},${s + d[1]}`;
      if (!taken.has(key)) {
        taken.add(key);
        cells.push([q + d[0], s + d[1]]);
      }
    }
    return cells;
  }

  private hexCluster(at: Pt, r: number, count: number, outlineOnly: boolean, colorBone: boolean) {
    const dx = r * Math.sqrt(3) + 4;
    const dy = r * 1.5 + 3.5;
    for (const [q, s] of this.growCells(count)) {
      const c = { x: at.x + dx * (q + s / 2.0), y: at.y + dy * s };
      const kind = this.r.next(10);
      const col = kind < 4 ? this.accent : colorBone ? BONE : BLACK;
      const fill = !outlineOnly && kind % 3 === 0;
      this.hex(c, r, col, fill);
    }
  }

  private hexMix(at: Pt, r: number, count: number) {
    const dx = r * Math.sqrt(3) + 4;
    const dy = r * 1.5 + 3.5;
    for (const [q, s] of this.growCells(count)) {
      const col = this.R(0, 1) < 0.5 ? this.accent : BLACK;
      this.hex({ x: at.x + dx * (q + s / 2.0), y: at.y + dy * s }, r, col, this.R(0, 1) < 0.45);
    }
  }

  private hex(c: Pt, r: number, col: Rgb, fill: boolean) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      const x = c.x + r * Math.cos(a);
      const y = c.y + r * Math.sin(a);
      if (i === 0) {
        ctx.moveTo(x, y);
      }
      else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = this.B(col, 0.92);
      ctx.fill('evenodd');
    }
    else {
      ctx.strokeStyle = this.B(col, 0.95);
      ctx.lineWidth = Math.max(2, r * 0.13);
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
  }

  private dryBrush(a: Pt, b: Pt, width: number, col: Rgb) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const dir = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    const nrm = { x: -dir.y, y: dir.x };
    const at = (t: number, off: number): Pt => ({ x: a.x + dir.x * t + nrm.x * off, y: a.y + dir.y * t + nrm.y * off });
    const n = 40;
    const topPts: Pt[] = [];
    const botPts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const half = width * 0.38 * Math.sin(Math.PI * t ** 0.7) * (0.85 + this.R(0, 0.15));
      topPts.push(at(len * t * 0.92, half + this.R(-2, 2)));
      const k = this.R(0.75, 1);
      botPts.push(at(len * t * 0.86, -(half * k + this.R(-2, 2))));
    }
    this.poly([...topPts, ...botPts.reverse()], this.B(col, 0.95));
    const bristles = Math.trunc(width * 1.6);
    for (let i = 0; i < bristles; i++) {
      const off = (i / bristles - 0.5) * width;
      const edge = Math.abs(off) / (width / 2);
      const start = this.R(0, 0.18 + edge * 0.25) * len;
      const end = len - this.R(0, 0.1 + edge * 0.45) * len;
      let t = start;
      while (t < end) {
        const seg = this.R(len * 0.08, len * 0.5);
        const t2 = Math.min(end, t + seg);
        const p1 = at(t, off + this.R(-0.6, 0.6));
        const p2 = at(t2, off + this.R(-1.2, 1.2));
        const style = this.B(col, this.R(0.75, 1));
        this.line(style, this.R(1.2, 2.6), p1, p2, 'round');
        t = t2 + (this.R(0, 1) < 0.15 + edge * 0.4 ? this.R(4, 18) : 0);
      }
    }
    for (let i = 0; i < 14; i++) {
      const off = this.R(-width / 2, width / 2);
      const p1 = at(len * this.R(0.85, 0.98), off);
      const fwd = this.R(20, 70);
      const side = this.R(-6, 6);
      const p2 = { x: p1.x + dir.x * fwd + nrm.x * side, y: p1.y + dir.y * fwd + nrm.y * side };
      const style = this.B(col, this.R(0.5, 0.9));
      this.line(style, this.R(0.8, 1.6), p1, p2);
    }
  }

  private smearBar(r: { x: number, y: number, w: number, h: number }, vertical: boolean, col: Rgb) {
    this.pushLayer();
    this.ctx.fillStyle = this.B(col, 0.55);
    this.ctx.fillRect(r.x, r.y, r.w, r.h);
    const across = vertical ? r.w : r.h;
    for (let o = 0; o < across; o += this.R(0.8, 2.2)) {
      const a1 = this.R(0, 0.12);
      const a2 = this.R(0.75, 1.05);
      const p1 = vertical ? { x: r.x + o, y: r.y + r.h * a1 } : { x: r.x + r.w * a1, y: r.y + o };
      const p2 = vertical ? { x: r.x + o + this.R(-2, 2), y: r.y + r.h * a2 } : { x: r.x + r.w * a2, y: r.y + o + this.R(-2, 2) };
      const dark = this.R(0, 1) < 0.15;
      const alpha = this.R(0.35, 0.95);
      const style = this.isAccent(col) ? this.accentStyle(alpha, dark) : this.B(dark ? [Math.trunc(col[0] * 0.55), Math.trunc(col[1] * 0.55), Math.trunc(col[2] * 0.55)] : col, alpha);
      this.line(style, this.R(0.8, 2), p1, p2);
    }
    // Opacity mask: solid for the first 62%, fading out to the far end (in the bar's own frame)
    this.popLayer(1, (ctx) => {
      const g = vertical ? ctx.createLinearGradient(0, r.y, 0, r.y + r.h) : ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.62, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
    });
  }

  private splatter(c: Pt, size: number, col: Rgb) {
    const brush = this.B(col, 0.96);
    for (let k = 0; k < 9; k++) {
      const bx = c.x + this.R(-size * 0.6, size * 0.6);
      const by = c.y + this.R(-size * 0.3, size * 0.3);
      const br = size * this.R(0.28, 0.55);
      const n = 40;
      const ph = this.R(0, 6);
      const ph2 = this.R(0, 6);
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const a = i * Math.PI * 2 / n;
        const rr = br * (1 + 0.12 * Math.sin(a * 4 + ph) + 0.07 * Math.sin(a * 7 + ph2) + this.R(-0.04, 0.04));
        pts.push({ x: bx + rr * Math.cos(a), y: by + rr * Math.sin(a) * 0.85 });
      }
      this.poly(pts, brush);
    }
    for (let i = 0; i < 260; i++) {
      const a = this.R(0, Math.PI * 2);
      const d = size * (0.75 + this.R(0, 1) ** 1.8 * 1.9);
      const rad = Math.max(0.6, size * 0.075 * this.R(0, 1) ** 3 * (2.7 - d / size));
      const p = { x: c.x + Math.cos(a) * d * 1.15, y: c.y + Math.sin(a) * d * 0.8 };
      if (this.R(0, 1) < 0.08 && rad > 1.4) {
        const k = rad * this.R(2, 3.5);
        this.line(brush, rad * 1.4, p, { x: p.x + Math.cos(a) * k, y: p.y + Math.sin(a) * k }, 'round');
      }
      else {
        this.ellipse(brush, null, p, rad, rad * this.R(0.85, 1.15));
      }
    }
    const drips = 4 + this.r.next(4);
    for (let i = 0; i < drips; i++) {
      const x = c.x + this.R(-size * 0.75, size * 0.75);
      const y0 = c.y + size * 0.15;
      const y1 = y0 + this.R(size * 0.5, size * 1.8);
      const wTop = this.R(4, 9);
      const wBot = wTop * 0.45;
      this.poly([{ x: x - wTop / 2, y: y0 }, { x: x + wTop / 2, y: y0 }, { x: x + wBot / 2, y: y1 }, { x: x - wBot / 2, y: y1 }], brush);
      this.ellipse(brush, null, { x, y: y1 }, wBot * 1.1, wBot * 1.35);
    }
  }
}

/**
 * Draws one ink piece for a screen of cssW by cssH CSS pixels. Like the apps, the piece
 * is laid out in design units (screen / TP_SCALE) and shown TP_SCALE larger, so a window
 * resize only shows more or less of the same picture. Returns a canvas with the piece at
 * full strength; the caller lays it over a surface at that surface's opacity.
 */
export function drawTrashPolkaInk(accent: Rgb, seed: number, cssW: number, cssH: number, dpr: number): HTMLCanvasElement {
  const w = Math.ceil(cssW / TP_SCALE);
  const h = Math.ceil(cssH / TP_SCALE);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * TP_SCALE * dpr);
  canvas.height = Math.ceil(h * TP_SCALE * dpr);
  const ctx = canvas.getContext('2d')!;
  const k = TP_SCALE * dpr;
  new Ink(ctx, accent, seed, w, h, new DOMMatrix([k, 0, 0, k, 0, 0])).piece();
  return canvas;
}

/** The piece at an opacity, as an object URL for a CSS background. */
export async function inkLayerUrl(piece: HTMLCanvasElement, opacity: number): Promise<string | null> {
  const out = document.createElement('canvas');
  out.width = piece.width;
  out.height = piece.height;
  const ctx = out.getContext('2d')!;
  ctx.globalAlpha = opacity;
  ctx.drawImage(piece, 0, 0);
  const blob = await new Promise<Blob | null>(resolve => out.toBlob(resolve, 'image/png'));
  out.width = 0;
  return blob ? URL.createObjectURL(blob) : null;
}
