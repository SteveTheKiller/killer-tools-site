<script setup lang="ts">
import type { Colord } from 'colord';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import lchPlugin from 'colord/plugins/lch';
import namesPlugin from 'colord/plugins/names';
import _ from 'lodash';
import { buildColorFormat } from './color-converter.models';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const formats = {
  picker: buildColorFormat({
    label: 'color picker',
    format: (v: Colord) => v.toHex(),
    type: 'color-picker',
  }),
  hex: buildColorFormat({ label: 'hex', format: (v: Colord) => v.toHex(), placeholder: '#ff0000' }),
  rgb: buildColorFormat({ label: 'rgb', format: (v: Colord) => v.toRgbString(), placeholder: 'rgb(255, 0, 0)' }),
  hsl: buildColorFormat({ label: 'hsl', format: (v: Colord) => v.toHslString(), placeholder: 'hsl(0, 100%, 50%)' }),
  hwb: buildColorFormat({ label: 'hwb', format: (v: Colord) => v.toHwbString(), placeholder: 'hwb(0, 0%, 0%)' }),
  lch: buildColorFormat({ label: 'lch', format: (v: Colord) => v.toLchString(), placeholder: 'lch(53.24, 104.55, 40.85)' }),
  cmyk: buildColorFormat({ label: 'cmyk', format: (v: Colord) => v.toCmykString(), placeholder: 'cmyk(0, 100%, 100%, 0)' }),
  name: buildColorFormat({ label: 'name', format: (v: Colord) => v.toName({ closest: true }) ?? 'Unknown', placeholder: 'red' }),
};

const outputKeys = ['hex', 'rgb', 'hsl', 'hwb', 'lch', 'cmyk', 'name'] as const;

updateColorValue(colord('#1ea54c'));

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined || !value.isValid()) {
    return;
  }
  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value);
    }
  });
}

const currentHex = computed(() => formats.hex.value.value || '#1ea54c');

const copiedLabel = ref<string | null>(null);
async function copyValue(key: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedLabel.value = key;
  setTimeout(() => {
    if (copiedLabel.value === key) {
      copiedLabel.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="color-tool">
    <!-- Color picker area — above the terminal -->
    <div class="color-input-area" mb-3>
      <label class="color-field-label">Color</label>
      <div class="color-picker-row">
        <div class="color-swatch" :style="{ background: currentHex }" />
        <div class="color-picker">
          <n-color-picker
            v-model:value="formats.picker.value.value"
            placement="bottom-end"
            @update:value="(v: string) => updateColorValue(formats.picker.parse(v), 'picker')"
          />
        </div>
      </div>
    </div>

    <div class="kt-terminal color-terminal">
      <!-- Format rows -->
      <div class="kt-terminal-bar color-section-header">
        FORMATS
      </div>

      <div
        v-for="key in outputKeys"
        :key="key"
        class="color-row"
        :class="{ 'color-row-error': formats[key].validation.attrs.validationStatus === 'error' }"
      >
        <span class="color-prompt">&gt;_</span>
        <span class="color-label">{{ formats[key].label }}</span>
        <input
          v-model="formats[key].value.value"
          class="color-value-input"
          :placeholder="formats[key].placeholder"
          spellcheck="false"
          autocomplete="off"
          @input="(e: Event) => updateColorValue(formats[key].parse((e.target as HTMLInputElement).value), key)"
        >
        <button
          type="button"
          class="color-copy"
          :class="{ 'color-copy-done': copiedLabel === key }"
          :disabled="!formats[key].value.value"
          @click="copyValue(key, formats[key].value.value)"
        >
          <span v-if="copiedLabel === key">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.color-terminal {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.color-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  transition: background 0.15s;
}

.color-picker {
  flex: 1;
}

.color-row {
  display: grid;
  grid-template-columns: auto 60px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.color-row:last-child { border-bottom: none; }
.color-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

.color-row-error .color-value-input { color: #e05555; }

.color-prompt {
  color: rgba(var(--kt-accent-rgb), 0.75);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.color-label {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
  white-space: nowrap;
}

.color-value-input {
  background: transparent !important;
  border: none;
  outline: none;
  color: var(--kt-accent);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  width: 100%;
  min-width: 0;
  caret-color: var(--kt-accent);
  cursor: text;
}

.color-value-input::placeholder { color: rgba(var(--kt-accent-rgb), 0.25); }

.color-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(var(--kt-accent-rgb), 0.65);
  transition: color 0.12s;
  flex-shrink: 0;
  background: transparent !important;
  border: none;
  padding: 0;
  cursor: pointer;
}

.color-copy:disabled { opacity: 0.3; cursor: default; }
.color-copy:not(:disabled):hover { color: var(--kt-accent); }
.color-copy-done { color: var(--kt-accent) !important; }

@container (max-width: 480px) {
  .color-row { grid-template-columns: auto 1fr auto; gap: 8px; }
  .color-prompt { display: none; }
}

/* ── Light mode overrides ── */
html:not(.dark) .color-field-label { color: rgba(0, 0, 0, 0.55); }
html:not(.dark) .color-swatch      { border-color: rgba(0, 0, 0, 0.18); }

/* color-value-input: systemic bare input rule (specificity 0,6,2 + !important) overrides
   the scoped transparent bg. Match that specificity by repeating classes so this wins. */
html:not(.dark) .color-terminal.color-terminal .color-row.color-row input.color-value-input {
  background: transparent !important;
  color: #0d7033 !important;
  border: none !important;
}
</style>
