<script setup lang="ts">
const filterOptions = [
  { nd: 'ND2', stops: 1, value: 1 },
  { nd: 'ND4', stops: 2, value: 2 },
  { nd: 'ND8', stops: 3, value: 3 },
  { nd: 'ND16', stops: 4, value: 4 },
  { nd: 'ND32', stops: 5, value: 5 },
  { nd: 'ND64', stops: 6, value: 6 },
  { nd: 'ND128', stops: 7, value: 7 },
  { nd: 'ND256', stops: 8, value: 8 },
  { nd: 'ND512', stops: 9, value: 9 },
  { nd: 'ND1000', stops: 10, value: 10 },
  { nd: 'ND4000', stops: 12, value: 12 },
  { nd: 'ND32000', stops: 15, value: 15 },
  { nd: 'Custom', stops: null, value: -1 },
];

const speedOptions = [
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

// -- State ---------------------------------------------------------------

const selectedFilterStops = ref(10);
const customStops = ref('');
const selectedSpeedValue = ref(1 / 125);
const customSpeed = ref('');
const copied = ref(false);

const speedTrack = ref<HTMLElement | null>(null);

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

// -- Speed drag ----------------------------------------------------------

const speedDrag = { active: false, startX: 0, startScroll: 0, moved: false };

function speedPointerDown(e: PointerEvent) {
  const t = speedTrack.value;
  if (!t) {
    return;
  }
  speedDrag.active = true;
  speedDrag.moved = false;
  speedDrag.startX = e.clientX;
  speedDrag.startScroll = t.scrollLeft;
  t.setPointerCapture(e.pointerId);
}

function speedPointerMove(e: PointerEvent) {
  if (!speedDrag.active) {
    return;
  }
  const t = speedTrack.value;
  if (!t) {
    return;
  }
  const dx = e.clientX - speedDrag.startX;
  if (Math.abs(dx) > 4) {
    speedDrag.moved = true;
  }
  t.scrollLeft = speedDrag.startScroll - dx;
}

function speedPointerUp(e: PointerEvent) {
  if (!speedDrag.active) {
    return;
  }
  speedDrag.active = false;
  const t = speedTrack.value;
  if (!t) {
    return;
  }
  if (speedDrag.moved) {
    snapToNearest(t, speedOptions, (v) => {
      selectedSpeedValue.value = v;
    });
  }
  else {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const btn = el?.closest('button');
    if (btn) {
      const idx = Array.from(t.querySelectorAll('button')).indexOf(btn as HTMLButtonElement);
      if (idx >= 0) {
        selectedSpeedValue.value = speedOptions[idx].value;
        nextTick(() => {
          scrollDialToActive(t);
        });
      }
    }
  }
}

onMounted(() => {
  nextTick(() => {
    scrollDialToActive(speedTrack.value, 'instant');
  });
});

// -- Derived -------------------------------------------------------------

const isCustomFilter = computed(() => selectedFilterStops.value === -1);
const isCustomSpeed = computed(() => selectedSpeedValue.value === -1);

const activeStops = computed(() => {
  if (isCustomFilter.value) {
    const v = Number.parseFloat(customStops.value);
    return Number.isNaN(v) || v <= 0 ? null : v;
  }
  return selectedFilterStops.value;
});

const baseSeconds = computed(() => {
  if (isCustomSpeed.value) {
    const v = Number.parseFloat(customSpeed.value);
    return Number.isNaN(v) || v <= 0 ? null : v;
  }
  return selectedSpeedValue.value;
});

const corrected = computed(() => {
  const stops = activeStops.value;
  const base = baseSeconds.value;
  if (stops === null || base === null) {
    return null;
  }
  return base * (2 ** stops);
});

// -- Helpers -------------------------------------------------------------

function formatTime(seconds: number): string {
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

async function copy(val: string) {
  await navigator.clipboard.writeText(val);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="nd-wrap">
    <!-- Inputs -->
    <div class="nd-panel kt-terminal">
      <div class="nd-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">ND FILTER CALCULATOR</span>
      </div>
      <div class="nd-body">
        <!-- Base shutter speed -->
        <div class="nd-field-row">
          <span class="nd-field-label">Base shutter speed (without filter)</span>
          <span class="nd-field-hint">drag or click</span>
        </div>
        <div class="nd-speed-row">
          <div class="nd-dial-wrap">
            <div class="nd-dial-notch" />
            <div
              ref="speedTrack"
              class="nd-dial-track"
              @pointerdown="speedPointerDown"
              @pointermove="speedPointerMove"
              @pointerup="speedPointerUp"
              @pointercancel="() => { speedDrag.active = false; }"
            >
              <div class="nd-dial-inner">
                <button
                  v-for="opt in speedOptions"
                  :key="opt.label"
                  class="nd-dial-item"
                  :class="{ 'dial-active': selectedSpeedValue === opt.value }"
                >
                  <span class="nd-dial-tick" />
                  <span class="nd-dial-label">{{ opt.label }}</span>
                </button>
              </div>
            </div>
          </div>
          <input
            v-if="isCustomSpeed"
            v-model="customSpeed"
            class="nd-num nd-num-inline"
            type="number"
            placeholder="sec"
            min="0.0001"
            step="0.001"
          >
        </div>

        <div class="nd-divider" />

        <!-- ND filter -->
        <div class="nd-field-label">
          ND filter
        </div>
        <div class="nd-filter-grid">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            class="nd-filter-btn"
            :class="{ 'nd-filter-active': selectedFilterStops === opt.value }"
            @click="selectedFilterStops = opt.value"
          >
            <span class="nd-filter-name">{{ opt.nd }}</span>
            <span v-if="opt.stops !== null" class="nd-filter-stops">{{ opt.stops }} stop{{ opt.stops === 1 ? '' : 's' }}</span>
            <span v-else class="nd-filter-stops">enter stops</span>
          </button>
        </div>
        <input
          v-if="isCustomFilter"
          v-model="customStops"
          class="nd-num"
          type="number"
          placeholder="stops"
          min="0.5"
          step="0.5"
        >
      </div>
    </div>

    <!-- Result -->
    <div class="nd-panel kt-terminal">
      <div class="nd-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">CORRECTED EXPOSURE</span>
      </div>
      <div class="nd-body">
        <div class="nd-result-row">
          <div class="nd-result-time" :class="{ 'nd-result-empty': corrected === null }">
            {{ corrected === null ? '—' : formatTime(corrected) }}
          </div>
          <div v-if="corrected !== null" class="nd-result-sub">
            {{ corrected.toFixed(2) }}s
          </div>
          <button
            v-if="corrected !== null"
            class="nd-copy-btn"
            :class="{ 'nd-copy-done': copied }"
            @click="copy(corrected.toFixed(2))"
          >
            <span v-if="copied">copied</span>
            <span v-else>copy seconds</span>
          </button>
        </div>
        <div v-if="corrected !== null && corrected > 30" class="nd-alert">
          <span class="nd-alert-icon">&#x2B21;</span>
          Long exposure - consider using Bulb mode.
        </div>
      </div>
    </div>

    <div class="nd-footnote">
      <div class="nd-footnote-formulas">
        <span><em>t2</em> = <em>t1</em> &times; 2<sup><em>stops</em></sup></span>
        <span class="nd-fn-sep">/</span>
        <span>stacking filters: add their stops</span>
      </div>
      <div class="nd-footnote-legend">
        <span><em>t1</em> = base shutter speed (no filter)</span>
        <span><em>t2</em> = corrected shutter speed</span>
        <span><em>stops</em> = ND filter strength</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nd-wrap {
  flex: 1 1 760px;
  max-width: 1100px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.nd-panel {
  flex: 1 1 340px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nd-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nd-field-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.nd-field-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.nd-field-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.15);
  font-style: italic;
}

.nd-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

/* Shutter speed dial */
.nd-speed-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nd-speed-row .nd-dial-wrap {
  flex: 1;
  min-width: 0;
}

.nd-dial-wrap { position: relative; }

.nd-dial-notch {
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

.nd-dial-track {
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

.nd-dial-track:active { cursor: grabbing; }
.nd-dial-track::-webkit-scrollbar { display: none; }

.nd-dial-inner {
  display: inline-flex;
  align-items: flex-end;
  padding: 0 50%;
}

.nd-dial-item {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 52px;
  justify-content: flex-end;
  padding: 0 10px 8px;
  gap: 5px;
}

.nd-dial-tick {
  display: block;
  width: 1px;
  height: 6px;
  background: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
  transition: height 0.15s, background 0.15s;
}

.nd-dial-item.dial-active .nd-dial-tick {
  height: 14px;
  background: var(--kt-accent);
}

.nd-dial-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  transition: transform 0.15s, color 0.15s, font-weight 0.15s;
  transform-origin: center bottom;
  user-select: none;
}

.nd-dial-item.dial-active .nd-dial-label {
  font-weight: 700;
  color: var(--kt-accent);
  transform: scale(1.18);
}

.nd-dial-item:not(.dial-active):hover .nd-dial-label { color: rgba(255, 255, 255, 0.6); }
.nd-dial-item:not(.dial-active):hover .nd-dial-tick { background: rgba(255, 255, 255, 0.38); }

/* ND filter button grid */
.nd-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
}

.nd-filter-btn {
  background: transparent;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.18);
  border-radius: 5px;
  padding: 8px 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}

.nd-filter-btn:hover {
  border-color: rgba(var(--kt-accent-rgb), 0.5);
}

.nd-filter-btn:hover .nd-filter-name {
  color: rgba(255, 255, 255, 0.9);
}

.nd-filter-btn:hover .nd-filter-stops {
  color: rgba(255, 255, 255, 0.5);
}

.nd-filter-active {
  background: rgba(var(--kt-accent-rgb), 0.12) !important;
  border-color: rgba(var(--kt-accent-rgb), 0.7) !important;
}

.nd-filter-active .nd-filter-name {
  color: var(--kt-accent) !important;
}

.nd-filter-active .nd-filter-stops {
  color: rgba(var(--kt-accent-rgb), 0.65) !important;
}

.nd-filter-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.12s;
}

.nd-filter-stops {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.28);
  transition: color 0.12s;
}

.nd-num {
  width: 140px;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  transition: border-color 0.15s;
  appearance: textfield;
  -moz-appearance: textfield;
}

.nd-num-inline {
  flex-shrink: 0;
  width: 90px;
  padding: 6px 8px;
  font-size: 0.85rem;
}

.nd-num::-webkit-inner-spin-button,
.nd-num::-webkit-outer-spin-button { -webkit-appearance: none; }

.nd-num:focus { border-color: rgba(var(--kt-accent-rgb), 0.55); }

.nd-result-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.nd-result-time {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--kt-accent);
  line-height: 1;
}

.nd-result-empty {
  color: rgba(255, 255, 255, 0.15) !important;
  font-weight: 400 !important;
}

.nd-result-sub {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(var(--kt-accent-rgb), 0.55);
}

.nd-copy-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.25);
  border-radius: 4px;
  padding: 4px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(var(--kt-accent-rgb), 0.55);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
}

.nd-copy-btn:hover { border-color: rgba(var(--kt-accent-rgb), 0.55); color: rgba(var(--kt-accent-rgb), 0.9); }
.nd-copy-done { border-color: rgba(var(--kt-accent-rgb), 0.55) !important; color: rgba(var(--kt-accent-rgb), 0.9) !important; }

.nd-alert {
  display: flex;
  gap: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(var(--kt-accent-rgb), 0.75);
  background: rgba(var(--kt-accent-rgb), 0.06);
  border-left: 3px solid rgba(var(--kt-accent-rgb), 0.4);
  padding: 8px 10px;
  border-radius: 4px;
}

.nd-alert-icon { flex-shrink: 0; opacity: 0.7; }

/* Footnote */
.nd-footnote {
  flex: 0 0 100%;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nd-footnote-formulas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.65);
}

.nd-fn-sep {
  color: rgba(var(--kt-accent-rgb), 0.55);
  font-size: 0.85rem;
}

.nd-footnote-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: rgba(255, 255, 255, 0.55);
}

.nd-footnote em {
  font-style: normal;
  color: rgba(var(--kt-accent-rgb), 0.9);
}

/* -- Light mode -- */
html:not(.dark) .nd-field-label { color: rgba(0, 0, 0, 0.4); }
html:not(.dark) .nd-field-hint { color: rgba(0, 0, 0, 0.18); }
html:not(.dark) .nd-divider { background: rgba(0,0,0,0.08); }
html:not(.dark) .nd-dial-track { border-top-color: rgba(0,0,0,0.12); }
html:not(.dark) .nd-dial-notch { border-top-color: rgba(13,112,51,0.7); }
html:not(.dark) .nd-dial-tick { background: rgba(0,0,0,0.15); }
html:not(.dark) .nd-dial-item.dial-active .nd-dial-tick { background: #0d7033; }
html:not(.dark) .nd-dial-label { color: rgba(0,0,0,0.3); }
html:not(.dark) .nd-dial-item.dial-active .nd-dial-label { color: #0d7033; }
html:not(.dark) .nd-dial-item:not(.dial-active):hover .nd-dial-label { color: rgba(0,0,0,0.6); }
html:not(.dark) .nd-dial-item:not(.dial-active):hover .nd-dial-tick { background: rgba(0,0,0,0.35); }
html:not(.dark) .nd-filter-btn { border-color: rgba(13,112,51,0.18); }
html:not(.dark) .nd-filter-btn:hover { border-color: rgba(13,112,51,0.5); }
html:not(.dark) .nd-filter-active { background: rgba(13,112,51,0.08) !important; border-color: rgba(13,112,51,0.7) !important; }
html:not(.dark) .nd-filter-name { color: rgba(0,0,0,0.6); }
html:not(.dark) .nd-filter-stops { color: rgba(0,0,0,0.3); }
html:not(.dark) .nd-filter-active .nd-filter-name { color: #0d7033 !important; }
html:not(.dark) .nd-filter-active .nd-filter-stops { color: rgba(13,112,51,0.6) !important; }
html:not(.dark) .nd-num { background: rgba(0,0,0,0.04); border-color: rgba(13,112,51,0.2); color: rgba(0,0,0,0.8); }
html:not(.dark) .nd-num:focus { border-color: rgba(13,112,51,0.5); }
html:not(.dark) .nd-result-time { color: #0d7033; }
html:not(.dark) .nd-result-empty { color: rgba(0,0,0,0.15) !important; }
html:not(.dark) .nd-result-sub { color: rgba(13,112,51,0.55); }
html:not(.dark) .nd-copy-btn { border-color: rgba(13,112,51,0.25); color: rgba(13,112,51,0.55); }
html:not(.dark) .nd-copy-btn:hover, html:not(.dark) .nd-copy-done { border-color: rgba(13,112,51,0.55) !important; color: rgba(13,112,51,0.9) !important; }
html:not(.dark) .nd-footnote { color: rgba(0,0,0,0.25); }
html:not(.dark) .nd-footnote-formulas { color: rgba(0,0,0,0.6); }
html:not(.dark) .nd-footnote-legend { color: rgba(0,0,0,0.5); }
html:not(.dark) .nd-fn-sep { color: rgba(13,112,51,0.25); }
html:not(.dark) .nd-footnote em { color: rgba(13,112,51,0.5); }
</style>
