<script setup lang="ts">
import type { DeveloperEntry, FilmEntry } from './dev-calculator.data';
import { computed, onUnmounted, ref, watch } from 'vue';
import {
  calcDilutionVolumes,
  developers,
  filmStocks,
  formatTime,
  pushPullAdjust,
  pushPullStops,
  tankVolumes,
  tempAdjust,
  tempMax,
  tempMin,
} from './dev-calculator.data';

// ---- State ----
const selectedDevId = ref<string>(developers[0].id);
const selectedDilutionIdx = ref<number>(developers[0].defaultDilution);
const selectedFilmName = ref<string>(filmStocks[0].name);
const customBaseSeconds = ref<number | null>(null);
const tempC = ref<number>(20);
const tempUnit = ref<'C' | 'F'>('C');
const pushPull = ref<number>(0);
const tankVolume = ref<number>(500);
const customTankVolume = ref<number | null>(null);

// ---- Unit conversion ----
function cToF(c: number) {
  return c * 9 / 5 + 32;
}
function fToC(f: number) {
  return (f - 32) * 5 / 9;
}

const tempSliderMin = computed(() => tempUnit.value === 'F' ? Math.round(cToF(tempMin)) : tempMin);
const tempSliderMax = computed(() => tempUnit.value === 'F' ? Math.round(cToF(tempMax)) : tempMax);
const tempSliderStep = computed(() => tempUnit.value === 'F' ? 1 : 0.5);

// Two-way binding: slider works in display units, internal state always °C
const tempDisplay = computed({
  get: () => tempUnit.value === 'F' ? Math.round(cToF(tempC.value) * 10) / 10 : tempC.value,
  set: (val: number) => {
    tempC.value = tempUnit.value === 'F' ? fToC(val) : val;
  },
});

// Format a °C value for display in the current unit
function showTemp(c: number) {
  if (tempUnit.value === 'F') {
    return `${Math.round(cToF(c))}°F`;
  }
  return `${c}°C`;
}

// ---- Derived ----
const developer = computed<DeveloperEntry>(() => developers.find(d => d.id === selectedDevId.value)!);
const dilution = computed(() => developer.value.dilutions[selectedDilutionIdx.value]);
const film = computed<FilmEntry>(() => filmStocks.find(f => f.name === selectedFilmName.value)!);

const filmBaseTemp = computed<number>(() => film.value.baseTemp ?? 20);
const isColorProcess = computed(() => film.value.process === 'C41' || film.value.process === 'E6');

const dbBaseSeconds = computed<number | null>(() => {
  const t = film.value.times[selectedDevId.value];
  return t ?? null;
});

const baseSeconds = computed<number | null>(() => {
  if (customBaseSeconds.value !== null && customBaseSeconds.value > 0) {
    return customBaseSeconds.value;
  }
  return dbBaseSeconds.value;
});

const effectiveTankVol = computed<number>(() => {
  return customTankVolume.value && customTankVolume.value > 0 ? customTankVolume.value : tankVolume.value;
});

const tempAdjustedSeconds = computed<number | null>(() => {
  if (baseSeconds.value === null) {
    return null;
  }
  return tempAdjust(baseSeconds.value, tempC.value, filmBaseTemp.value);
});

const finalSeconds = computed<number | null>(() => {
  if (tempAdjustedSeconds.value === null) {
    return null;
  }
  return pushPullAdjust(tempAdjustedSeconds.value, pushPull.value);
});

const dilutionVolumes = computed(() => calcDilutionVolumes(effectiveTankVol.value, dilution.value));

const hasData = computed(() => dbBaseSeconds.value !== null);
const isCustomBase = computed(() => customBaseSeconds.value !== null && customBaseSeconds.value > 0);

// Reset custom base when film/dev changes
watch([selectedDevId, selectedFilmName], () => {
  customBaseSeconds.value = null;
});

// Reset dilution to default when developer changes; auto-switch film if current has no data
watch(selectedDevId, (newId) => {
  const dev = developers.find(d => d.id === newId)!;
  selectedDilutionIdx.value = dev.defaultDilution;
  if (film.value.times[newId] === undefined) {
    const first = filmStocks.find(f => f.times[newId] !== undefined);
    if (first) {
      selectedFilmName.value = first.name;
    }
  }
});

// Snap temperature and auto-select developer when switching film type
watch(film, (newFilm) => {
  const base = newFilm.baseTemp ?? 20;
  tempC.value = base;
  if (newFilm.process === 'C41') {
    selectedDevId.value = 'c41';
  }
  else if (newFilm.process === 'E6') {
    selectedDevId.value = 'e6';
  }
});

// n-select options — group by whether the film has data for the current developer
const filmOptions = computed(() => {
  const withData = filmStocks
    .filter(f => f.times[selectedDevId.value] !== undefined)
    .map(f => ({ label: f.name, value: f.name }));
  const withoutData = filmStocks
    .filter(f => f.times[selectedDevId.value] === undefined)
    .map(f => ({ label: f.name, value: f.name }));
  const groups = [];
  if (withData.length) {
    groups.push({ type: 'group', label: 'Has data', key: 'has-data', children: withData });
  }
  if (withoutData.length) {
    groups.push({ type: 'group', label: 'No data — enter base time manually', key: 'no-data', children: withoutData });
  }
  return groups;
});

function pushPullLabel(stops: number): string {
  if (stops === 0) {
    return '0';
  }
  return stops > 0 ? `+${stops}` : `${stops}`;
}

function sliderStyle(val: number, min: number, max: number) {
  return `--val: ${((val - min) / (max - min)) * 100}`;
}

const tempWarning = computed<string | null>(() => {
  if (isColorProcess.value) {
    if (tempC.value < 36) {
      return `${film.value.process} below 36°C - color shifts and incomplete development likely`;
    }
    if (tempC.value > 40) {
      return `${film.value.process} above 40°C - risk of fogging and color crossover`;
    }
    return null;
  }
  if (tempC.value < 18) {
    return 'Below 18°C - development will be very slow';
  }
  if (tempC.value > 24) {
    return 'Above 24°C - risk of reticulation and fogging';
  }
  return null;
});

// ---- Process Timer ----
interface TimerStage {
  name: string
  seconds: number
  agitation: string
}

const timerRunning = ref(false);
const timerFinished = ref(false);
const timerStarted = ref(false);
const currentStageIdx = ref(0);
const stageSecondsLeft = ref(0);
let timerIntervalId: ReturnType<typeof setInterval> | null = null;

const processStages = computed<TimerStage[]>(() => {
  const devTime = Math.round(finalSeconds.value ?? 0);
  const proc = film.value?.process;
  if (proc === 'C41') {
    return [
      { name: 'Developer', seconds: devTime, agitation: 'Continuous first 30s, then 10s every 30s' },
      { name: 'Bleach', seconds: 390, agitation: 'Continuous first 30s, then 10s every 30s' },
      { name: 'Wash', seconds: 195, agitation: 'Running water or 3 full changes' },
      { name: 'Fixer', seconds: 390, agitation: 'Continuous first 30s, then 10s every 30s' },
      { name: 'Wash 2', seconds: 195, agitation: 'Running water or 3 full changes' },
      { name: 'Stabilizer', seconds: 90, agitation: 'Gentle swirl only — do not rinse after' },
    ];
  }
  if (proc === 'E6') {
    return [
      { name: 'First Developer', seconds: devTime, agitation: 'Continuous first 30s, then 5s every 30s' },
      { name: 'Wash', seconds: 90, agitation: 'Running water or 3 changes' },
      { name: 'Reversal Bath', seconds: 120, agitation: 'Continuous' },
      { name: 'Color Developer', seconds: 360, agitation: 'Continuous first 30s, then 5s every 30s' },
      { name: 'Pre-bleach', seconds: 120, agitation: 'Continuous' },
      { name: 'Bleach', seconds: 360, agitation: '10s every 30s' },
      { name: 'Fixer', seconds: 240, agitation: '10s every 30s' },
      { name: 'Final Wash', seconds: 240, agitation: 'Running water or 5 changes' },
      { name: 'Stabilizer', seconds: 60, agitation: 'Gentle swirl only — do not rinse after' },
    ];
  }
  // B&W
  return [
    { name: 'Developer', seconds: devTime, agitation: 'Continuous first 30s, then 10s every 60s' },
    { name: 'Stop Bath', seconds: 60, agitation: 'Continuous for 60s' },
    { name: 'Fixer', seconds: 300, agitation: '10s every 60s' },
    { name: 'Wash', seconds: 300, agitation: 'Running water or 5 full changes' },
  ];
});

const currentStage = computed(() => processStages.value[currentStageIdx.value]);
const timerCanStart = computed(() => (finalSeconds.value ?? 0) > 0);

const timerProgressPct = computed(() => {
  const total = currentStage.value?.seconds ?? 1;
  return Math.round(((total - stageSecondsLeft.value) / total) * 100);
});

const countdownDisplay = computed(() => formatTime(stageSecondsLeft.value));

const timerBtnLabel = computed(() => {
  if (!timerStarted.value) {
    return '▶ Start';
  }
  return timerRunning.value ? '⏸ Pause' : '▶ Resume';
});

function beep(freq = 880, dur = 0.3) {
  try {
    const AC = window.AudioContext
      || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) {
      return;
    }
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
    setTimeout(ctx.close.bind(ctx), (dur + 0.15) * 1000);
  }
  catch {}
}

function clearTimerInterval() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function onStageComplete() {
  if (currentStageIdx.value < processStages.value.length - 1) {
    beep(880, 0.25);
    setTimeout(beep, 300, 1100, 0.25);
    currentStageIdx.value++;
    stageSecondsLeft.value = processStages.value[currentStageIdx.value].seconds;
  }
  else {
    clearTimerInterval();
    timerRunning.value = false;
    timerFinished.value = true;
    beep(660, 0.3);
    setTimeout(beep, 320, 880, 0.3);
    setTimeout(beep, 640, 1100, 0.5);
  }
}

function tick() {
  if (stageSecondsLeft.value > 0) {
    stageSecondsLeft.value--;
    if (stageSecondsLeft.value === 0) {
      onStageComplete();
    }
  }
}

function timerToggle() {
  if (timerRunning.value) {
    clearTimerInterval();
    timerRunning.value = false;
  }
  else {
    if (timerFinished.value || !timerCanStart.value) {
      return;
    }
    timerStarted.value = true;
    timerRunning.value = true;
    timerIntervalId = setInterval(tick, 1000);
  }
}

function timerReset() {
  clearTimerInterval();
  timerRunning.value = false;
  timerFinished.value = false;
  timerStarted.value = false;
  currentStageIdx.value = 0;
  stageSecondsLeft.value = processStages.value[0]?.seconds ?? 0;
}

function timerSkip() {
  if (!timerStarted.value || timerFinished.value) {
    return;
  }
  stageSecondsLeft.value = 1;
  tick();
}

// Initialize timer state reactively; reset if not running when stages change
watch(processStages, () => {
  if (!timerRunning.value) {
    timerReset();
  }
}, { immediate: true });

onUnmounted(() => {
  clearTimerInterval();
});
</script>

<template>
  <div class="dc-wrap">
    <!-- LEFT PANEL: inputs -->
    <div class="dc-panel kt-terminal">
      <div class="dc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">FILM DEVELOPMENT CALCULATOR</span>
      </div>
      <div class="dc-body">
        <!-- Developer -->
        <div class="dc-field-label">
          Developer
        </div>
        <div class="dc-btn-grid">
          <button
            v-for="dev in developers"
            :key="dev.id"
            class="dc-choice-btn"
            :class="{ 'dc-choice-active': selectedDevId === dev.id }"
            @click="selectedDevId = dev.id"
          >
            {{ dev.name }}
          </button>
        </div>

        <div class="dc-divider" />

        <!-- Dilution -->
        <div class="dc-field-label">
          Dilution
        </div>
        <div class="dc-btn-row">
          <button
            v-for="(dil, idx) in developer.dilutions"
            :key="dil.label"
            class="dc-choice-btn"
            :class="{ 'dc-choice-active': selectedDilutionIdx === idx }"
            @click="selectedDilutionIdx = idx"
          >
            {{ dil.label }}
          </button>
        </div>

        <div class="dc-divider" />

        <!-- Film stock -->
        <div class="dc-field-label">
          Film stock
        </div>
        <n-select
          v-model:value="selectedFilmName"
          :options="filmOptions"
          size="small"
        />

        <div class="dc-divider" />

        <!-- Base time -->
        <div class="dc-field-label">
          Base time at {{ filmBaseTemp }}°C
        </div>
        <div class="dc-base-row">
          <span class="dc-base-db" :class="{ 'dc-base-none': !hasData }">
            {{ hasData ? formatTime(dbBaseSeconds!) : 'no data' }}
          </span>
          <span class="dc-base-sep">|</span>
          <input
            v-model.number="customBaseSeconds"
            type="number"
            class="dc-num dc-num-sm"
            placeholder="override (s)"
            min="1"
          >
        </div>
        <div v-if="isCustomBase" class="dc-hint">
          Custom base time active
        </div>

        <div class="dc-divider" />

        <!-- Temperature -->
        <div class="dc-field-label dc-field-label-row">
          <span>Temperature: <strong class="dc-val">{{ showTemp(tempC) }}</strong></span>
          <div class="dc-unit-toggle">
            <button class="dc-unit-btn" :class="{ 'dc-unit-active': tempUnit === 'C' }" @click="tempUnit = 'C'">
              °C
            </button>
            <button class="dc-unit-btn" :class="{ 'dc-unit-active': tempUnit === 'F' }" @click="tempUnit = 'F'">
              °F
            </button>
          </div>
        </div>
        <input
          v-model.number="tempDisplay"
          type="range"
          class="dc-slider"
          :min="tempSliderMin"
          :max="tempSliderMax"
          :step="tempSliderStep"
          :style="sliderStyle(tempDisplay, tempSliderMin, tempSliderMax)"
        >
        <div class="dc-slider-labels">
          <span>{{ showTemp(tempMin) }}</span>
          <span>{{ showTemp(tempMax) }}</span>
        </div>

        <div class="dc-divider" />

        <!-- Push / Pull -->
        <div class="dc-field-label">
          Push / Pull
        </div>
        <div class="dc-btn-row dc-pp-row">
          <button
            v-for="stops in pushPullStops"
            :key="stops"
            class="dc-pp-btn"
            :class="{ 'dc-pp-active': pushPull === stops }"
            :data-stops="stops"
            @click="pushPull = stops"
          >
            {{ pushPullLabel(stops) }}
          </button>
        </div>

        <div class="dc-divider" />

        <!-- Tank volume -->
        <div class="dc-field-label">
          Tank volume
        </div>
        <div class="dc-btn-row">
          <button
            v-for="vol in tankVolumes"
            :key="vol"
            class="dc-choice-btn"
            :class="{ 'dc-choice-active': effectiveTankVol === vol && !customTankVolume }"
            @click="() => { tankVolume = vol; customTankVolume = null; }"
          >
            {{ vol }}ml
          </button>
          <input
            v-model.number="customTankVolume"
            type="number"
            class="dc-num dc-num-sm"
            placeholder="custom ml"
            min="1"
          >
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: result + timer stacked -->
    <div class="dc-right-col">
      <div class="dc-panel kt-terminal dc-panel-result">
        <div class="dc-panel-bar kt-terminal-bar">
          <span class="kt-terminal-bar-title">ADJUSTED TIME</span>
        </div>
        <div class="dc-body">
          <!-- Big time -->
          <div class="dc-result-row">
            <div class="dc-result-time" :class="{ 'dc-result-empty': finalSeconds === null }">
              {{ finalSeconds !== null ? formatTime(finalSeconds) : '—' }}
            </div>
          </div>

          <!-- Breakdown -->
          <div class="dc-breakdown">
            <div class="dc-breakdown-row">
              <span class="dc-breakdown-label">Base time ({{ filmBaseTemp }}°C)</span>
              <span class="dc-breakdown-val">{{ baseSeconds !== null ? formatTime(baseSeconds) : '—' }}</span>
            </div>
            <div v-if="tempC !== filmBaseTemp" class="dc-breakdown-row">
              <span class="dc-breakdown-label">Temp adj. ({{ showTemp(tempC) }})</span>
              <span class="dc-breakdown-val">{{ tempAdjustedSeconds !== null ? formatTime(tempAdjustedSeconds) : '—' }}</span>
            </div>
            <div v-if="pushPull !== 0" class="dc-breakdown-row">
              <span class="dc-breakdown-label">{{ pushPull > 0 ? 'Push' : 'Pull' }} {{ Math.abs(pushPull) }} stop{{ Math.abs(pushPull) !== 1 ? 's' : '' }}</span>
              <span class="dc-breakdown-val">{{ finalSeconds !== null ? formatTime(finalSeconds) : '—' }}</span>
            </div>
          </div>

          <div class="dc-divider" />

          <!-- Dilution mix -->
          <div class="dc-field-label">
            Mix for {{ effectiveTankVol }}ml &mdash; {{ developer.name }} {{ dilution.label }}
          </div>
          <div class="dc-mix-row">
            <div class="dc-mix-col">
              <div class="dc-mix-val">
                {{ dilutionVolumes.devMl }}ml
              </div>
              <div class="dc-mix-sub">
                developer
              </div>
            </div>
            <template v-if="dilutionVolumes.waterMl > 0">
              <div class="dc-mix-plus">
                +
              </div>
              <div class="dc-mix-col">
                <div class="dc-mix-val">
                  {{ dilutionVolumes.waterMl }}ml
                </div>
                <div class="dc-mix-sub">
                  water
                </div>
              </div>
            </template>
          </div>

          <!-- Warnings -->
          <div v-if="!hasData && !isCustomBase" class="dc-alert dc-alert-warn">
            No data for {{ film.name }} + {{ developer.name }}. Enter a base time manually.
          </div>
          <div v-if="tempWarning" class="dc-alert dc-alert-warn">
            {{ tempWarning }}
          </div>
          <div v-if="pushPull !== 0" class="dc-alert">
            Push/pull times are estimates. Test roll recommended.
          </div>

          <div class="dc-source-note">
            Base times sourced from Massive Dev Chart and manufacturer datasheets.
          </div>
        </div>
      </div>

      <!-- TIMER PANEL: full width -->
      <div class="dc-panel dc-timer-panel kt-terminal">
        <div class="dc-panel-bar kt-terminal-bar">
          <span class="kt-terminal-bar-title">PROCESS TIMER</span>
          <span class="dc-timer-proc-badge">{{ film.process ?? 'B&W' }}</span>
        </div>

        <!-- Stage strip -->
        <div class="dc-stage-strip">
          <div
            v-for="(stage, i) in processStages"
            :key="i"
            class="dc-stage-chip"
            :class="{
              'dc-stage-chip-done': i < currentStageIdx,
              'dc-stage-chip-active': i === currentStageIdx,
            }"
          >
            <span v-if="i < currentStageIdx" class="dc-stage-chip-check">✓</span>
            <span class="dc-stage-chip-name">{{ stage.name }}</span>
            <span class="dc-stage-chip-dur">{{ formatTime(stage.seconds) }}</span>
          </div>
        </div>

        <div class="dc-timer-body">
          <!-- Finished state -->
          <div v-if="timerFinished" class="dc-timer-done">
            <span class="dc-timer-done-check">✓</span>
            <span class="dc-timer-done-label">Development complete</span>
            <span class="dc-timer-done-hint">Hang to dry and enjoy your negatives.</span>
          </div>

          <!-- Active / idle state -->
          <template v-else>
            <div class="dc-timer-stage-name">
              Stage {{ currentStageIdx + 1 }} / {{ processStages.length }}
              <span class="dc-timer-stage-label">{{ currentStage?.name }}</span>
            </div>
            <div class="dc-timer-prog-track">
              <div class="dc-timer-prog-fill" :style="{ width: `${timerProgressPct}%` }" />
            </div>
            <div
              class="dc-timer-countdown"
              :class="{
                'dc-timer-countdown-urgent': stageSecondsLeft <= 10 && timerRunning,
                'dc-timer-countdown-paused': !timerRunning && timerStarted,
              }"
            >
              {{ countdownDisplay }}
            </div>
            <div class="dc-timer-agitation">
              <span class="dc-timer-ag-key">AGITATION</span> {{ currentStage?.agitation }}
            </div>
          </template>

          <div class="dc-timer-controls">
            <button class="dc-choice-btn" @click="timerReset">
              ↺ Reset
            </button>
            <button
              class="dc-choice-btn dc-timer-main-btn"
              :disabled="!timerCanStart || timerFinished"
              @click="timerToggle"
            >
              {{ timerBtnLabel }}
            </button>
            <button
              class="dc-choice-btn"
              :disabled="!timerStarted || timerFinished"
              @click="timerSkip"
            >
              Skip ▶▶
            </button>
          </div>
        </div>
      </div>
    </div><!-- end dc-right-col -->
  </div>
</template>

<style scoped>
.dc-wrap {
  flex: 1 1 760px;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.dc-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Left inputs column */
.dc-wrap > .dc-panel {
  flex: 1 1 340px;
}

/* Right column: results + timer stacked */
.dc-right-col {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dc-panel-result {
  flex: 0 0 auto;
}

.dc-timer-panel {
  flex: 1 1 auto;
}

.dc-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Labels */
.dc-field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dc-unit-toggle {
  display: flex;
  gap: 2px;
}

.dc-unit-btn {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 3px;
  padding: 1px 7px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}

.dc-unit-btn:hover {
  border-color: rgba(30, 165, 76, 0.45);
  color: rgba(255, 255, 255, 0.65);
}

.dc-unit-active {
  background: rgba(30, 165, 76, 0.14) !important;
  border-color: rgba(30, 165, 76, 0.6) !important;
  color: #1ea54c !important;
}

html:not(.dark) .dc-unit-btn {
  border-color: rgba(13, 112, 51, 0.22);
  color: rgba(0, 0, 0, 0.38);
}

html:not(.dark) .dc-unit-btn:hover {
  border-color: rgba(13, 112, 51, 0.5);
  color: rgba(0, 0, 0, 0.7);
}

html:not(.dark) .dc-unit-active {
  background: rgba(13, 112, 51, 0.1) !important;
  border-color: rgba(13, 112, 51, 0.6) !important;
  color: #0d7033 !important;
}

.dc-field-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

html:not(.dark) .dc-field-label {
  color: rgba(0, 0, 0, 0.4);
}

.dc-val {
  color: rgba(255, 255, 255, 0.75);
}

html:not(.dark) .dc-val {
  color: rgba(0, 0, 0, 0.75);
}

.dc-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.65rem;
  color: rgba(30, 165, 76, 0.6);
  margin-top: -4px;
}

.dc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 2px 0;
}

html:not(.dark) .dc-divider {
  background: rgba(0, 0, 0, 0.08);
}

/* Choice buttons */
.dc-btn-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dc-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.dc-choice-btn {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.18);
  border-radius: 4px;
  padding: 5px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
  white-space: nowrap;
}

.dc-choice-btn:hover {
  border-color: rgba(30, 165, 76, 0.5);
  color: rgba(255, 255, 255, 0.85);
}

.dc-choice-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dc-choice-active {
  background: rgba(30, 165, 76, 0.12) !important;
  border-color: rgba(30, 165, 76, 0.7) !important;
  color: #1ea54c !important;
}

html:not(.dark) .dc-choice-btn {
  border-color: rgba(13, 112, 51, 0.2);
  color: rgba(0, 0, 0, 0.5);
}

html:not(.dark) .dc-choice-btn:hover {
  border-color: rgba(13, 112, 51, 0.5);
  color: rgba(0, 0, 0, 0.8);
}

html:not(.dark) .dc-choice-active {
  background: rgba(13, 112, 51, 0.1) !important;
  border-color: rgba(13, 112, 51, 0.65) !important;
  color: #0d7033 !important;
}

/* Push/pull row */
.dc-pp-row {
  flex-wrap: nowrap;
}

.dc-pp-btn {
  flex: 1;
  text-align: center;
  padding: 5px 4px;
  border-radius: 4px;
  border: 1px solid;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}

/* Zero - green */
.dc-pp-btn[data-stops="0"] {
  background: transparent;
  border-color: rgba(30, 165, 76, 0.25);
  color: rgba(30, 165, 76, 0.55);
}
.dc-pp-btn[data-stops="0"]:hover,
.dc-pp-btn[data-stops="0"].dc-pp-active {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}
.dc-pp-btn[data-stops="0"].dc-pp-active {
  background: rgba(30, 165, 76, 0.18) !important;
}

/* ±1 - light amber */
.dc-pp-btn[data-stops="-1"],
.dc-pp-btn[data-stops="1"] {
  background: transparent;
  border-color: rgba(224, 180, 32, 0.22);
  color: rgba(224, 180, 32, 0.5);
}
.dc-pp-btn[data-stops="-1"]:hover,
.dc-pp-btn[data-stops="1"]:hover {
  background: rgba(224, 180, 32, 0.1);
  border-color: rgba(224, 180, 32, 0.55);
  color: rgba(224, 180, 32, 0.85);
}
.dc-pp-btn[data-stops="-1"].dc-pp-active,
.dc-pp-btn[data-stops="1"].dc-pp-active {
  background: rgba(224, 180, 32, 0.15) !important;
  border-color: rgba(224, 180, 32, 0.75) !important;
  color: #e0b420 !important;
}

/* ±2 - amber */
.dc-pp-btn[data-stops="-2"],
.dc-pp-btn[data-stops="2"] {
  background: transparent;
  border-color: rgba(224, 155, 20, 0.22);
  color: rgba(224, 155, 20, 0.5);
}
.dc-pp-btn[data-stops="-2"]:hover,
.dc-pp-btn[data-stops="2"]:hover {
  background: rgba(224, 155, 20, 0.1);
  border-color: rgba(224, 155, 20, 0.55);
  color: rgba(224, 155, 20, 0.9);
}
.dc-pp-btn[data-stops="-2"].dc-pp-active,
.dc-pp-btn[data-stops="2"].dc-pp-active {
  background: rgba(224, 155, 20, 0.15) !important;
  border-color: rgba(224, 155, 20, 0.75) !important;
  color: #e09b14 !important;
}

/* ±3 - deep amber */
.dc-pp-btn[data-stops="-3"],
.dc-pp-btn[data-stops="3"] {
  background: transparent;
  border-color: rgba(220, 120, 16, 0.22);
  color: rgba(220, 120, 16, 0.5);
}
.dc-pp-btn[data-stops="-3"]:hover,
.dc-pp-btn[data-stops="3"]:hover {
  background: rgba(220, 120, 16, 0.1);
  border-color: rgba(220, 120, 16, 0.55);
  color: rgba(220, 120, 16, 0.9);
}
.dc-pp-btn[data-stops="-3"].dc-pp-active,
.dc-pp-btn[data-stops="3"].dc-pp-active {
  background: rgba(220, 120, 16, 0.15) !important;
  border-color: rgba(220, 120, 16, 0.75) !important;
  color: #dc7810 !important;
}

/* ±4 - red */
.dc-pp-btn[data-stops="-4"],
.dc-pp-btn[data-stops="4"] {
  background: transparent;
  border-color: rgba(220, 50, 50, 0.22);
  color: rgba(220, 50, 50, 0.5);
}
.dc-pp-btn[data-stops="-4"]:hover,
.dc-pp-btn[data-stops="4"]:hover {
  background: rgba(220, 50, 50, 0.1);
  border-color: rgba(220, 50, 50, 0.55);
  color: rgba(220, 50, 50, 0.9);
}
.dc-pp-btn[data-stops="-4"].dc-pp-active,
.dc-pp-btn[data-stops="4"].dc-pp-active {
  background: rgba(220, 50, 50, 0.14) !important;
  border-color: rgba(220, 50, 50, 0.7) !important;
  color: #dc3232 !important;
}

/* ±5 - deep red */
.dc-pp-btn[data-stops="-5"],
.dc-pp-btn[data-stops="5"] {
  background: transparent;
  border-color: rgba(185, 18, 18, 0.28);
  color: rgba(185, 18, 18, 0.55);
}
.dc-pp-btn[data-stops="-5"]:hover,
.dc-pp-btn[data-stops="5"]:hover {
  background: rgba(185, 18, 18, 0.12);
  border-color: rgba(185, 18, 18, 0.62);
  color: rgba(185, 18, 18, 0.95);
}
.dc-pp-btn[data-stops="-5"].dc-pp-active,
.dc-pp-btn[data-stops="5"].dc-pp-active {
  background: rgba(185, 18, 18, 0.16) !important;
  border-color: rgba(185, 18, 18, 0.78) !important;
  color: #b91212 !important;
}

/* Number inputs */
.dc-num {
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 4px;
  padding: 6px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  transition: border-color 0.15s;
  appearance: textfield;
  -moz-appearance: textfield;
}

.dc-num::-webkit-inner-spin-button,
.dc-num::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.dc-num:focus {
  border-color: rgba(30, 165, 76, 0.55);
}

html:not(.dark) .dc-num {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(13, 112, 51, 0.25);
  color: rgba(0, 0, 0, 0.8);
}

.dc-num-sm {
  width: 110px;
  padding: 5px 8px;
}

/* Base time row */
.dc-base-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dc-base-db {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  min-width: 56px;
}

html:not(.dark) .dc-base-db {
  color: rgba(0, 0, 0, 0.7);
}

.dc-base-none {
  color: rgba(255, 255, 255, 0.2) !important;
  font-weight: 400 !important;
}

html:not(.dark) .dc-base-none {
  color: rgba(0, 0, 0, 0.2) !important;
}

.dc-base-sep {
  color: rgba(255, 255, 255, 0.12);
}

html:not(.dark) .dc-base-sep {
  color: rgba(0, 0, 0, 0.12);
}

/* Slider */
.dc-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    #1ea54c calc(var(--val, 50) * 1%),
    rgba(30, 165, 76, 0.18) calc(var(--val, 50) * 1%)
  );
}

.dc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(30, 165, 76, 0.3);
}

.dc-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
}

html:not(.dark) .dc-slider {
  background: linear-gradient(
    to right,
    #0d7033 calc(var(--val, 50) * 1%),
    rgba(13, 112, 51, 0.18) calc(var(--val, 50) * 1%)
  );
}

html:not(.dark) .dc-slider::-webkit-slider-thumb {
  background: #0d7033;
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(13, 112, 51, 0.25);
}

html:not(.dark) .dc-slider::-moz-range-thumb {
  background: #0d7033;
  border-color: #fff;
}

.dc-slider-labels {
  display: flex;
  justify-content: space-between;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
}

html:not(.dark) .dc-slider-labels {
  color: rgba(0, 0, 0, 0.3);
}

/* Result panel */
.dc-result-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.dc-result-time {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 2.8rem;
  font-weight: 700;
  color: #1ea54c;
  line-height: 1;
  letter-spacing: -0.01em;
}

.dc-result-empty {
  color: rgba(255, 255, 255, 0.15) !important;
  font-weight: 400 !important;
}

html:not(.dark) .dc-result-empty {
  color: rgba(0, 0, 0, 0.12) !important;
}

/* Breakdown */
.dc-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dc-breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

html:not(.dark) .dc-breakdown-row {
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.dc-breakdown-label {
  color: rgba(255, 255, 255, 0.35);
}

html:not(.dark) .dc-breakdown-label {
  color: rgba(0, 0, 0, 0.4);
}

.dc-breakdown-val {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}

html:not(.dark) .dc-breakdown-val {
  color: rgba(0, 0, 0, 0.75);
}

/* Mix */
.dc-mix-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 2px;
}

.dc-mix-col {
  text-align: center;
}

.dc-mix-val {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

html:not(.dark) .dc-mix-val {
  color: rgba(0, 0, 0, 0.75);
}

.dc-mix-sub {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

html:not(.dark) .dc-mix-sub {
  color: rgba(0, 0, 0, 0.35);
}

.dc-mix-plus {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.2);
}

html:not(.dark) .dc-mix-plus {
  color: rgba(0, 0, 0, 0.15);
}

/* Alerts */
.dc-alert {
  display: flex;
  gap: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.75);
  background: rgba(30, 165, 76, 0.06);
  border-left: 3px solid rgba(30, 165, 76, 0.4);
  padding: 7px 10px;
  border-radius: 4px;
}

.dc-alert-warn {
  color: rgba(251, 191, 36, 0.85);
  background: rgba(251, 191, 36, 0.06);
  border-left-color: rgba(251, 191, 36, 0.4);
}

html:not(.dark) .dc-alert-warn {
  color: #92400e;
  background: rgba(217, 119, 6, 0.06);
  border-left-color: rgba(217, 119, 6, 0.4);
}

/* Source note */
.dc-source-note {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.18);
  line-height: 1.4;
}

html:not(.dark) .dc-source-note {
  color: rgba(0, 0, 0, 0.22);
}

/* ---- Timer panel ---- */
.dc-timer-proc-badge {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(30, 165, 76, 0.14);
  border: 1px solid rgba(30, 165, 76, 0.4);
  color: #1ea54c;
  padding: 1px 8px;
  border-radius: 3px;
}

html:not(.dark) .dc-timer-proc-badge {
  background: rgba(13, 112, 51, 0.1);
  border-color: rgba(13, 112, 51, 0.4);
  color: #0d7033;
}

/* Stage strip */
.dc-stage-strip {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dc-stage-strip::-webkit-scrollbar {
  display: none;
}

html:not(.dark) .dc-stage-strip {
  border-bottom-color: rgba(0, 0, 0, 0.07);
}

.dc-stage-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.12);
  min-width: 72px;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;
}

html:not(.dark) .dc-stage-chip {
  border-color: rgba(13, 112, 51, 0.12);
}

.dc-stage-chip-active {
  border-color: rgba(30, 165, 76, 0.6) !important;
  background: rgba(30, 165, 76, 0.08);
}

html:not(.dark) .dc-stage-chip-active {
  border-color: rgba(13, 112, 51, 0.55) !important;
  background: rgba(13, 112, 51, 0.07);
}

.dc-stage-chip-done {
  border-color: rgba(30, 165, 76, 0.22);
  background: rgba(30, 165, 76, 0.04);
  opacity: 0.6;
}

.dc-stage-chip-check {
  font-size: 0.7rem;
  color: #1ea54c;
}

html:not(.dark) .dc-stage-chip-check {
  color: #0d7033;
}

.dc-stage-chip-name {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  white-space: nowrap;
}

html:not(.dark) .dc-stage-chip-name {
  color: rgba(0, 0, 0, 0.5);
}

.dc-stage-chip-active .dc-stage-chip-name {
  color: #1ea54c;
}

html:not(.dark) .dc-stage-chip-active .dc-stage-chip-name {
  color: #0d7033;
}

.dc-stage-chip-dur {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
}

html:not(.dark) .dc-stage-chip-dur {
  color: rgba(0, 0, 0, 0.28);
}

/* Timer body */
.dc-timer-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dc-timer-stage-name {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  gap: 10px;
  align-items: center;
}

html:not(.dark) .dc-timer-stage-name {
  color: rgba(0, 0, 0, 0.38);
}

.dc-timer-stage-label {
  color: rgba(255, 255, 255, 0.6);
  text-transform: none;
  letter-spacing: 0;
}

html:not(.dark) .dc-timer-stage-label {
  color: rgba(0, 0, 0, 0.6);
}

/* Progress bar */
.dc-timer-prog-track {
  height: 4px;
  background: rgba(30, 165, 76, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

html:not(.dark) .dc-timer-prog-track {
  background: rgba(13, 112, 51, 0.1);
}

.dc-timer-prog-fill {
  height: 100%;
  background: #1ea54c;
  border-radius: 2px;
  transition: width 0.9s linear;
}

html:not(.dark) .dc-timer-prog-fill {
  background: #0d7033;
}

/* Countdown */
.dc-timer-countdown {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: #1ea54c;
  line-height: 1;
  letter-spacing: -0.02em;
  transition: color 0.2s;
}

html:not(.dark) .dc-timer-countdown {
  color: #0d7033;
}

.dc-timer-countdown-urgent {
  color: #dc3232 !important;
}

.dc-timer-countdown-paused {
  color: rgba(255, 255, 255, 0.3) !important;
}

html:not(.dark) .dc-timer-countdown-paused {
  color: rgba(0, 0, 0, 0.25) !important;
}

/* Agitation */
.dc-timer-agitation {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
}

html:not(.dark) .dc-timer-agitation {
  color: rgba(0, 0, 0, 0.45);
}

.dc-timer-ag-key {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: rgba(30, 165, 76, 0.55);
  margin-right: 4px;
}

html:not(.dark) .dc-timer-ag-key {
  color: rgba(13, 112, 51, 0.55);
}

/* Controls */
.dc-timer-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
}

.dc-timer-main-btn {
  flex: 1;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-color: rgba(30, 165, 76, 0.35) !important;
}

html:not(.dark) .dc-timer-main-btn {
  border-color: rgba(13, 112, 51, 0.35) !important;
}

/* Done state */
.dc-timer-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 0 8px;
}

.dc-timer-done-check {
  font-size: 2.2rem;
  color: #1ea54c;
  line-height: 1;
}

html:not(.dark) .dc-timer-done-check {
  color: #0d7033;
}

.dc-timer-done-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

html:not(.dark) .dc-timer-done-label {
  color: rgba(0, 0, 0, 0.75);
}

.dc-timer-done-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
}

html:not(.dark) .dc-timer-done-hint {
  color: rgba(0, 0, 0, 0.3);
}
</style>
