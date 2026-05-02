<script setup lang="ts">
import type { lib } from 'crypto-js';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';

import { convertHexToBin } from './hash-text.service';
import { useQueryParam } from '@/composable/queryParams';
import { onClickOutside } from '@vueuse/core';

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = keyof typeof enc | 'Bin';
const algoNames = Object.keys(algos) as AlgoNames[];
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');
const copiedAlgo = ref<AlgoNames | null>(null);

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const hashText = (algo: AlgoNames, value: string) => formatWithEncoding(algos[algo](value), encoding.value);

async function copyHash(algo: AlgoNames) {
  const value = hashText(algo, clearText.value);
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedAlgo.value = algo;
  setTimeout(() => {
    if (copiedAlgo.value === algo) copiedAlgo.value = null;
  }, 2000);
}

const encodingOptions = [
  { label: 'Binary (base 2)', value: 'Bin' },
  { label: 'Hexadecimal (base 16)', value: 'Hex' },
  { label: 'Base64 (base 64)', value: 'Base64' },
  { label: 'Base64url (base 64 url-safe)', value: 'Base64url' },
];

const encodingMenuOpen = ref(false);
const encodingMenuRef = ref<HTMLElement | null>(null);
onClickOutside(encodingMenuRef, () => { encodingMenuOpen.value = false; });

const currentEncodingLabel = computed(
  () => encodingOptions.find(o => o.value === encoding.value)?.label ?? encoding.value,
);

function selectEncoding(val: Encoding) {
  encoding.value = val;
  encodingMenuOpen.value = false;
}
</script>

<template>
  <div class="hash-tool">
    <div class="hash-terminal">

      <!-- Input -->
      <div class="hash-input-area">
        <label class="hash-field-label">Your text to hash</label>
        <textarea
          v-model="clearText"
          class="hash-textarea"
          placeholder="Your string to hash..."
          rows="3"
          spellcheck="false"
          autofocus
        />
      </div>

      <!-- Encoding selector -->
      <div ref="encodingMenuRef" class="hash-encoding-area">
        <label class="hash-field-label">Digest encoding</label>
        <button
          type="button"
          class="hash-enc-btn"
          :class="{ 'hash-enc-btn-open': encodingMenuOpen }"
          @click="encodingMenuOpen = !encodingMenuOpen"
        >
          <span class="hash-enc-label">{{ currentEncodingLabel }}</span>
          <span class="hash-enc-caret">{{ encodingMenuOpen ? '▴' : '▾' }}</span>
        </button>
        <div v-if="encodingMenuOpen" class="hash-enc-menu">
          <button
            v-for="opt in encodingOptions"
            :key="opt.value"
            type="button"
            class="hash-enc-option"
            :class="{ 'hash-enc-option-active': encoding === opt.value }"
            @click="selectEncoding(opt.value as Encoding)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Output rows -->
      <div class="hash-section-header">OUTPUT</div>

      <div
        v-for="algo in algoNames"
        :key="algo"
        class="hash-row"
        @click="copyHash(algo)"
      >
        <span class="hash-prompt">&gt;_</span>
        <span class="hash-label">{{ algo }}</span>
        <code class="hash-value">{{ hashText(algo, clearText) }}</code>
        <span class="hash-copy" :class="{ 'hash-copy-done': copiedAlgo === algo }">
          <span v-if="copiedAlgo === algo">✓</span>
          <icon-mdi-content-copy v-else />
        </span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.hash-tool {
  flex: 1 1 900px;
  max-width: 1600px;
  container-type: inline-size;
}

/* ── Terminal container ── */
.hash-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Input area ── */
.hash-input-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Encoding area ── */
.hash-encoding-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
}

.hash-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.hash-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  box-shadow: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
}

.hash-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.hash-enc-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  outline: none;
  padding: 2px 0;
  cursor: pointer;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.12s;
  max-width: 360px;
}

.hash-enc-btn:hover,
.hash-enc-btn-open {
  color: #1ea54c;
}

.hash-enc-label {
  flex: 1;
}

.hash-enc-caret {
  font-size: 0.7rem;
  color: rgba(30, 165, 76, 0.65);
}

.hash-enc-menu {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  min-width: 260px;
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.5);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 50;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.hash-enc-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.hash-enc-option:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.35);
  color: #1ea54c;
}

.hash-enc-option-active {
  background: rgba(30, 165, 76, 0.15);
  border-color: rgba(30, 165, 76, 0.55);
  color: #1ea54c;
}

/* ── Section header ── */
.hash-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Hash rows ── */
.hash-row {
  display: grid;
  grid-template-columns: auto 90px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
}

.hash-row:last-child {
  border-bottom: none;
}

.hash-row:hover {
  background: rgba(30, 165, 76, 0.05);
}

.hash-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  line-height: 1.6;
}

.hash-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.6;
  white-space: nowrap;
}

.hash-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.hash-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
  align-self: start;
  padding-top: 3px;
}

.hash-row:hover .hash-copy {
  color: rgba(30, 165, 76, 0.8);
}

.hash-copy-done {
  color: #1ea54c !important;
}

/* ── Mobile ── */
@container (max-width: 600px) {
  .hash-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .hash-prompt {
    display: none;
  }

  .hash-label {
    font-size: 0.72rem;
  }

  .hash-value {
    font-size: 0.76rem;
  }
}
</style>
