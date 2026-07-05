<script setup lang="ts">
import type { FilmStock } from './reciprocity.data';
import { filmStocks } from './reciprocity.data';
import KtSelect from '@/components/KtSelect.vue';

// ── State ──────────────────────────────────────────────────────────────────────

const selectedId = ref('ilford-hp5');
const meteredInput = ref('');
const copied = ref(false);

// ── Derived ────────────────────────────────────────────────────────────────────

const selected = computed<FilmStock | undefined>(() =>
  filmStocks.find(s => s.id === selectedId.value),
);

const meteredSeconds = computed(() => {
  const v = Number.parseFloat(meteredInput.value);
  return Number.isNaN(v) || v <= 0 ? null : v;
});

const selectOptions = computed(() => {
  const map = new Map<string, FilmStock[]>();
  for (const s of filmStocks) {
    if (!map.has(s.manufacturer)) {
      map.set(s.manufacturer, []);
    }
    map.get(s.manufacturer)!.push(s);
  }
  return Array.from(map.entries()).map(([manufacturer, stocks]) => ({
    type: 'group',
    label: manufacturer,
    key: manufacturer,
    children: stocks.map(s => ({ label: `${s.name} (ISO ${s.iso})`, value: s.id })),
  }));
});

const result = computed(() => {
  const stock = selected.value;
  const t = meteredSeconds.value;
  if (!stock || t === null) {
    return null;
  }

  const noFailure = stock.noFailureUpTo != null && t <= stock.noFailureUpTo;
  const adjusted = noFailure ? t : t ** stock.exponent;
  const stops = noFailure ? 0 : Math.log2(adjusted / t);

  return { adjusted, stops, noFailure };
});

// Development adjustment — B&W only
const devRecommendation = computed(() => {
  const stock = selected.value;
  const r = result.value;
  if (!stock || !r || stock.type !== 'bw' || r.noFailure) {
    return null;
  }
  const t = r.adjusted;
  if (t < 10) {
    return null;
  }
  if (t < 30) {
    return 'Consider reducing development ~10% to compensate for increased shadow density.';
  }
  if (t < 120) {
    return 'Reduce development 10–15% recommended.';
  }
  if (t < 300) {
    return 'Reduce development 15–20% recommended.';
  }
  return 'Reduce development 20–30% recommended for very long exposures.';
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  if (seconds < 60) {
    return `${seconds % 1 === 0 ? seconds.toFixed(0) : seconds.toFixed(1)}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function typeLabel(type: FilmStock['type']): string {
  return { 'bw': 'B&W', 'color-neg': 'Color Negative', 'slide': 'Slide / E6' }[type];
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
  <div class="rc-wrap">
    <!-- Film stock + exposure input -->
    <div class="rc-panel kt-terminal">
      <div class="rc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">RECIPROCITY CALCULATOR</span>
      </div>
      <div class="rc-body">
        <!-- Stock selector -->
        <div class="rc-field-label">
          Film stock
        </div>
        <KtSelect v-model:value="selectedId" :options="selectOptions" />
        <div v-if="selected" class="rc-meta-row">
          <span class="rc-badge" :class="`rc-badge-${selected.type}`">
            {{ typeLabel(selected.type) }}
          </span>
          <span v-if="selected.noFailureUpTo" class="rc-meta-tag">
            No failure up to {{ selected.noFailureUpTo }}s
          </span>
          <span class="rc-source">
            {{ selected.sourceReliability === 'manufacturer' ? 'Manufacturer data' : 'Community data' }}
          </span>
        </div>

        <div class="rc-divider" />

        <!-- Exposure input -->
        <div class="rc-field-label">
          Metered exposure
        </div>
        <div class="rc-row">
          <input
            v-model="meteredInput"
            class="rc-num"
            type="number"
            placeholder="0"
            min="0.1"
            step="0.1"
          >
          <span class="rc-unit">seconds</span>
          <span v-if="meteredSeconds && meteredSeconds >= 60" class="rc-formatted">
            ({{ formatTime(meteredSeconds) }})
          </span>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div class="rc-panel kt-terminal">
      <div class="rc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">CORRECTED EXPOSURE</span>
      </div>
      <div class="rc-body">
        <template v-if="result">
          <div v-if="result.noFailure" class="rc-no-failure">
            No correction needed — this stock has no reciprocity failure at this exposure length.
          </div>
          <template v-else>
            <div class="rc-result-row">
              <div class="rc-result-time">
                {{ formatTime(result.adjusted) }}
              </div>
              <div class="rc-result-sub">
                {{ result.adjusted.toFixed(1) }}s &nbsp;|&nbsp; +{{ result.stops.toFixed(2) }} stops
              </div>
              <button
                class="rc-copy-btn"
                :class="{ 'rc-copy-done': copied }"
                @click="copy(result.adjusted.toFixed(1))"
              >
                <span v-if="copied">✓ copied</span>
                <span v-else>copy seconds</span>
              </button>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="rc-result-row">
            <div class="rc-result-time rc-result-empty">
              —
            </div>
          </div>
        </template>

        <!-- Color shift warning (color films, metered > 1s) -->
        <div
          v-if="result && selected?.colorShift && meteredSeconds && meteredSeconds > 1 && !result.noFailure"
          class="rc-alert rc-alert-warn"
        >
          <span class="rc-alert-icon">⚠</span>
          <span>
            Color film: expect a color shift at this exposure length.
            <template v-if="selected.type === 'slide'">
              Slide film is difficult to correct in post — CC filtration in-camera is recommended.
            </template>
            <template v-else>
              Color negative has more latitude; correction is possible in printing or scanning.
            </template>
          </span>
        </div>

        <!-- Development adjustment -->
        <div v-if="devRecommendation" class="rc-alert rc-alert-info">
          <span class="rc-alert-icon">⬡</span>
          <span>{{ devRecommendation }}</span>
        </div>

        <!-- Stock notes -->
        <div v-if="selected?.notes" class="rc-notes">
          {{ selected.notes }}
        </div>
      </div>
    </div>

    <!-- Formula footnote -->
    <div class="rc-footnote">
      Correction uses the Schwarzschild power law: t<sub>adjusted</sub> = t<sub>metered</sub><sup>p</sup>.
      Community-sourced exponents are approximations — verify against manufacturer data sheets when precision matters.
    </div>
  </div>
</template>

<style scoped>
.rc-wrap {
  flex: 1 1 480px;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Panel ── */
.rc-panel {
  display: flex;
  flex-direction: column;
}

.rc-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rc-row {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* ── Field label ── */
.rc-field-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.rc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

/* ── Select ── */
.rc-select {
  width: 100%;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.rc-select:focus {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

/* ── Meta row ── */
.rc-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rc-badge {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.rc-badge-bw {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.rc-badge-color-neg {
  background: rgba(255, 160, 50, 0.1);
  color: rgba(255, 160, 50, 0.85);
  border: 1px solid rgba(255, 160, 50, 0.25);
}

.rc-badge-slide {
  background: rgba(100, 160, 255, 0.1);
  color: rgba(100, 160, 255, 0.85);
  border: 1px solid rgba(100, 160, 255, 0.25);
}

.rc-meta-tag {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(var(--kt-accent-rgb), 0.8);
}

.rc-source {
  margin-left: auto;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.68rem;
  opacity: 0.45;
}

/* ── Number input ── */
.rc-num {
  width: 120px;
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

.rc-num::-webkit-inner-spin-button,
.rc-num::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.rc-num::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.rc-num:focus {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.rc-unit {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 8px;
}

.rc-formatted {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}

/* ── Result ── */
.rc-result-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.rc-result-time {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--kt-accent);
  line-height: 1;
}

.rc-result-empty {
  color: rgba(255, 255, 255, 0.15) !important;
  font-weight: 400 !important;
}

.rc-result-sub {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(var(--kt-accent-rgb), 0.55);
}

.rc-copy-btn {
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

.rc-copy-btn:hover {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
  color: rgba(var(--kt-accent-rgb), 0.9);
}

.rc-copy-done {
  border-color: rgba(var(--kt-accent-rgb), 0.55) !important;
  color: rgba(var(--kt-accent-rgb), 0.9) !important;
}

.rc-no-failure {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(var(--kt-accent-rgb), 0.8);
}

/* ── Alerts ── */
.rc-alert {
  display: flex;
  gap: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 4px;
  border-left: 3px solid transparent;
}

.rc-alert-warn {
  background: rgba(255, 160, 50, 0.07);
  border-left-color: rgba(255, 160, 50, 0.5);
  color: rgba(255, 160, 50, 0.85);
}

.rc-alert-info {
  background: rgba(var(--kt-accent-rgb), 0.06);
  border-left-color: rgba(var(--kt-accent-rgb), 0.4);
  color: rgba(var(--kt-accent-rgb), 0.75);
}

.rc-alert-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

/* ── Notes ── */
.rc-notes {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* ── Footnote ── */
.rc-footnote {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  padding: 0 2px;
}

/* ── Light mode ── */
html:not(.dark) .rc-select {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(13, 112, 51, 0.2);
  color: rgba(0, 0, 0, 0.8);
}

html:not(.dark) .rc-select:focus { border-color: rgba(13, 112, 51, 0.5); }

html:not(.dark) .rc-panel-bar { color: rgba(0, 0, 0, 0.70) !important; }
html:not(.dark) .rc-panel-bar .kt-terminal-bar-title { color: rgba(0, 0, 0, 0.70) !important; }

html:not(.dark) .rc-badge-bw {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.55);
  border-color: rgba(0, 0, 0, 0.15);
}

html:not(.dark) .rc-unit,
html:not(.dark) .rc-formatted { color: rgba(0, 0, 0, 0.35); }

html:not(.dark) .rc-num {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(13, 112, 51, 0.2);
  color: rgba(0, 0, 0, 0.8);
}

html:not(.dark) .rc-num:focus { border-color: rgba(13, 112, 51, 0.5); }

html:not(.dark) .rc-result-time { color: #0d7033; }
html:not(.dark) .rc-result-empty { color: rgba(0, 0, 0, 0.15) !important; }
html:not(.dark) .rc-result-sub { color: rgba(13, 112, 51, 0.55); }

html:not(.dark) .rc-copy-btn {
  border-color: rgba(13, 112, 51, 0.25);
  color: rgba(13, 112, 51, 0.55);
}

html:not(.dark) .rc-copy-btn:hover,
html:not(.dark) .rc-copy-done {
  border-color: rgba(13, 112, 51, 0.55) !important;
  color: rgba(13, 112, 51, 0.9) !important;
}

html:not(.dark) .rc-no-failure { color: #0d7033; }

html:not(.dark) .rc-alert-warn {
  background: rgba(180, 100, 0, 0.07);
  color: rgba(160, 80, 0, 0.9);
}

html:not(.dark) .rc-alert-info {
  background: rgba(13, 112, 51, 0.06);
  color: rgba(13, 112, 51, 0.8);
}

html:not(.dark) .rc-notes { color: rgba(0, 0, 0, 0.3); }
html:not(.dark) .rc-footnote { color: rgba(0, 0, 0, 0.6); }
html:not(.dark) .rc-source { color: rgba(0, 0, 0, 0.35); }
</style>
