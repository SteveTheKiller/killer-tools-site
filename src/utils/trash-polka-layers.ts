import { drawTrashPolkaInk, inkLayerUrl, TP_BACKGROUND_SEED, TP_OPACITY, TP_SPLIT_SEED, TP_WINDOW_SEED } from './trash-polka-ink';

// Trash Polka surfaces, as the apps lay them out: the content pane carries the
// window piece, the chrome the background piece, cards the split piece and
// popups a faint background piece. Each layer is the full piece at that
// surface's opacity, sized to the screen and pinned to the viewport in CSS,
// so a resize shows more or less of the same picture instead of redrawing it.
const LAYERS = [
  { css: '--kt-tp-page', seed: TP_WINDOW_SEED, opacity: TP_OPACITY.pane },
  { css: '--kt-tp-chrome', seed: TP_BACKGROUND_SEED, opacity: TP_OPACITY.background },
  { css: '--kt-tp-card', seed: TP_SPLIT_SEED, opacity: TP_OPACITY.page },
  { css: '--kt-tp-popup', seed: TP_BACKGROUND_SEED, opacity: TP_OPACITY.popup },
] as const;

let current = '';
let urls: string[] = [];

function hexRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) {
    return null;
  }
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function clearTrashPolka() {
  const d = document.documentElement;
  for (const l of LAYERS) {
    d.style.removeProperty(l.css);
  }
  d.style.removeProperty('--kt-tp-size');
  urls.forEach(u => URL.revokeObjectURL(u));
  urls = [];
  current = '';
}

/** Draws the ink for an accent and points the --kt-tp-* layers at it. */
export async function applyTrashPolka(accentHex: string) {
  const rgb = hexRgb(accentHex);
  if (!rgb) {
    return;
  }
  const w = Math.max(window.screen.width, window.innerWidth);
  const h = Math.max(window.screen.height, window.innerHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const key = `${accentHex}|${w}x${h}@${dpr}`;
  if (key === current) {
    return;
  }
  current = key;

  const pieces = new Map<number, HTMLCanvasElement>();
  const next: string[] = [];
  const values: [string, string][] = [];
  for (const l of LAYERS) {
    let piece = pieces.get(l.seed);
    if (!piece) {
      piece = drawTrashPolkaInk(rgb, l.seed, w, h, dpr);
      pieces.set(l.seed, piece);
    }
    const url = await inkLayerUrl(piece, l.opacity);
    if (current !== key) {
      // A newer accent started while this one was drawing
      if (url) {
        URL.revokeObjectURL(url);
      }
      next.forEach(u => URL.revokeObjectURL(u));
      return;
    }
    if (url) {
      next.push(url);
      values.push([l.css, `url('${url}')`]);
    }
  }
  pieces.forEach(p => (p.width = 0));

  const d = document.documentElement;
  if (d.getAttribute('data-kt-theme') !== 'trashpolka') {
    next.forEach(u => URL.revokeObjectURL(u));
    current = '';
    return;
  }
  for (const [k, v] of values) {
    d.style.setProperty(k, v);
  }
  d.style.setProperty('--kt-tp-size', `${w}px ${h}px`);
  urls.forEach(u => URL.revokeObjectURL(u));
  urls = next;
}
