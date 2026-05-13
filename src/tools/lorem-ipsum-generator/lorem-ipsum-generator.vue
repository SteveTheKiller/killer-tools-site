<script setup lang="ts">
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { randIntFromInterval } from '@/utils/random';
import { generateLoremIpsum } from './lorem-ipsum-generator.service';

const paragraphs = ref(1);
const sentencesMin = ref(3);
const sentencesMax = ref(8);
const wordsMin = ref(8);
const wordsMax = ref(15);
const startWithLoremIpsum = ref(true);
const asHTML = ref(false);

// Keep mins from exceeding maxes
watch(sentencesMin, (v) => {
  if (v > sentencesMax.value) {
    sentencesMax.value = v;
  }
});
watch(sentencesMax, (v) => {
  if (v < sentencesMin.value) {
    sentencesMin.value = v;
  }
});
watch(wordsMin, (v) => {
  if (v > wordsMax.value) {
    wordsMax.value = v;
  }
});
watch(wordsMax, (v) => {
  if (v < wordsMin.value) {
    wordsMin.value = v;
  }
});

const [loremIpsumText, refreshLoremIpsum] = computedRefreshable(() =>
  generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randIntFromInterval(sentencesMin.value, sentencesMax.value),
    wordCount: randIntFromInterval(wordsMin.value, wordsMax.value),
    startWithLoremIpsum: startWithLoremIpsum.value,
  }),
);

const wordCount = computed(() => loremIpsumText.value.trim().split(/\s+/).filter(Boolean).length);
const charCount = computed(() => loremIpsumText.value.length);

const { copy } = useCopy({ source: loremIpsumText, text: 'Lorem ipsum copied to the clipboard' });
function sliderStyle(val: number, min: number, max: number) {
  return `--val: ${((val - min) / (max - min)) * 100}`;
}

function dualRangeStyle(lo: number, hi: number, min: number, max: number) {
  const span = max - min;
  return `--min: ${((lo - min) / span) * 100}%; --max: ${((hi - min) / span) * 100}%`;
}
</script>

<template>
  <div class="li-wrap">
    <!-- Controls -->
    <div class="li-controls">
      <!-- Paragraphs -->
      <div class="li-row">
        <span class="li-label">Paragraphs</span>
        <input
          v-model.number="paragraphs"
          type="range"
          min="1"
          max="20"
          class="li-slider"
          :style="sliderStyle(paragraphs, 1, 20)"
        >
        <span class="li-val">{{ paragraphs }}</span>
      </div>

      <!-- Sentences per paragraph -->
      <div class="li-row">
        <span class="li-label">Sentences / paragraph</span>
        <div class="li-dual-range" :style="dualRangeStyle(sentencesMin, sentencesMax, 1, 50)">
          <input v-model.number="sentencesMin" type="range" min="1" max="50" class="li-dual-min">
          <input v-model.number="sentencesMax" type="range" min="1" max="50" class="li-dual-max">
        </div>
        <span class="li-val">{{ sentencesMin }}–{{ sentencesMax }}</span>
      </div>

      <!-- Words per sentence -->
      <div class="li-row">
        <span class="li-label">Words / sentence</span>
        <div class="li-dual-range" :style="dualRangeStyle(wordsMin, wordsMax, 1, 50)">
          <input v-model.number="wordsMin" type="range" min="1" max="50" class="li-dual-min">
          <input v-model.number="wordsMax" type="range" min="1" max="50" class="li-dual-max">
        </div>
        <span class="li-val">{{ wordsMin }}–{{ wordsMax }}</span>
      </div>

      <!-- Toggles -->
      <div class="li-toggle-group">
        <button
          type="button"
          class="li-toggle"
          :class="{ 'li-toggle-on': startWithLoremIpsum }"
          @click="startWithLoremIpsum = !startWithLoremIpsum"
        >
          Start with lorem ipsum
        </button>
        <button
          type="button"
          class="li-toggle"
          :class="{ 'li-toggle-on': asHTML }"
          @click="asHTML = !asHTML"
        >
          As HTML
        </button>
      </div>
    </div>

    <!-- Output -->
    <div class="li-output-wrap kt-terminal">
      <div class="kt-terminal-bar li-output-header">
        <span class="kt-terminal-bar-title">OUTPUT</span>
        <div class="li-stats">
          <span class="li-stat">{{ wordCount.toLocaleString() }} words</span>
          <span class="li-stat-sep">·</span>
          <span class="li-stat">{{ charCount.toLocaleString() }} chars</span>
        </div>
      </div>
      <textarea class="li-output" :value="loremIpsumText" readonly />
    </div>
    <div class="li-actions">
      <button type="button" class="li-btn li-btn-primary" @click="copy()">
        <icon-mdi-content-copy />
        Copy
      </button>
      <button type="button" class="li-btn" @click="refreshLoremIpsum()">
        <icon-mdi-refresh />
        Refresh
      </button>
    </div>
  </div>
</template>

<style scoped>
.li-wrap {
  flex: 1 1 560px;
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Controls ── */
.li-controls {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.li-row {
  display: grid;
  grid-template-columns: 200px 1fr 56px;
  align-items: center;
  gap: 14px;
}

.li-label {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.li-val {
  font-size: 0.76rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #1ea54c;
  text-align: right;
  white-space: nowrap;
}

/* ── Dual-handle range slider ── */
.li-dual-range {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.li-dual-range::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    rgba(30, 165, 76, 0.18) var(--min, 0%),
    #1ea54c var(--min, 0%),
    #1ea54c var(--max, 100%),
    rgba(30, 165, 76, 0.18) var(--max, 100%)
  );
  pointer-events: none;
}

.li-dual-min,
.li-dual-max {
  position: absolute;
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent !important;
  outline: none;
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.li-dual-min::-webkit-slider-thumb,
.li-dual-max::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(30, 165, 76, 0.3);
  pointer-events: all;
}

.li-dual-min::-moz-range-thumb,
.li-dual-max::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
  pointer-events: all;
}

/* ── Slider ── */
.li-slider {
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

.li-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(30, 165, 76, 0.3);
}

.li-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1ea54c;
  border: 2px solid #000;
  cursor: pointer;
}

/* ── Toggle pill ── */
.li-toggle {
  padding: 3px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent !important;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}

.li-toggle-on {
  border-color: #1ea54c;
  background: rgba(30, 165, 76, 0.15);
  color: #1ea54c;
}

.li-toggle-group {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Output ── */
.li-output-wrap {
  overflow: hidden;
}

.li-output-header {
  justify-content: flex-start;
}

.li-stats {
  margin-left: auto;
}

.li-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.li-stat {
  font-size: 0.65rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(30, 165, 76, 0.6);
}

.li-stat-sep {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.65rem;
}

.li-output {
  width: 100%;
  min-height: 260px;
  background: transparent;
  border: none;
  outline: none;
  padding: 14px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  line-height: 1.7;
  resize: vertical;
  box-sizing: border-box;
}

.li-actions {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
}

.li-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: rgba(0, 0, 0, 0.35) !important;
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.li-btn:hover {
  background: rgba(10, 10, 12, 0.95) !important;
  border-color: rgba(30, 165, 76, 0.65);
  color: #1ea54c;
}

.li-btn-primary {
  background: rgba(0, 0, 0, 0.35) !important;
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}

.li-btn-primary:hover {
  background: rgba(10, 10, 12, 0.95) !important;
  border-color: #1ea54c;
}

/* ── Light mode ── */
html:not(.dark) .li-controls {
  background: rgba(255, 255, 255, 0.70) !important;
  border-color: rgba(0, 0, 0, 0.10);
}
html:not(.dark) .li-label    { color: rgba(0, 0, 0, 0.70); }
html:not(.dark) .li-val      { color: #0d7033; }

html:not(.dark) .li-dual-range::before {
  background: linear-gradient(
    to right,
    rgba(13, 112, 51, 0.15) var(--min, 0%),
    #0d7033 var(--min, 0%),
    #0d7033 var(--max, 100%),
    rgba(13, 112, 51, 0.15) var(--max, 100%)
  );
}
html:not(.dark) .li-dual-min::-webkit-slider-thumb,
html:not(.dark) .li-dual-max::-webkit-slider-thumb { background: #0d7033; border-color: #fff; box-shadow: 0 0 0 3px rgba(13,112,51,0.25); }
html:not(.dark) .li-dual-min::-moz-range-thumb,
html:not(.dark) .li-dual-max::-moz-range-thumb { background: #0d7033; border-color: #fff; }

html:not(.dark) .li-slider {
  background: linear-gradient(
    to right,
    #0d7033 calc(var(--val, 50) * 1%),
    rgba(13, 112, 51, 0.18) calc(var(--val, 50) * 1%)
  );
}
html:not(.dark) .li-slider::-webkit-slider-thumb { background: #0d7033; border-color: #fff; box-shadow: 0 0 0 3px rgba(13,112,51,0.25); }
html:not(.dark) .li-slider::-moz-range-thumb     { background: #0d7033; border-color: #fff; }

html:not(.dark) .li-toggle {
  border-color: rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.50);
}
html:not(.dark) .li-toggle-on {
  border-color: #0d7033 !important;
  background: rgba(13, 112, 51, 0.12) !important;
  color: #0b5c28 !important;
}

html:not(.dark) .li-stat          { color: rgba(13, 112, 51, 0.70); }
html:not(.dark) .li-stat-sep      { color: rgba(0, 0, 0, 0.25); }

/* Match output terminal bg to controls panel so the rounded corners aren't gray.
   Systemic [class*="-terminal"]:not()x6 = (0,7,0)+!important.
   7x repeated class → (0,9,0)+!important — wins. */
html:not(.dark) .li-output-wrap.li-output-wrap.li-output-wrap.li-output-wrap.li-output-wrap.li-output-wrap.li-output-wrap {
  background: rgba(255, 255, 255, 0.70) !important;
  border-color: rgba(0, 0, 0, 0.10) !important;
}
html:not(.dark) .li-output.li-output { background: transparent !important; color: rgba(0, 0, 0, 0.75) !important; }
html:not(.dark) .li-btn           { color: #0d7033; border-color: rgba(13, 112, 51, 0.35); }
html:not(.dark) .li-btn:hover     { background: rgba(13, 112, 51, 0.08) !important; border-color: rgba(13,112,51,0.65); color: #0b5c28; }
html:not(.dark) .li-btn-primary   { background: rgba(13, 112, 51, 0.10) !important; border-color: rgba(13,112,51,0.45); color: #0b5c28; }
html:not(.dark) .li-btn-primary:hover { background: rgba(13, 112, 51, 0.18) !important; border-color: #0d7033; }
</style>
