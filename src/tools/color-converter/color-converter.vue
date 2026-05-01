<script setup lang="ts">
import type { Colord } from 'colord';
import { colord, extend } from 'colord';
import _ from 'lodash';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import { buildColorFormat } from './color-converter.models';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const formats = {
  picker: buildColorFormat({
    label: 'color picker',
    format: (v: Colord) => v.toHex(),
    type: 'color-picker',
  }),
  hex: buildColorFormat({
    label: 'hex',
    format: (v: Colord) => v.toHex(),
    placeholder: '#ff0000',
  }),
  rgb: buildColorFormat({
    label: 'rgb',
    format: (v: Colord) => v.toRgbString(),
    placeholder: 'rgb(255, 0, 0)',
  }),
  hsl: buildColorFormat({
    label: 'hsl',
    format: (v: Colord) => v.toHslString(),
    placeholder: 'hsl(0, 100%, 50%)',
  }),
  hwb: buildColorFormat({
    label: 'hwb',
    format: (v: Colord) => v.toHwbString(),
    placeholder: 'hwb(0, 0%, 0%)',
  }),
  lch: buildColorFormat({
    label: 'lch',
    format: (v: Colord) => v.toLchString(),
    placeholder: 'lch(53.24, 104.55, 40.85)',
  }),
  cmyk: buildColorFormat({
    label: 'cmyk',
    format: (v: Colord) => v.toCmykString(),
    placeholder: 'cmyk(0, 100%, 100%, 0)',
  }),
  name: buildColorFormat({
    label: 'name',
    format: (v: Colord) => v.toName({ closest: true }) ?? 'Unknown',
    placeholder: 'red',
  }),
};

const outputKeys = ['hex', 'rgb', 'hsl', 'hwb', 'lch', 'cmyk', 'name'] as const;
type OutputKey = typeof outputKeys[number];

updateColorValue(colord('#1ea54c'));

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined || !value.isValid()) return;
  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) valueRef.value = format(value);
  });
}

const currentHex = computed(() => formats.hex.value.value || '#1ea54c');

const copiedLabel = ref<string | null>(null);
async function copyValue(key: string, value: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedLabel.value = key;
  setTimeout(() => {
    if (copiedLabel.value === key) copiedLabel.value = null;
  }, 2000);
}
</script>

<template>
  <div class="color-tool">
    <c-card>
      <div class="color-section-label">
        Color
      </div>

      <!-- swatch + picker -->
      <div class="color-picker-row">
        <div class="color-swatch" :style="{ background: currentHex }" />
        <n-color-picker
          v-model:value="formats.picker.value.value"
          class="color-picker"
          placement="bottom-end"
          @update:value="(v: string) => updateColorValue(formats.picker.parse(v), 'picker')"
        />
      </div>

      <n-divider />

      <div class="color-section-label">
        Formats
      </div>

      <div class="color-grid">
        <div
          v-for="key in outputKeys"
          :key="key"
          class="color-row"
          :class="{ 'color-row--error': formats[key].validation.attrs.validationStatus === 'error' }"
        >
          <span class="color-prompt">&gt;_</span>
          <span class="color-label">{{ formats[key].label }}</span>
          <input
            v-model="formats[key].value.value"
            class="color-value-input"
            :placeholder="formats[key].placeholder"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            @input="(e: Event) => updateColorValue(formats[key].parse((e.target as HTMLInputElement).value), key)"
          />
          <button
            type="button"
            class="color-copy"
            :disabled="!formats[key].value.value"
            :title="copiedLabel === key ? 'Copied!' : 'Copy'"
            @click="copyValue(key, formats[key].value.value)"
          >
            <span v-if="copiedLabel === key" class="color-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.color-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.color-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: background 0.15s;
}

.color-picker {
  flex: 1;
}

.color-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-row {
  display: grid;
  grid-template-columns: auto 60px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.color-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.color-row--error {
  border-color: rgba(200, 60, 60, 0.5);
}

.color-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
}

.color-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.color-value-input {
  background: transparent;
  border: none;
  outline: none;
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  width: 100%;
  min-width: 0;
  caret-color: #1ea54c;
}

.color-value-input::placeholder {
  color: rgba(30, 165, 76, 0.25);
}

.color-copy {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.75);
  cursor: pointer;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  flex-shrink: 0;
}

.color-copy:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.color-copy:disabled {
  opacity: 0.3;
  cursor: default;
}

.color-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 480px) {
  .color-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 7px 10px;
  }

  .color-prompt {
    display: none;
  }

  .color-label {
    font-size: 0.72rem;
  }

  .color-value-input {
    font-size: 0.76rem;
  }
}
</style>
