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
    <div class="base-terminal">
      <!-- Input area -->
      <div class="base-input-area">
        <div class="base-input-row">
          <div class="base-field base-field-grow">
            <label class="base-field-label">Number</label>
            <input
              v-model="input"
              class="base-input"
              placeholder="42"
              spellcheck="false"
              autofocus
            >
          </div>
          <div class="base-field">
            <label class="base-field-label">Input base</label>
            <div class="base-stepper">
              <button class="base-step-btn" :disabled="inputBase <= 2" @click="inputBase = Math.max(2, inputBase - 1)">
                −
              </button>
              <span class="base-step-val">{{ inputBase }}</span>
              <button class="base-step-btn" :disabled="inputBase >= 64" @click="inputBase = Math.min(64, inputBase + 1)">
                +
              </button>
            </div>
          </div>
        </div>
        <div v-if="error" class="base-error">
          {{ error }}
        </div>
      </div>

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
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Input area ── */
.base-input-area {
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.base-input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.base-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-field-grow {
  flex: 1 1 200px;
  min-width: 0;
}

.base-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

.base-input {
  width: 100%;
  background: transparent !important;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  box-sizing: border-box;
}

.base-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.base-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0;
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
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Output rows ── */
.base-row {
  display: grid;
  grid-template-columns: auto 170px 1fr auto;
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
</style>
