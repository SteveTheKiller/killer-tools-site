<script setup lang="ts">
const shutterOptions = [
  { label: '1/8000', value: 1 / 8000 },
  { label: '1/4000', value: 1 / 4000 },
  { label: '1/2000', value: 1 / 2000 },
  { label: '1/1000', value: 1 / 1000 },
  { label: '1/500', value: 1 / 500 },
  { label: '1/250', value: 1 / 250 },
  { label: '1/125', value: 1 / 125 },
  { label: '1/60', value: 1 / 60 },
  { label: '1/30', value: 1 / 30 },
  { label: '1/15', value: 1 / 15 },
  { label: '1/8', value: 1 / 8 },
  { label: '1/4', value: 1 / 4 },
  { label: '1/2', value: 0.5 },
  { label: '1s', value: 1 },
  { label: '2s', value: 2 },
  { label: '4s', value: 4 },
  { label: '8s', value: 8 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: 'Custom', value: -1 },
];

const apertureOptions = [
  { label: 'f/1', value: 1.0 },
  { label: 'f/1.2', value: 1.2 },
  { label: 'f/1.4', value: 1.4 },
  { label: 'f/1.8', value: 1.8 },
  { label: 'f/2', value: 2 },
  { label: 'f/2.8', value: 2.8 },
  { label: 'f/4', value: 4 },
  { label: 'f/5.6', value: 5.6 },
  { label: 'f/8', value: 8 },
  { label: 'f/11', value: 11 },
  { label: 'f/16', value: 16 },
  { label: 'f/22', value: 22 },
  { label: 'f/32', value: 32 },
];

// -- State ---------------------------------------------------------------

const selectedShutter = ref(1 / 125);
const customShutter = ref('');
const selectedAperture = ref(8);

const shutterTrack = ref<HTMLElement | null>(null);
const apertureTrack = ref<HTMLElement | null>(null);

// -- Derived -------------------------------------------------------------

const isCustomShutter = computed(() => selectedShutter.value === -1);

const baseShutter = computed(() => {
  if (isCustomShutter.value) {
    const v = Number.parseFloat(customShutter.value);
    return Number.isNaN(v) || v <= 0 ? null : v;
  }
  return selectedShutter.value;
});

const equivalents = computed(() => {
  const t1 = baseShutter.value;
  const n1 = selectedAperture.value;

  return apertureOptions.map((opt) => {
    const shutter = t1 === null ? null : t1 * (opt.value ** 2) / (n1 ** 2);
    return { label: opt.label, aperture: opt.value, shutter };
  });
});

// -- Dial helpers --------------------------------------------------------

function scrollDialToActive(track: HTMLElement | null, behavior: ScrollBehavior = 'smooth') {
  if (!track) {
    return;
  }
  const active = track.querySelector('.dial-active') as HTMLElement | null;
  if (!active) {
    return;
  }
  const trackRect = track.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const target = track.scrollLeft + (activeRect.left - trackRect.left) - (trackRect.width / 2) + (activeRect.width / 2);
  track.scrollTo({ left: target, behavior });
}

function snapToNearest(track: HTMLElement, opts: { value: number }[], onSelect: (v: number) => void) {
  const cx = track.getBoundingClientRect().left + track.clientWidth / 2;
  const buttons = Array.from(track.querySelectorAll('button')) as HTMLElement[];
  let best = 0;
  let bestDist = Infinity;
  buttons.forEach((btn, i) => {
    const r = btn.getBoundingClientRect();
    const dist = Math.abs(r.left + r.width / 2 - cx);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  onSelect(opts[best].value);
  nextTick(() => {
    scrollDialToActive(track);
  });
}

// -- Shutter drag --------------------------------------------------------

const shutterDrag = { active: false, startX: 0, startScroll: 0, moved: false };

function shutterPointerDown(e: PointerEvent) {
  const t = shutterTrack.value;
  if (!t) {
    return;
  }
  shutterDrag.active = true;
  shutterDrag.moved = false;
  shutterDrag.startX = e.clientX;
  shutterDrag.startScroll = t.scrollLeft;
  t.setPointerCapture(e.pointerId);
}

function shutterPointerMove(e: PointerEvent) {
  if (!shutterDrag.active) {
    return;
  }
  const t = shutterTrack.value;
  if (!t) {
    return;
  }
  const dx = e.clientX - shutterDrag.startX;
  if (Math.abs(dx) > 4) {
    shutterDrag.moved = true;
  }
  t.scrollLeft = shutterDrag.startScroll - dx;
}

function shutterPointerUp(e: PointerEvent) {
  if (!shutterDrag.active) {
    return;
  }
  shutterDrag.active = false;
  const t = shutterTrack.value;
  if (!t) {
    return;
  }
  if (shutterDrag.moved) {
    snapToNearest(t, shutterOptions, (v) => {
      selectedShutter.value = v;
    });
  }
  else {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const btn = el?.closest('button');
    if (btn) {
      const idx = Array.from(t.querySelectorAll('button')).indexOf(btn as HTMLButtonElement);
      if (idx >= 0) {
        selectedShutter.value = shutterOptions[idx].value;
        nextTick(() => {
          scrollDialToActive(t);
        });
      }
    }
  }
}

// -- Aperture drag -------------------------------------------------------

const apertureDrag = { active: false, startX: 0, startScroll: 0, moved: false };

function aperturePointerDown(e: PointerEvent) {
  const t = apertureTrack.value;
  if (!t) {
    return;
  }
  apertureDrag.active = true;
  apertureDrag.moved = false;
  apertureDrag.startX = e.clientX;
  apertureDrag.startScroll = t.scrollLeft;
  t.setPointerCapture(e.pointerId);
}

function aperturePointerMove(e: PointerEvent) {
  if (!apertureDrag.active) {
    return;
  }
  const t = apertureTrack.value;
  if (!t) {
    return;
  }
  const dx = e.clientX - apertureDrag.startX;
  if (Math.abs(dx) > 4) {
    apertureDrag.moved = true;
  }
  t.scrollLeft = apertureDrag.startScroll - dx;
}

function aperturePointerUp(e: PointerEvent) {
  if (!apertureDrag.active) {
    return;
  }
  apertureDrag.active = false;
  const t = apertureTrack.value;
  if (!t) {
    return;
  }
  if (apertureDrag.moved) {
    snapToNearest(t, apertureOptions, (v) => {
      selectedAperture.value = v;
    });
  }
  else {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const btn = el?.closest('button');
    if (btn) {
      const idx = Array.from(t.querySelectorAll('button')).indexOf(btn as HTMLButtonElement);
      if (idx >= 0) {
        selectedAperture.value = apertureOptions[idx].value;
        nextTick(() => {
          scrollDialToActive(t);
        });
      }
    }
  }
}

// -- Mount ---------------------------------------------------------------

onMounted(() => {
  nextTick(() => {
    scrollDialToActive(shutterTrack.value, 'instant');
    scrollDialToActive(apertureTrack.value, 'instant');
  });
});

// -- Format --------------------------------------------------------------

function formatShutter(seconds: number): string {
  if (seconds < 0.001) {
    return `${(seconds * 1000).toFixed(2)}ms`;
  }
  if (seconds < 1) {
    const denom = Math.round(1 / seconds);
    return `1/${denom}s`;
  }
  if (seconds < 60) {
    return `${seconds % 1 === 0 ? seconds.toFixed(0) : seconds.toFixed(1)}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}
</script>

<template>
  <div class="ee-wrap">
    <!-- Inputs -->
    <div class="ee-panel kt-terminal">
      <div class="ee-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">EXPOSURE EQUIVALENCE</span>
      </div>
      <div class="ee-body">
        <!-- Shutter speed dial -->
        <div class="ee-field-row">
          <span class="ee-field-label">Shutter speed</span>
          <span class="ee-field-hint">drag or click</span>
        </div>
        <div class="ee-shutter-row">
          <div class="ee-dial-wrap">
            <div class="ee-dial-notch" />
            <div
              ref="shutterTrack"
              class="ee-dial-track"
              @pointerdown="shutterPointerDown"
              @pointermove="shutterPointerMove"
              @pointerup="shutterPointerUp"
            >
              <div class="ee-dial-inner">
                <button
                  v-for="opt in shutterOptions"
                  :key="opt.label"
                  class="ee-dial-item"
                  :class="{ 'dial-active': selectedShutter === opt.value }"
                >
                  <span class="ee-dial-tick" />
                  <span class="ee-dial-label">{{ opt.label }}</span>
                </button>
              </div>
            </div>
          </div>
          <input
            v-if="isCustomShutter"
            v-model="customShutter"
            class="ee-num"
            type="number"
            placeholder="sec"
            min="0.0001"
            step="0.001"
          >
        </div>

        <div class="ee-divider" />

        <!-- Aperture dial -->
        <div class="ee-field-row">
          <span class="ee-field-label">Aperture</span>
          <span class="ee-field-hint">drag or click</span>
        </div>
        <div class="ee-dial-wrap">
          <div class="ee-dial-notch" />
          <div
            ref="apertureTrack"
            class="ee-dial-track"
            @pointerdown="aperturePointerDown"
            @pointermove="aperturePointerMove"
            @pointerup="aperturePointerUp"
          >
            <div class="ee-dial-inner">
              <button
                v-for="opt in apertureOptions"
                :key="opt.label"
                class="ee-dial-item"
                :class="{ 'dial-active': selectedAperture === opt.value }"
              >
                <span class="ee-dial-tick" />
                <span class="ee-dial-label">{{ opt.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results table -->
    <div class="ee-panel kt-terminal">
      <div class="ee-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">EQUIVALENT EXPOSURES</span>
      </div>
      <div class="ee-table-wrap">
        <table class="ee-table">
          <thead>
            <tr>
              <th>Aperture</th>
              <th>Shutter speed</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in equivalents"
              :key="row.aperture"
              :class="{ 'ee-row-active': selectedAperture === row.aperture }"
            >
              <td class="ee-td-ap">
                {{ row.label }}
              </td>
              <td class="ee-td-ss" :class="{ 'ee-td-empty': row.shutter === null }">
                {{ row.shutter === null ? '—' : formatShutter(row.shutter) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="ee-footnote">
      <div class="ee-footnote-formulas">
        <span><em>t2</em> = <em>t1</em> &times; <em>N2</em>&sup2; / <em>N1</em>&sup2;</span>
        <span class="ee-fn-sep">/</span>
        <span>ISO-independent at any fixed ISO</span>
        <span class="ee-fn-sep">/</span>
        <span>highlighted row is your base</span>
      </div>
      <div class="ee-footnote-legend">
        <span><em>t1</em> = base shutter speed</span>
        <span><em>t2</em> = equivalent shutter speed</span>
        <span><em>N1</em> = base aperture (f-number)</span>
        <span><em>N2</em> = target aperture (f-number)</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ee-wrap {
  flex: 1 1 760px;
  max-width: 1100px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.ee-panel {
  flex: 1 1 340px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ee-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ee-field-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.ee-field-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ee-field-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.15);
  font-style: italic;
}

.ee-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

/* ── Dial ── */
.ee-dial-wrap {
  position: relative;
}

.ee-dial-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgba(var(--kt-accent-rgb), 0.7);
}

.ee-dial-track {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  touch-action: none;
  cursor: grab;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  user-select: none;
}

.ee-dial-track:active { cursor: grabbing; }
.ee-dial-track::-webkit-scrollbar { display: none; }

.ee-dial-inner {
  display: inline-flex;
  align-items: flex-end;
  padding: 0 50%;
}

.ee-dial-item {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* fixed height so layout never shifts */
  height: 52px;
  justify-content: flex-end;
  padding: 0 10px 8px;
  gap: 5px;
}

.ee-dial-tick {
  display: block;
  width: 1px;
  height: 6px;
  background: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
  transition: height 0.15s, background 0.15s;
  margin-top: -1px;
}

.ee-dial-item.dial-active .ee-dial-tick {
  height: 14px;
  background: var(--kt-accent);
}

.ee-dial-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  /* scale instead of font-size to avoid layout shift */
  transition: transform 0.15s, color 0.15s, font-weight 0.15s;
  transform-origin: center bottom;
  user-select: none;
}

.ee-dial-item.dial-active .ee-dial-label {
  font-weight: 700;
  color: var(--kt-accent);
  transform: scale(1.18);
}

.ee-dial-item:not(.dial-active):hover .ee-dial-label {
  color: rgba(255, 255, 255, 0.6);
}

.ee-dial-item:not(.dial-active):hover .ee-dial-tick {
  background: rgba(255, 255, 255, 0.38);
}

/* Shutter row: dial + optional custom input side-by-side */
.ee-shutter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ee-shutter-row .ee-dial-wrap {
  flex: 1;
  min-width: 0;
}

/* Custom input */
.ee-num {
  flex-shrink: 0;
  width: 90px;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 6px 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  transition: border-color 0.15s;
  appearance: textfield;
  -moz-appearance: textfield;
}

.ee-num::-webkit-inner-spin-button,
.ee-num::-webkit-outer-spin-button { -webkit-appearance: none; }

.ee-num:focus { border-color: rgba(var(--kt-accent-rgb), 0.55); }

/* Results table */
.ee-table-wrap { overflow-x: auto; }

.ee-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
}

.ee-table thead tr { border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.2); }

.ee-table th {
  padding: 8px 16px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ee-table td {
  padding: 9px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.ee-td-ap { color: rgba(255, 255, 255, 0.55); width: 120px; }
.ee-td-ss { color: rgba(255, 255, 255, 0.85); font-weight: 500; }

.ee-td-empty {
  color: rgba(255, 255, 255, 0.2) !important;
  font-weight: 400 !important;
}

.ee-row-active { background: rgba(var(--kt-accent-rgb), 0.07); }
.ee-row-active .ee-td-ap { color: var(--kt-accent); }
.ee-row-active .ee-td-ss { color: var(--kt-accent); font-weight: 700; }

/* Footnote */
.ee-footnote {
  flex: 0 0 100%;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.25);
  line-height: 1.6;
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ee-footnote-formulas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.28);
}

.ee-fn-sep { color: rgba(var(--kt-accent-rgb), 0.25); font-size: 0.75rem; }

.ee-footnote-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: rgba(255, 255, 255, 0.18);
}

.ee-footnote em { font-style: normal; color: rgba(var(--kt-accent-rgb), 0.45); }

/* ── Light mode ── */
html:not(.dark) .ee-field-label { color: rgba(0, 0, 0, 0.4); }
html:not(.dark) .ee-field-hint { color: rgba(0, 0, 0, 0.18); }
html:not(.dark) .ee-divider { background: rgba(0,0,0,0.08); }
html:not(.dark) .ee-dial-track { border-top-color: rgba(0,0,0,0.12); }
html:not(.dark) .ee-dial-notch { border-top-color: rgba(13,112,51,0.7); }
html:not(.dark) .ee-dial-tick { background: rgba(0,0,0,0.15); }
html:not(.dark) .ee-dial-item.dial-active .ee-dial-tick { background: #0d7033; }
html:not(.dark) .ee-dial-label { color: rgba(0,0,0,0.3); }
html:not(.dark) .ee-dial-item.dial-active .ee-dial-label { color: #0d7033; }
html:not(.dark) .ee-dial-item:not(.dial-active):hover .ee-dial-label { color: rgba(0,0,0,0.6); }
html:not(.dark) .ee-dial-item:not(.dial-active):hover .ee-dial-tick { background: rgba(0,0,0,0.35); }
html:not(.dark) .ee-num { background: rgba(0,0,0,0.04); border-color: rgba(13,112,51,0.2); color: rgba(0,0,0,0.8); }
html:not(.dark) .ee-num:focus { border-color: rgba(13,112,51,0.5); }
html:not(.dark) .ee-table th { color: rgba(0,0,0,0.35); }
html:not(.dark) .ee-table td { border-bottom-color: rgba(0,0,0,0.05); }
html:not(.dark) .ee-td-ap { color: rgba(0,0,0,0.45); }
html:not(.dark) .ee-td-ss { color: rgba(0,0,0,0.8); }
html:not(.dark) .ee-td-empty { color: rgba(0,0,0,0.2) !important; }
html:not(.dark) .ee-row-active { background: rgba(13,112,51,0.06); }
html:not(.dark) .ee-row-active .ee-td-ap { color: #0d7033; }
html:not(.dark) .ee-row-active .ee-td-ss { color: #0d7033; }
html:not(.dark) .ee-footnote { color: rgba(0,0,0,0.25); }
html:not(.dark) .ee-footnote-formulas { color: rgba(0,0,0,0.28); }
html:not(.dark) .ee-footnote-legend { color: rgba(0,0,0,0.2); }
html:not(.dark) .ee-fn-sep { color: rgba(13,112,51,0.25); }
html:not(.dark) .ee-footnote em { color: rgba(13,112,51,0.5); }
</style>
