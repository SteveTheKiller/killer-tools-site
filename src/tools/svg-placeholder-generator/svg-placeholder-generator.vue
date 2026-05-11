<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useCopy } from '@/composable/copy';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';

const width = ref(600);
const height = ref(350);
const fontSize = ref(26);
const bgColor = ref('#cccccc');
const fgColor = ref('#333333');
const useExactSize = ref(true);
const customText = ref('');

const svgString = computed(() => {
  const w = width.value;
  const h = height.value;
  const text = customText.value.length > 0 ? customText.value : `${w}x${h}`;
  const size = useExactSize.value ? ` width="${w}" height="${h}"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" fill="${bgColor.value}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize.value}px" fill="${fgColor.value}">${text}</text>
</svg>`.trim();
});

const base64 = computed(() => `data:image/svg+xml;base64,${textToBase64(svgString.value)}`);

const { copy: copySVG } = useCopy({ source: svgString });
const { copy: copyBase64 } = useCopy({ source: base64 });
const { download } = useDownloadFileFromBase64({ source: base64 });
</script>

<template>
  <!-- Controls -->
  <div class="sp-controls">
    <!-- Width + Background -->
    <div class="sp-row">
      <div class="sp-field">
        <span class="sp-label">WIDTH (px)</span>
        <div class="sp-stepper">
          <button class="sp-step-btn" :disabled="width <= 1" @click="width = Math.max(1, width - 1)">
            −
          </button>
          <input v-model.number="width" class="sp-step-input" type="number" min="1">
          <button class="sp-step-btn" @click="width++">
            +
          </button>
        </div>
      </div>
      <div class="sp-field">
        <span class="sp-label">BACKGROUND</span>
        <div class="sp-color-row">
          <input v-model="bgColor" class="sp-color-swatch" type="color">
          <input v-model="bgColor" class="sp-color-hex" type="text" maxlength="7" spellcheck="false">
        </div>
      </div>
    </div>

    <!-- Height + Text color -->
    <div class="sp-row">
      <div class="sp-field">
        <span class="sp-label">HEIGHT (px)</span>
        <div class="sp-stepper">
          <button class="sp-step-btn" :disabled="height <= 1" @click="height = Math.max(1, height - 1)">
            −
          </button>
          <input v-model.number="height" class="sp-step-input" type="number" min="1">
          <button class="sp-step-btn" @click="height++">
            +
          </button>
        </div>
      </div>
      <div class="sp-field">
        <span class="sp-label">TEXT COLOR</span>
        <div class="sp-color-row">
          <input v-model="fgColor" class="sp-color-swatch" type="color">
          <input v-model="fgColor" class="sp-color-hex" type="text" maxlength="7" spellcheck="false">
        </div>
      </div>
    </div>

    <!-- Font size + Custom text -->
    <div class="sp-row">
      <div class="sp-field">
        <span class="sp-label">FONT SIZE</span>
        <div class="sp-stepper">
          <button class="sp-step-btn" :disabled="fontSize <= 1" @click="fontSize = Math.max(1, fontSize - 1)">
            −
          </button>
          <input v-model.number="fontSize" class="sp-step-input" type="number" min="1">
          <button class="sp-step-btn" @click="fontSize++">
            +
          </button>
        </div>
      </div>
      <div class="sp-field sp-field-grow">
        <span class="sp-label">CUSTOM TEXT</span>
        <input
          v-model="customText"
          class="sp-text-input"
          type="text"
          :placeholder="`Default is ${width}x${height}`"
          autocomplete="off"
          spellcheck="false"
        >
      </div>
    </div>

    <!-- Use exact size pill -->
    <div class="sp-toggle-row">
      <button type="button" class="kt-pill" :class="{ 'kt-pill-active': useExactSize }" @click="useExactSize = !useExactSize">
        Use exact size
      </button>
    </div>

    <!-- SVG HTML element -->
    <div class="sp-output-block">
      <span class="sp-label">SVG HTML ELEMENT</span>
      <TextareaCopyable :value="svgString" language="xml" copy-placement="none" />
    </div>

    <!-- Base64 -->
    <div class="sp-output-block">
      <span class="sp-label">SVG IN BASE64</span>
      <TextareaCopyable :value="base64" copy-placement="none" />
    </div>

    <!-- Actions -->
    <div class="sp-actions">
      <button class="sp-btn" @click="copySVG()">
        Copy svg
      </button>
      <button class="sp-btn" @click="copyBase64()">
        Copy base64
      </button>
      <button class="sp-btn sp-btn-accent" @click="download()">
        Download svg
      </button>
    </div>
  </div>

  <!-- Preview — separate root element so the framework layout gives it full remaining space -->
  <div class="sp-preview-panel">
    <span class="sp-label">PREVIEW</span>
    <div class="sp-preview-frame">
      <img :src="base64" alt="SVG preview" class="sp-preview-img">
    </div>
  </div>
</template>

<style scoped>
/* Controls column */
.sp-controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Preview panel */
.sp-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 0;
  min-width: 0;
}

.sp-preview-frame {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex: 1;
}

.sp-preview-img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

/* Row / field */
.sp-row {
  display: flex;
  gap: 16px;
}

.sp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.sp-field-grow {
  flex: 2;
}

@media (max-width: 640px) {
  .sp-row {
    flex-direction: column;
    gap: 10px;
  }
}

/* Sublabels */
.sp-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* Stepper */
.sp-stepper {
  display: inline-flex;
  align-items: center;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  height: 32px;
}

.sp-step-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.12);
  color: #1ea54c;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.sp-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.sp-step-btn:hover:not(:disabled) { background: rgba(30, 165, 76, 0.1); }
.sp-step-btn:disabled { opacity: 0.3; cursor: default; }

.sp-step-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: #1ea54c;
  outline: none;
  -moz-appearance: textfield;
  appearance: textfield;
}

.sp-step-input::-webkit-inner-spin-button,
.sp-step-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* Color picker */
.sp-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 4px 8px;
  height: 32px;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.sp-color-row:focus-within {
  border-color: rgba(30, 165, 76, 0.5);
}

.sp-color-swatch {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  background: none;
  flex-shrink: 0;
}

.sp-color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
.sp-color-swatch::-webkit-color-swatch { border: none; border-radius: 3px; }

.sp-color-hex {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 0;
}

/* Text input */
.sp-text-input {
  height: 32px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 0 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.sp-text-input::placeholder { color: rgba(255, 255, 255, 0.2); }
.sp-text-input:focus { border-color: rgba(30, 165, 76, 0.5); }

/* Toggle */
.sp-toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kt-pill {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 3px 11px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.kt-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.kt-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

/* Output blocks */
.sp-output-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Action buttons */
.sp-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 4px;
}

.sp-btn {
  padding: 7px 18px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.65);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.sp-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.5);
  color: #fff;
}

.sp-btn-accent { border-color: rgba(30, 165, 76, 0.5); color: #1ea54c; }
.sp-btn-accent:hover { background: rgba(30, 165, 76, 0.15); color: #4dd07a; }

/* ── Light mode ── */
html:not(.dark) .sp-label { color: rgba(0, 0, 0, 0.50); }

html:not(.dark) .sp-stepper {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.18);
}

html:not(.dark) .sp-step-btn {
  color: #0d7033;
  border-color: rgba(0, 0, 0, 0.10);
}
html:not(.dark) .sp-step-btn:last-child { border-color: rgba(0, 0, 0, 0.10); }
html:not(.dark) .sp-step-btn:hover:not(:disabled) { background: rgba(13, 112, 51, 0.08); }

html:not(.dark) .sp-step-input { color: #0d7033; }

html:not(.dark) .sp-color-row {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.18);
}
html:not(.dark) .sp-color-row:focus-within { border-color: rgba(13, 112, 51, 0.50); }

html:not(.dark) .sp-color-hex { color: rgba(0, 0, 0, 0.75); }

html:not(.dark) .sp-text-input {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.18);
  color: rgba(0, 0, 0, 0.80);
}
html:not(.dark) .sp-text-input::placeholder { color: rgba(0, 0, 0, 0.28); }
html:not(.dark) .sp-text-input:focus { border-color: rgba(13, 112, 51, 0.50); }

html:not(.dark) .sp-preview-frame {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(13, 112, 51, 0.20);
}

html:not(.dark) .sp-btn {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.18);
  color: rgba(0, 0, 0, 0.65);
}
html:not(.dark) .sp-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  border-color: rgba(13, 112, 51, 0.45);
  color: rgba(0, 0, 0, 0.88);
}
html:not(.dark) .sp-btn-accent { border-color: rgba(13, 112, 51, 0.50); color: #0b5c28; }
html:not(.dark) .sp-btn-accent:hover { background: rgba(13, 112, 51, 0.12); color: #083d1a; }

html:not(.dark) .kt-pill {
  border-color: rgba(0, 0, 0, 0.15);
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.55);
}
html:not(.dark) .kt-pill:hover { background: rgba(13, 112, 51, 0.10); border-color: rgba(13, 112, 51, 0.40); color: #0d7033; }
html:not(.dark) .kt-pill-active { background: rgba(13, 112, 51, 0.15) !important; border-color: #0d7033 !important; color: #0b5c28 !important; }
</style>
