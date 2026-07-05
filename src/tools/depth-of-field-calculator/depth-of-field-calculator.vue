<script setup lang="ts">
const sensorOptions = [
  { short: 'FF', sub: '35mm', value: 0.029 },
  { short: 'APS-C', sub: 'Canon', value: 0.019 },
  { short: 'APS-C', sub: 'Nikon/Sony', value: 0.020 },
  { short: 'MFT', sub: '4/3"', value: 0.015 },
  { short: '1"', sub: '1-inch', value: 0.011 },
  { short: 'MF 645', sub: 'Med. Format', value: 0.047 },
  { short: 'Custom', sub: 'enter CoC', value: -1 },
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

const apertureTrack = ref<HTMLElement | null>(null);

const selectedCoc = ref(0.029);
const customCoc = ref('');
const focalLength = ref(50);
const selectedAperture = ref(8);
const focusDistance = ref(15);
const unit = ref<'m' | 'ft'>('ft');

const apertureDrag = { active: false, startX: 0, startScroll: 0, moved: false };

// -- Derived -------------------------------------------------------------

const isCustomCoc = computed(() => selectedCoc.value === -1);

const activeCoc = computed(() => {
  if (isCustomCoc.value) {
    const v = Number.parseFloat(customCoc.value);
    return Number.isNaN(v) || v <= 0 ? null : v;
  }
  return selectedCoc.value;
});

const focusMeters = computed(() => {
  if (unit.value === 'ft') {
    return focusDistance.value * 0.3048;
  }
  return focusDistance.value;
});

const results = computed(() => {
  const c = activeCoc.value;
  if (c === null || focalLength.value <= 0 || focusDistance.value <= 0) {
    return null;
  }

  const f = focalLength.value;
  const N = selectedAperture.value;
  const d = focusMeters.value * 1000;

  const H = (f ** 2) / (N * c) + f;
  const near = (d * (H - f)) / (H + d - 2 * f);

  let far: number | null;
  if (d >= H) {
    far = null;
  }
  else {
    far = (d * (H - f)) / (H - d);
  }

  const dof = far === null ? null : far - near;

  return {
    hyperfocal: H / 1000,
    near: near / 1000,
    far: far === null ? null : far / 1000,
    dof: dof === null ? null : dof / 1000,
  };
});

// -- Helpers -------------------------------------------------------------

function fmt(meters: number | null): string {
  if (meters === null) {
    return 'infinity';
  }
  if (unit.value === 'ft') {
    const ft = meters / 0.3048;
    if (ft >= 100) {
      return `${ft.toFixed(0)} ft`;
    }
    if (ft >= 10) {
      return `${ft.toFixed(1)} ft`;
    }
    return `${ft.toFixed(2)} ft`;
  }
  if (meters >= 100) {
    return `${meters.toFixed(0)} m`;
  }
  if (meters >= 10) {
    return `${meters.toFixed(1)} m`;
  }
  if (meters >= 1) {
    return `${meters.toFixed(2)} m`;
  }
  return `${(meters * 100).toFixed(1)} cm`;
}

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
  const current = track.scrollLeft;
  const target = current + (activeRect.left - trackRect.left) - (trackRect.width / 2) + (activeRect.width / 2);
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

function onAperturePointerDown(e: PointerEvent) {
  const track = apertureTrack.value;
  if (!track) {
    return;
  }
  apertureDrag.active = true;
  apertureDrag.startX = e.clientX;
  apertureDrag.startScroll = track.scrollLeft;
  apertureDrag.moved = false;
  track.setPointerCapture(e.pointerId);
}

function onAperturePointerMove(e: PointerEvent) {
  if (!apertureDrag.active) {
    return;
  }
  const dx = e.clientX - apertureDrag.startX;
  if (Math.abs(dx) > 4) {
    apertureDrag.moved = true;
  }
  const track = apertureTrack.value;
  if (track) {
    track.scrollLeft = apertureDrag.startScroll - dx;
  }
}

function onAperturePointerUp(e: PointerEvent) {
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

onMounted(() => {
  nextTick(() => {
    scrollDialToActive(apertureTrack.value, 'instant');
  });
});

function toggleUnit() {
  if (unit.value === 'm') {
    focusDistance.value = Number.parseFloat((focusDistance.value / 0.3048).toFixed(2));
    unit.value = 'ft';
  }
  else {
    focusDistance.value = Number.parseFloat((focusDistance.value * 0.3048).toFixed(2));
    unit.value = 'm';
  }
}
</script>

<template>
  <div class="dof-wrap">
    <!-- Inputs -->
    <div class="dof-panel kt-terminal">
      <div class="dof-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">DEPTH OF FIELD CALCULATOR</span>
      </div>
      <div class="dof-body">
        <!-- Sensor format -->
        <div class="dof-field-label">
          Sensor format
        </div>
        <div class="dof-sensor-grid">
          <button
            v-for="opt in sensorOptions"
            :key="opt.value"
            class="dof-sensor-btn"
            :class="{ 'dof-sensor-active': selectedCoc === opt.value }"
            @click="selectedCoc = opt.value"
          >
            <span class="dof-sensor-name">{{ opt.short }}</span>
            <span class="dof-sensor-sub">{{ opt.sub }}</span>
          </button>
        </div>
        <input
          v-if="isCustomCoc"
          v-model="customCoc"
          class="dof-num"
          type="number"
          placeholder="CoC in mm (e.g. 0.029)"
          min="0.001"
          step="0.001"
        >

        <div class="dof-divider" />

        <!-- Focal length -->
        <div class="dof-field-label">
          Focal length (mm)
        </div>
        <input
          v-model.number="focalLength"
          class="dof-num dof-num-wide"
          type="number"
          placeholder="mm"
          min="1"
          step="1"
        >

        <div class="dof-divider" />

        <!-- Aperture -->
        <div class="dof-field-row">
          <span class="dof-field-label">Aperture</span>
          <span class="dof-field-hint">drag or click</span>
        </div>
        <div class="dof-dial-wrap">
          <div class="dof-dial-notch" />
          <div
            ref="apertureTrack"
            class="dof-dial-track"
            @pointerdown="onAperturePointerDown"
            @pointermove="onAperturePointerMove"
            @pointerup="onAperturePointerUp"
            @pointercancel="() => { apertureDrag.active = false; }"
          >
            <div class="dof-dial-inner">
              <button
                v-for="opt in apertureOptions"
                :key="opt.value"
                class="dof-dial-item"
                :class="{ 'dial-active': selectedAperture === opt.value }"
              >
                <span class="dof-dial-tick" />
                <span class="dof-dial-label">{{ opt.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="dof-divider" />

        <!-- Focus distance -->
        <div class="dof-field-label">
          Focus distance
        </div>
        <div class="dof-distance-row">
          <input
            v-model.number="focusDistance"
            class="dof-num dof-num-wide"
            type="number"
            placeholder="distance"
            min="0.1"
            step="0.1"
          >
          <button class="dof-unit-btn" @click="toggleUnit">
            {{ unit }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="results !== null" class="dof-panel kt-terminal">
      <div class="dof-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">RESULTS</span>
      </div>
      <div class="dof-body">
        <div class="dof-hyperfocal-block">
          <div class="dof-hf-label">
            Hyperfocal distance
          </div>
          <div class="dof-hf-value">
            {{ fmt(results.hyperfocal) }}
          </div>
          <div class="dof-hf-hint">
            Focus here for maximum sharpness from half this distance to infinity
          </div>
        </div>

        <div class="dof-divider" />

        <div class="dof-stat-grid">
          <div class="dof-stat">
            <div class="dof-stat-label">
              Near limit
            </div>
            <div class="dof-stat-value">
              {{ fmt(results.near) }}
            </div>
          </div>
          <div class="dof-stat">
            <div class="dof-stat-label">
              Far limit
            </div>
            <div class="dof-stat-value" :class="{ 'dof-infinity': results.far === null }">
              {{ fmt(results.far) }}
            </div>
          </div>
          <div class="dof-stat dof-stat-full">
            <div class="dof-stat-label">
              Total depth of field
            </div>
            <div class="dof-stat-value" :class="{ 'dof-infinity': results.dof === null }">
              {{ results.dof === null ? 'infinity' : fmt(results.dof) }}
            </div>
          </div>
        </div>

        <div v-if="results.far === null" class="dof-alert">
          <span class="dof-alert-icon">&#x2B21;</span>
          Focus distance is at or beyond hyperfocal - far limit extends to infinity.
        </div>
      </div>
    </div>

    <div class="dof-footnote">
      <div class="dof-footnote-formulas">
        <span><em>H</em> = f&sup2; / (N &times; c) + f</span>
        <span class="dof-fn-sep">/</span>
        <span>Near = d(H&minus;f) / (H+d&minus;2f)</span>
        <span class="dof-fn-sep">/</span>
        <span>Far = d(H&minus;f) / (H&minus;d)</span>
      </div>
      <div class="dof-footnote-legend">
        <span><em>H</em> = hyperfocal distance</span>
        <span><em>f</em> = focal length</span>
        <span><em>N</em> = f-number (aperture)</span>
        <span><em>c</em> = circle of confusion</span>
        <span><em>d</em> = focus distance</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dof-wrap {
  flex: 1 1 760px;
  max-width: 1100px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.dof-panel {
  flex: 1 1 340px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.dof-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dof-field-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.dof-field-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dof-field-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.15);
  font-style: italic;
}

.dof-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

/* Sensor format grid */
.dof-sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 6px;
}

.dof-sensor-btn {
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
  transition: border-color 0.12s, background 0.12s;
}

.dof-sensor-btn:hover {
  border-color: rgba(var(--kt-accent-rgb), 0.5);
}

.dof-sensor-btn:hover .dof-sensor-name { color: rgba(255, 255, 255, 0.9); }
.dof-sensor-btn:hover .dof-sensor-sub { color: rgba(255, 255, 255, 0.5); }

.dof-sensor-active {
  background: rgba(var(--kt-accent-rgb), 0.12) !important;
  border-color: rgba(var(--kt-accent-rgb), 0.7) !important;
}

.dof-sensor-active .dof-sensor-name { color: var(--kt-accent) !important; }
.dof-sensor-active .dof-sensor-sub { color: rgba(var(--kt-accent-rgb), 0.65) !important; }

.dof-sensor-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.12s;
}

.dof-sensor-sub {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.28);
  transition: color 0.12s;
  text-align: center;
}

/* Aperture dial */
.dof-dial-wrap { position: relative; }

.dof-dial-notch {
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

.dof-dial-track {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  touch-action: none;
  cursor: grab;
}

.dof-dial-track:active { cursor: grabbing; }
.dof-dial-track::-webkit-scrollbar { display: none; }

.dof-dial-inner {
  display: inline-flex;
  align-items: flex-end;
  padding: 0 50%;
}

.dof-dial-item {
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

.dof-dial-tick {
  display: block;
  width: 1px;
  height: 6px;
  background: rgba(255, 255, 255, 0.18);
  transition: height 0.15s, background 0.15s;
}

.dof-dial-item.dial-active .dof-dial-tick {
  height: 14px;
  background: var(--kt-accent);
}

.dof-dial-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  transition: transform 0.15s, color 0.15s, font-weight 0.15s;
  transform-origin: center bottom;
  user-select: none;
}

.dof-dial-item.dial-active .dof-dial-label {
  font-weight: 700;
  color: var(--kt-accent);
  transform: scale(1.18);
}

.dof-dial-item:not(.dial-active):hover .dof-dial-label { color: rgba(255, 255, 255, 0.65); }
.dof-dial-item:not(.dial-active):hover .dof-dial-tick { background: rgba(255, 255, 255, 0.4); }

.dof-num {
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

.dof-num-wide { width: 200px; }

.dof-num::-webkit-inner-spin-button,
.dof-num::-webkit-outer-spin-button { -webkit-appearance: none; }

.dof-num:focus { border-color: rgba(var(--kt-accent-rgb), 0.55); }

.dof-distance-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dof-unit-btn {
  background: transparent;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.25);
  border-radius: 4px;
  padding: 6px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(var(--kt-accent-rgb), 0.7);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  text-transform: uppercase;
}

.dof-unit-btn:hover {
  border-color: rgba(var(--kt-accent-rgb), 0.6);
  color: rgba(var(--kt-accent-rgb), 1);
}

.dof-hyperfocal-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dof-hf-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dof-hf-value {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--kt-accent);
  line-height: 1;
}

.dof-hf-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  color: rgba(var(--kt-accent-rgb), 0.45);
  line-height: 1.5;
}

.dof-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dof-stat-full { grid-column: 1 / -1; }

.dof-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dof-stat-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dof-stat-value {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.dof-infinity { color: var(--kt-accent); }

.dof-alert {
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

.dof-alert-icon { flex-shrink: 0; opacity: 0.7; }

.dof-footnote {
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

.dof-footnote-formulas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
}

.dof-fn-sep {
  color: rgba(var(--kt-accent-rgb), 0.5);
  font-size: 0.85rem;
}

.dof-footnote-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: rgba(255, 255, 255, 0.6);
}

.dof-footnote em {
  font-style: normal;
  color: rgba(var(--kt-accent-rgb), 0.9);
}

/* -- Light mode -- */
html:not(.dark) .dof-field-label { color: rgba(0, 0, 0, 0.4); }
html:not(.dark) .dof-field-hint { color: rgba(0, 0, 0, 0.18); }
html:not(.dark) .dof-hf-label { color: rgba(0, 0, 0, 0.4); }
html:not(.dark) .dof-stat-label { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .dof-divider { background: rgba(0,0,0,0.08); }
html:not(.dark) .dof-sensor-btn { border-color: rgba(13,112,51,0.18); }
html:not(.dark) .dof-sensor-btn:hover { border-color: rgba(13,112,51,0.5); }
html:not(.dark) .dof-sensor-btn:hover .dof-sensor-name { color: rgba(0,0,0,0.85); }
html:not(.dark) .dof-sensor-btn:hover .dof-sensor-sub { color: rgba(0,0,0,0.5); }
html:not(.dark) .dof-sensor-active { background: rgba(13,112,51,0.08) !important; border-color: rgba(13,112,51,0.7) !important; }
html:not(.dark) .dof-sensor-active .dof-sensor-name { color: #0d7033 !important; }
html:not(.dark) .dof-sensor-active .dof-sensor-sub { color: rgba(13,112,51,0.6) !important; }
html:not(.dark) .dof-sensor-name { color: rgba(0,0,0,0.6); }
html:not(.dark) .dof-sensor-sub { color: rgba(0,0,0,0.3); }
html:not(.dark) .dof-dial-track { border-top-color: rgba(0,0,0,0.12); }
html:not(.dark) .dof-dial-notch { border-top-color: rgba(13,112,51,0.7); }
html:not(.dark) .dof-dial-tick { background: rgba(0,0,0,0.15); }
html:not(.dark) .dof-dial-item.dial-active .dof-dial-tick { background: #0d7033; }
html:not(.dark) .dof-dial-label { color: rgba(0,0,0,0.3); }
html:not(.dark) .dof-dial-item.dial-active .dof-dial-label { color: #0d7033; }
html:not(.dark) .dof-dial-item:not(.dial-active):hover .dof-dial-label { color: rgba(0,0,0,0.6); }
html:not(.dark) .dof-dial-item:not(.dial-active):hover .dof-dial-tick { background: rgba(0,0,0,0.35); }
html:not(.dark) .dof-num { background: rgba(0,0,0,0.04); border-color: rgba(13,112,51,0.2); color: rgba(0,0,0,0.8); }
html:not(.dark) .dof-num:focus { border-color: rgba(13,112,51,0.5); }
html:not(.dark) .dof-hf-value { color: #0d7033; }
html:not(.dark) .dof-hf-hint { color: rgba(13,112,51,0.5); }
html:not(.dark) .dof-stat-value { color: rgba(0,0,0,0.75); }
html:not(.dark) .dof-infinity { color: #0d7033; }
html:not(.dark) .dof-unit-btn { border-color: rgba(13,112,51,0.25); color: rgba(13,112,51,0.7); }
html:not(.dark) .dof-unit-btn:hover { border-color: rgba(13,112,51,0.6); color: #0d7033; }
html:not(.dark) .dof-footnote { color: rgba(0,0,0,0.6); }
html:not(.dark) .dof-footnote-formulas { color: rgba(0,0,0,0.6); }
html:not(.dark) .dof-footnote-legend { color: rgba(0,0,0,0.6); }
html:not(.dark) .dof-fn-sep { color: rgba(13,112,51,0.5); }
html:not(.dark) .dof-footnote em { color: rgba(13,112,51,0.6); }
</style>
