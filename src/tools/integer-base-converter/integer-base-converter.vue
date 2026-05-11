<script setup lang="ts">
import { getErrorMessageIfThrows } from '@/utils/error';
import { convertBase } from './integer-base-converter.model';

const input = ref('42');
const inputBase = ref(10);
const outputBase = ref(42);

function errorlessConvert(...args: Parameters<typeof convertBase>) {
  try {
    return convertBase(...args);
  }
  catch { return ''; }
}

const error = computed(() =>
  getErrorMessageIfThrows(() =>
    convertBase({ value: input.value, fromBase: inputBase.value, toBase: outputBase.value }),
  ),
);

const fixedBases = [
  { label: 'Binary', base: 2 },
  { label: 'Octal', base: 8 },
  { label: 'Decimal', base: 10 },
  { label: 'Hexadecimal', base: 16 },
  { label: 'Base64', base: 64 },
];

const copiedLabel = ref<string | null>(null);
async function copyValue(label: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) {
      copiedLabel.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="base-tool">
    <!-- Input outside terminal -->
    <div class="base-input-area">
      <div class="base-input-box">
        <input
          v-model="input"
          class="base-input"
          placeholder="42"
          spellcheck="false"
          autofocus
        >
        <div class="base-input-divider" />
        <div class="base-stepper">
          <span class="base-stepper-label">base</span>
          <button class="base-step-btn" :disabled="inputBase <= 2" @click="inputBase = Math.max(2, inputBase - 1)">
            −
          </button>
          <span class="base-step-val">{{ inputBase }}</span>
          <button class="base-step-btn" :disabled="inputBase >= 64" @click="inputBase = Math.min(64, inputBase + 1)">
            +
          </button>
        </div>
      </div>
      <div v-if="error" class="base-error">
        {{ error }}
      </div>
    </div>

    <div class="base-terminal">
      <!-- Output rows -->
      <div class="base-section-header">
        OUTPUT
      </div>

      <div
        v-for="{ label, base } in fixedBases"
        :key="base"
        class="base-row"
        :class="{ 'base-row-empty': !errorlessConvert({ value: input, fromBase: inputBase, toBase: base }) }"
        @click="copyValue(label, errorlessConvert({ value: input, fromBase: inputBase, toBase: base }))"
      >
        <span class="base-prompt">&gt;_</span>
        <span class="base-label">{{ label }} ({{ base }})</span>
        <span class="base-value">{{ errorlessConvert({ value: input, fromBase: inputBase, toBase: base }) }}</span>
        <span class="base-copy" :class="{ 'base-copy-done': copiedLabel === label }">
          <span v-if="copiedLabel === label">✓</span>
          <icon-mdi-content-copy v-else-if="errorlessConvert({ value: input, fromBase: inputBase, toBase: base })" />
        </span>
      </div>

      <!-- Custom base row -->
      <div
        class="base-row"
        @click="copyValue('custom', errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase }))"
      >
        <span class="base-prompt">&gt;_</span>
        <div class="base-custom-label" @click.stop>
          <span class="base-label">Custom</span>
          <div class="base-mini-stepper">
            <button class="base-mini-btn" :disabled="outputBase <= 2" @click="outputBase = Math.max(2, outputBase - 1)">
              −
            </button>
            <span class="base-mini-val">{{ outputBase }}</span>
            <button class="base-mini-btn" :disabled="outputBase >= 64" @click="outputBase = Math.min(64, outputBase + 1)">
              +
            </button>
          </div>
        </div>
        <span class="base-value">{{ errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase }) }}</span>
        <span class="base-copy" :class="{ 'base-copy-done': copiedLabel === 'custom' }">
          <span v-if="copiedLabel === 'custom'">✓</span>
          <icon-mdi-content-copy v-else-if="errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase })" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-tool {
  flex: 1 1 600px;
  max-width: 1000px;
  container-type: inline-size;
}

.base-terminal {
  background: #121212 !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Input area (outside terminal) ── */
.base-input-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.base-input-box {
  display: flex;
  align-items: center;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 6px;
  transition: border-color 0.15s;
}

.base-input-box:focus-within { border-color: rgba(30, 165, 76, 0.7); }

.base-input {
  flex: 1 1 0;
  min-width: 0;
  background: transparent !important;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  padding: 7px 12px;
  box-sizing: border-box;
}

.base-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.base-input-divider {
  width: 1px;
  height: 22px;
  background: rgba(30, 165, 76, 0.2);
  flex-shrink: 0;
}

.base-stepper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  flex-shrink: 0;
}

.base-stepper-label {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  letter-spacing: 0.04em;
  margin-right: 2px;
}

.base-step-btn {
  width: 26px;
  height: 26px;
  background: transparent !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 4px;
  color: #1ea54c;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.base-step-btn:hover:not(:disabled) { background: rgba(30, 165, 76, 0.1); }
.base-step-btn:disabled { opacity: 0.3; cursor: default; }

.base-step-val {
  min-width: 36px;
  text-align: center;
  font-size: 0.82rem;
  color: #1ea54c;
  padding: 0 4px;
}

.base-error {
  font-size: 0.72rem;
  color: #e05555;
}

/* ── Section header ── */
.base-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
  padding: 5px 12px 3px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Output rows ── */
.base-row {
  display: grid;
  grid-template-columns: auto minmax(0, 140px) 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.base-row:last-child { border-bottom: none; }
.base-row:hover { background: rgba(30, 165, 76, 0.05) !important; }
.base-row-empty { cursor: default; }

.base-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.base-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.base-custom-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-mini-stepper {
  display: inline-flex;
  align-items: center;
}

.base-mini-btn {
  width: 20px;
  height: 20px;
  background: transparent !important;
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 3px;
  color: #1ea54c;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.base-mini-btn:hover:not(:disabled) { background: rgba(30, 165, 76, 0.1); }
.base-mini-btn:disabled { opacity: 0.3; cursor: default; }

.base-mini-val {
  min-width: 28px;
  text-align: center;
  font-size: 0.72rem;
  color: #1ea54c;
  padding: 0 2px;
}

.base-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
  min-width: 0;
}

.base-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.base-row:hover .base-copy { color: rgba(30, 165, 76, 0.8); }
.base-copy-done { color: #1ea54c !important; }

/* ── Light mode ── */
html:not(.dark) .base-input-box {
  background: #f0f0f0;
  border-color: rgba(13, 112, 51, 0.35);
}

html:not(.dark) .base-input {
  color: rgba(0, 0, 0, 0.85);
}

html:not(.dark) .base-input::placeholder { color: rgba(0, 0, 0, 0.30); }

html:not(.dark) .base-input-divider { background: rgba(13, 112, 51, 0.20); }

html:not(.dark) .base-stepper-label { color: rgba(0, 0, 0, 0.45); }

html:not(.dark) .base-step-btn {
  border-color: rgba(13, 112, 51, 0.35);
  color: #083d1a;
}

html:not(.dark) .base-step-val { color: #083d1a; }

html:not(.dark) .base-terminal {
  background: var(--kt-term-bg) !important;
}

html:not(.dark) .base-section-header { color: #0b5c28; }

html:not(.dark) .base-label { color: rgba(0, 0, 0, 0.55); }

html:not(.dark) .base-value { color: #0d7033; }

html:not(.dark) .base-mini-btn {
  border-color: rgba(13, 112, 51, 0.30);
  color: #083d1a;
}

html:not(.dark) .base-mini-val { color: #083d1a; }

html:not(.dark) .base-copy { color: rgba(13, 112, 51, 0.35); }
html:not(.dark) .base-row:hover .base-copy { color: rgba(13, 112, 51, 0.70); }
html:not(.dark) .base-copy-done { color: #0d7033 !important; }
</style>
