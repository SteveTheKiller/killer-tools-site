<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import {
  type OutputFormat,
  type PasswordMode,
  type PasswordOptions,
  defaultOptions,
  estimateCrackTime,
  generatePassword,
  getEntropyBits,
  toPhonetic,
} from './password-generator.service';
import { presets } from './presets';
import { useCopy } from '@/composable/copy';
import { useQRCode } from '@/tools/qr-code-generator/useQRCode';

const opts = ref<PasswordOptions>({ ...defaultOptions });
const selectedPreset = ref<string>('custom');
const password = ref<string>('');
const bulkCount = ref<number>(1);
const bulkPasswords = ref<string[]>([]);

function regenerate() {
  password.value = generatePassword(opts.value);
  if (bulkCount.value > 1) {
    bulkPasswords.value = Array.from({ length: bulkCount.value }, () => generatePassword(opts.value));
  }
  else {
    bulkPasswords.value = [];
  }
}

regenerate();

// Flag to suppress the opts watcher when we're programmatically applying a preset.
let applyingPreset = false;

function applyPreset(id: string) {
  const preset = presets.find(p => p.id === id);
  applyingPreset = true;
  selectedPreset.value = id;
  if (preset && id !== 'custom') {
    opts.value = { ...defaultOptions, ...preset.options };
  }
  regenerate();
  nextTick(() => {
    applyingPreset = false;
  });
}

// Any manual change to options: drop back to "custom" and auto-regenerate.
watch(opts, (_, oldValue) => {
  if (applyingPreset || !oldValue) {
    return;
  }
  if (selectedPreset.value !== 'custom') {
    selectedPreset.value = 'custom';
  }
  regenerate();
}, { deep: true });

// Changing the bulk count should also refresh the output.
watch(bulkCount, () => {
  regenerate();
});

const entropy = computed(() => getEntropyBits(password.value, opts.value));
const crackTime = computed(() => estimateCrackTime(entropy.value));
const entropyPercent = computed(() => Math.min(100, Math.round((entropy.value / 128) * 100)));
const entropyColor = computed(() => {
  const bits = entropy.value;
  if (bits < 40) {
    return '#e74c3c';
  }
  if (bits < 60) {
    return '#f39c12';
  }
  if (bits < 80) {
    return '#f1c40f';
  }
  return '#1ea54c';
});

const phonetic = computed(() => toPhonetic(password.value));

const { qrcode } = useQRCode({
  text: password,
  color: {
    background: ref('#0a0a0aff'),
    foreground: ref('#1ea54cff'),
  },
  options: { width: 512, margin: 2 },
});

const { copy } = useCopy({ source: password, text: 'Password copied to the clipboard' });
const { copy: copyBulk } = useCopy({
  source: computed(() => bulkPasswords.value.join('\n')),
  text: 'Passwords copied to the clipboard',
});
const { copy: copyPhonetic } = useCopy({ source: phonetic, text: 'Phonetic spelling copied' });

const modeOptions: Array<{ label: string; value: PasswordMode }> = [
  { label: 'Random', value: 'random' },
  { label: 'Passphrase', value: 'passphrase' },
  { label: 'Pronounceable', value: 'pronounceable' },
  { label: 'Format', value: 'format' },
];

const formatOptions: Array<{ label: string; value: OutputFormat }> = [
  { label: 'Plain', value: 'plain' },
  { label: 'Hex', value: 'hex' },
  { label: 'Base64', value: 'base64' },
  { label: 'Base64-URL', value: 'base64url' },
  { label: 'UUID v4', value: 'uuid' },
];

const separatorOptions = [
  { label: '-', value: '-' },
  { label: '.', value: '.' },
  { label: '_', value: '_' },
  { label: '␣', value: ' ' },
  { label: 'none', value: '' },
];

const showLengthSlider = computed(() => {
  if (opts.value.mode === 'passphrase') {
    return false;
  }
  if (opts.value.mode === 'format' && opts.value.format === 'uuid') {
    return false;
  }
  return true;
});

// Terminal-styled dropdown of common bulk sizes.
const BULK_OPTIONS = [1, 5, 10, 25, 50, 100];
const bulkMenuOpen = ref(false);
const bulkChicletRef = ref<HTMLElement | null>(null);

onClickOutside(bulkChicletRef, () => {
  bulkMenuOpen.value = false;
});

function selectBulkCount(n: number) {
  bulkCount.value = n;
  bulkMenuOpen.value = false;
}
</script>

<template>
  <div class="pg-layout">
    <div class="pg-columns">
      <!-- LEFT: terminal display + controls -->
      <div class="pg-col pg-left">
        <div class="terminal-block">
          <div class="terminal-prompt">
            <span class="prompt-arrow">&gt;_</span>
            <pre class="terminal-text" :class="{ 'no-word-break': opts.mode === 'passphrase' }">{{ password || '...' }}</pre>
          </div>
          <div class="terminal-meta">
            <div class="entropy-row">
              <span><span class="meta-label">Entropy:</span> <strong>{{ Math.round(entropy) }}</strong> bits</span>
              <span><span class="meta-label">Crack:</span> {{ crackTime }}</span>
            </div>
            <div class="entropy-bar">
              <div class="entropy-fill" :style="{ width: `${entropyPercent}%`, background: entropyColor }" />
            </div>
          </div>
          <div class="terminal-actions">
            <c-button @click="copy()">
              Copy
            </c-button>
            <c-button @click="regenerate">
              Refresh
            </c-button>
          </div>
        </div>

        <c-card>
          <!-- Presets -->
          <div class="pg-section-label">
            Preset
          </div>
          <div class="pg-pill-row">
            <button
              v-for="p in presets"
              :key="p.id"
              type="button"
              class="pg-pill"
              :class="{ 'pg-pill-active': selectedPreset === p.id }"
              :title="p.description"
              @click="applyPreset(p.id)"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Mode -->
          <div class="pg-section-label">
            Mode
          </div>
          <div class="pg-pill-row">
            <button
              v-for="m in modeOptions"
              :key="m.value"
              type="button"
              class="pg-pill"
              :class="{ 'pg-pill-active': opts.mode === m.value }"
              @click="opts.mode = m.value"
            >
              {{ m.label }}
            </button>
          </div>

          <!-- Format (only in format mode) -->
          <template v-if="opts.mode === 'format'">
            <div class="pg-section-label">
              Format
            </div>
            <div class="pg-pill-row">
              <button
                v-for="f in formatOptions"
                :key="f.value"
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.format === f.value }"
                @click="opts.format = f.value"
              >
                {{ f.label }}
              </button>
            </div>
          </template>

          <!-- Length (random / pronounceable / non-UUID format) -->
          <template v-if="showLengthSlider">
            <div class="pg-section-label">
              Length ({{ opts.length }})
            </div>
            <n-slider v-model:value="opts.length" :step="1" :min="4" :max="128" />
          </template>

          <!-- Passphrase word count -->
          <template v-if="opts.mode === 'passphrase'">
            <div class="pg-section-label">
              Word count ({{ opts.wordCount }})
            </div>
            <n-slider v-model:value="opts.wordCount" :step="1" :min="3" :max="12" />

            <div class="pg-section-label">
              Separator
            </div>
            <div class="pg-pill-row">
              <button
                v-for="s in separatorOptions"
                :key="s.value"
                type="button"
                class="pg-pill pg-pill-mono"
                :class="{ 'pg-pill-active': opts.wordSeparator === s.value }"
                @click="opts.wordSeparator = s.value"
              >
                {{ s.label }}
              </button>
            </div>
          </template>

          <!-- Character classes (random only) -->
          <template v-if="opts.mode === 'random'">
            <div class="pg-section-label">
              Character classes
            </div>
            <div class="pg-pill-row">
              <button
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.withUppercase }"
                @click="opts.withUppercase = !opts.withUppercase"
              >
                Uppercase
              </button>
              <button
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.withLowercase }"
                @click="opts.withLowercase = !opts.withLowercase"
              >
                Lowercase
              </button>
              <button
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.withNumbers }"
                @click="opts.withNumbers = !opts.withNumbers"
              >
                Numbers
              </button>
              <button
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.withSymbols }"
                @click="opts.withSymbols = !opts.withSymbols"
              >
                Symbols
              </button>
            </div>
          </template>

          <!-- Options row -->
          <template v-if="opts.mode === 'random' || opts.mode === 'pronounceable' || opts.mode === 'passphrase'">
            <div class="pg-section-label">
              Options
            </div>
            <div class="pg-pill-row">
              <button
                v-if="opts.mode === 'random'"
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.excludeAmbiguous }"
                @click="opts.excludeAmbiguous = !opts.excludeAmbiguous"
              >
                Exclude ambiguous
              </button>
              <button
                v-if="opts.mode === 'random'"
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.requireOneOfEach }"
                @click="opts.requireOneOfEach = !opts.requireOneOfEach"
              >
                Require one of each
              </button>
              <button
                v-if="opts.mode === 'passphrase'"
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.capitalizeWords }"
                @click="opts.capitalizeWords = !opts.capitalizeWords"
              >
                Capitalize words
              </button>
              <button
                v-if="opts.mode === 'passphrase' || opts.mode === 'pronounceable'"
                type="button"
                class="pg-pill"
                :class="{ 'pg-pill-active': opts.appendNumber }"
                @click="opts.appendNumber = !opts.appendNumber"
              >
                Append 2 digits
              </button>
            </div>
          </template>
        </c-card>
      </div>

      <!-- MIDDLE: QR code only -->
      <div class="pg-col pg-middle">
        <div class="qr-wrap">
          <div class="qr-frame">
            <n-image :src="qrcode" class="qr-image" />
          </div>
          <div class="qr-caption">
            &gt;_ scan to copy
          </div>
        </div>
      </div>

      <!-- RIGHT: phonetic + number-of-passwords + bulk list -->
      <div class="pg-col pg-right">
        <div v-if="opts.mode !== 'passphrase'" class="terminal-block phonetic-block">
          <div class="terminal-header">
            <span class="terminal-tag">PHONETIC</span>
            <c-button size="small" @click="copyPhonetic()">
              Copy
            </c-button>
          </div>
          <pre class="terminal-body">{{ phonetic }}</pre>
        </div>

        <div ref="bulkChicletRef" class="bulk-chiclet-wrap">
          <button
            type="button"
            class="bulk-chiclet"
            :class="{ 'bulk-chiclet-open': bulkMenuOpen }"
            @click="bulkMenuOpen = !bulkMenuOpen"
          >
            <span class="bulk-chiclet-label">Generate</span>
            <span class="bulk-chiclet-count">&times;{{ bulkCount }}</span>
            <span class="bulk-chiclet-caret">{{ bulkMenuOpen ? '▴' : '▾' }}</span>
          </button>
          <div v-if="bulkMenuOpen" class="bulk-chiclet-menu">
            <button
              v-for="n in BULK_OPTIONS"
              :key="n"
              type="button"
              class="bulk-chiclet-option"
              :class="{ 'bulk-chiclet-option-active': bulkCount === n }"
              @click="selectBulkCount(n)"
            >
              <span class="bulk-chiclet-option-count">&times;{{ n }}</span>
              <span class="bulk-chiclet-option-label">
                {{ n === 1 ? 'single' : `${n} at once` }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="bulkPasswords.length > 1" class="terminal-block bulk-block">
          <div class="terminal-header">
            <span class="terminal-tag">{{ bulkPasswords.length }} PASSWORDS</span>
            <c-button size="small" @click="copyBulk()">
              Copy all
            </c-button>
          </div>
          <pre class="terminal-body bulk-body" :class="{ 'no-word-break': opts.mode === 'passphrase' }">{{ bulkPasswords.join('\n') }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
/* ── Root: break out of default narrow card width (powershell-builder trick) ── */
.pg-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 900px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  container-type: inline-size;
}

/* ── Terminal-style password display ───────────────────────────────── */
.terminal-block {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 8px;
  padding: 16px 20px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.terminal-prompt {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.prompt-arrow {
  color: #1ea54c;
  font-weight: 600;
  font-size: 1.25rem;
  user-select: none;
}

.terminal-text {
  margin: 0;
  color: #1ea54c;
  font-size: 1.3rem;
  line-height: 1.4;
  word-break: break-all;
  white-space: pre-wrap;
  flex: 1;
  min-width: 0;
}

.terminal-meta {
  margin-top: 12px;
}

.entropy-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #1ea54c;
  margin-bottom: 5px;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-label {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
}

.entropy-bar {
  width: 100%;
  height: 5px;
  background: rgba(30, 165, 76, 0.12);
  border-radius: 3px;
  overflow: hidden;
}

.entropy-fill {
  height: 100%;
  transition: width 0.2s ease, background 0.2s ease;
}

.terminal-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

/* ── Two-column body ───────────────────────────────────────────────── */
.pg-columns {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.pg-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pg-left {
  flex: 1 1 480px;
  max-width: 560px;
}

.pg-middle {
  flex: 1 1 280px;
  max-width: 320px;
  align-items: center;
}

.pg-right {
  flex: 1 1 360px;
  max-width: 480px;
}

@container (max-width: 1100px) {
  .pg-columns {
    flex-wrap: wrap;
  }

  .pg-left {
    flex: 1 1 100%;
    max-width: none;
  }

  .pg-middle,
  .pg-right {
    max-width: none;
  }
}

@container (max-width: 700px) {
  .pg-columns {
    flex-direction: column;
  }
}

/* ── Section labels + pill rows (density taken from powershell-builder) ── */
.pg-section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  margin: 10px 0 6px;
  font-weight: 500;
}

.pg-section-label:first-child {
  margin-top: 0;
}

.pg-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 2px;
}

.pg-pill {
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

.pg-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.pg-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

.pg-pill-mono {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  min-width: 32px;
  text-align: center;
}

/* ── Middle + right columns ────────────────────────────────────────── */
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.qr-frame {
  background: #0a0a0a;
  border: 1px solid rgba(30, 165, 76, 0.45);
  border-radius: 10px;
  padding: 12px;
  box-shadow:
    0 0 0 1px rgba(30, 165, 76, 0.08),
    0 0 24px rgba(30, 165, 76, 0.18),
    inset 0 0 32px rgba(30, 165, 76, 0.05);
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.qr-frame:hover {
  border-color: rgba(30, 165, 76, 0.7);
  box-shadow:
    0 0 0 1px rgba(30, 165, 76, 0.15),
    0 0 32px rgba(30, 165, 76, 0.28),
    inset 0 0 32px rgba(30, 165, 76, 0.08);
}

::v-deep(.qr-image) {
  width: 100%;
  aspect-ratio: 1 / 1;
}

::v-deep(.qr-image) img {
  width: 100%;
  height: auto;
  display: block;
}

.qr-caption {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.75);
  letter-spacing: 0.02em;
  margin-top: 2px;
}

.bulk-chiclet-wrap {
  position: relative;
  width: 100%;
}

.bulk-chiclet {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  width: 100%;
  text-align: left;
}

.bulk-chiclet:hover,
.bulk-chiclet-open {
  background: rgba(30, 165, 76, 0.12);
  border-color: #1ea54c;
}

.bulk-chiclet-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
  font-weight: 500;
}

.bulk-chiclet-count {
  color: #1ea54c;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.bulk-chiclet-caret {
  color: rgba(30, 165, 76, 0.65);
  font-size: 0.9rem;
  margin-left: auto;
}

.bulk-chiclet-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.92);
  border: 1px solid rgba(30, 165, 76, 0.5);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 50;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.bulk-chiclet-option {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 7px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, border-color 0.1s;
}

.bulk-chiclet-option:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
}

.bulk-chiclet-option-active {
  background: rgba(30, 165, 76, 0.15);
  border-color: rgba(30, 165, 76, 0.6);
}

.bulk-chiclet-option-count {
  color: #1ea54c;
  font-size: 1.05rem;
  font-weight: 600;
  min-width: 52px;
}

.bulk-chiclet-option-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.8rem;
}

/* ── Shared terminal-block variants for phonetic + bulk ──────────── */
.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.terminal-tag {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
  text-transform: uppercase;
}

.terminal-body {
  margin: 0;
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.phonetic-block {
  padding: 10px 14px;
}

.bulk-block {
  padding: 10px 14px;
}

.bulk-body {
  max-height: 354px;
  overflow-y: auto;
  word-break: break-all;
}

/* Passphrase mode: never split words across lines. */
.no-word-break {
  word-break: normal !important;
  overflow-wrap: normal !important;
}

.bulk-body::-webkit-scrollbar {
  width: 4px;
}

.bulk-body::-webkit-scrollbar-track {
  background: transparent;
}

.bulk-body::-webkit-scrollbar-thumb {
  background: rgba(30, 165, 76, 0.35);
  border-radius: 4px;
}

.bulk-body::-webkit-scrollbar-thumb:hover {
  background: #1ea54c;
}
</style>
