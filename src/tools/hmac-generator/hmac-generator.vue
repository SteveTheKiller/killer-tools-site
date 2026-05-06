<script setup lang="ts">
import type { lib } from 'crypto-js';
import {
  enc,
  HmacMD5,
  HmacRIPEMD160,
  HmacSHA1,
  HmacSHA3,
  HmacSHA224,
  HmacSHA256,
  HmacSHA384,
  HmacSHA512,
} from 'crypto-js';
import { useCopy } from '@/composable/copy';
import { convertHexToBin } from '../hash-text/hash-text.service';

const algos = {
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  SHA3: HmacSHA3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type Encoding = keyof typeof enc | 'Bin';

const encodingOptions: { label: string, value: Encoding }[] = [
  { label: 'Binary (base 2)', value: 'Bin' },
  { label: 'Hexadecimal (base 16)', value: 'Hex' },
  { label: 'Base64', value: 'Base64' },
  { label: 'Base64url', value: 'Base64url' },
];

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const plainText = ref('');
const secret = ref('');
const hashFunction = ref<keyof typeof algos>('SHA256');
const encoding = ref<Encoding>('Hex');
const hmac = computed(() =>
  formatWithEncoding(algos[hashFunction.value](plainText.value, secret.value), encoding.value),
);
const { copy } = useCopy({ source: hmac, text: 'HMAC copied to clipboard' });

// Custom dropdowns
const algoOpen = ref(false);
const encodingOpen = ref(false);

function selectAlgo(val: keyof typeof algos) {
  hashFunction.value = val;
  algoOpen.value = false;
}
function selectEncoding(val: Encoding) {
  encoding.value = val;
  encodingOpen.value = false;
}
function closeOnBlur(set: (val: boolean) => void) {
  return (e: FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest?.('.hm-dropdown')) {
      set(false);
    }
  };
}

const encodingLabel = computed(() => encodingOptions.find(o => o.value === encoding.value)?.label ?? encoding.value);
</script>

<template>
  <div class="hm-wrap">
    <div class="hm-panel">
      <!-- Plain text -->
      <div class="hm-field-col">
        <span class="hm-sublabel">PLAIN TEXT</span>
        <textarea
          v-model="plainText"
          class="hm-textarea"
          placeholder="Plain text to compute the hash..."
          rows="4"
          spellcheck="false"
          autofocus
        />
      </div>

      <!-- Secret key -->
      <div class="hm-field-col">
        <span class="hm-sublabel">SECRET KEY</span>
        <div class="hm-input-row">
          <input
            v-model="secret"
            class="hm-input"
            placeholder="Enter the secret key..."
            type="text"
            spellcheck="false"
          >
          <button v-if="secret" class="hm-icon-btn" title="Clear" @click="secret = ''">
            <icon-mdi-close />
          </button>
        </div>
      </div>

      <!-- Dropdowns row -->
      <div class="hm-selects-row">
        <!-- Hashing function -->
        <div class="hm-field-col hm-field-col-half">
          <span class="hm-sublabel">HASHING FUNCTION</span>
          <div class="hm-dropdown" tabindex="0" @blur="closeOnBlur(v => algoOpen = v)($event)">
            <button type="button" class="hm-dropdown-trigger" @click="algoOpen = !algoOpen">
              <span>{{ hashFunction }}</span>
              <icon-mdi-chevron-down class="hm-chevron" :class="{ 'hm-chevron-open': algoOpen }" />
            </button>
            <div v-if="algoOpen" class="hm-dropdown-menu">
              <button
                v-for="algo in Object.keys(algos)"
                :key="algo"
                type="button"
                class="hm-dropdown-item"
                :class="{ 'hm-dropdown-item-active': algo === hashFunction }"
                @click="selectAlgo(algo as keyof typeof algos)"
              >
                {{ algo }}
              </button>
            </div>
          </div>
        </div>

        <!-- Output encoding -->
        <div class="hm-field-col hm-field-col-half">
          <span class="hm-sublabel">OUTPUT ENCODING</span>
          <div class="hm-dropdown" tabindex="0" @blur="closeOnBlur(v => encodingOpen = v)($event)">
            <button type="button" class="hm-dropdown-trigger" @click="encodingOpen = !encodingOpen">
              <span>{{ encodingLabel }}</span>
              <icon-mdi-chevron-down class="hm-chevron" :class="{ 'hm-chevron-open': encodingOpen }" />
            </button>
            <div v-if="encodingOpen" class="hm-dropdown-menu">
              <button
                v-for="opt in encodingOptions"
                :key="opt.value"
                type="button"
                class="hm-dropdown-item"
                :class="{ 'hm-dropdown-item-active': opt.value === encoding }"
                @click="selectEncoding(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- HMAC output -->
      <div class="hm-field-col">
        <span class="hm-sublabel">HMAC OUTPUT</span>
        <div class="hm-output">
          <span class="hm-output-text">{{ hmac }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="hm-actions">
        <button type="button" class="hm-btn hm-btn-primary" @click="copy()">
          <icon-mdi-content-copy />
          Copy HMAC
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hm-wrap {
  flex: 1 1 540px;
  max-width: 860px;
}

/* ── Panel ── */
.hm-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Field layouts ── */
.hm-field-col {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.hm-selects-row {
  display: flex;
  gap: 12px;
}

.hm-field-col-half {
  flex: 1 1 0;
  min-width: 0;
}

.hm-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Textarea ── */
.hm-textarea {
  width: 100%;
  background: #0f0f11 !important;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.hm-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.hm-textarea:focus {
  border-color: rgba(30, 165, 76, 0.55);
}

/* ── Input row ── */
.hm-input-row {
  display: flex;
  align-items: center;
  width: 100%;
  background: #0f0f11 !important;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.hm-input-row:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.hm-input {
  flex: 1 1 0;
  min-width: 0;
  background: transparent !important;
  border: none;
  outline: none;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
}

.hm-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.hm-icon-btn {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: transparent !important;
  border: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: color 0.12s;
}

.hm-icon-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

/* ── Custom dropdown ── */
.hm-dropdown {
  position: relative;
  outline: none;
}

.hm-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: #0f0f11 !important;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
}

.hm-dropdown-trigger:hover,
.hm-dropdown:focus-within .hm-dropdown-trigger {
  border-color: rgba(30, 165, 76, 0.55);
}

.hm-chevron {
  margin-left: auto;
  color: rgba(30, 165, 76, 0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.hm-chevron-open {
  transform: rotate(180deg);
}

.hm-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.hm-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 14px;
  background: transparent !important;
  border: none;
  border-bottom: 1px solid rgba(30, 165, 76, 0.06);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.hm-dropdown-item:last-child {
  border-bottom: none;
}

.hm-dropdown-item:hover {
  background: rgba(30, 165, 76, 0.1);
  color: #fff;
}

.hm-dropdown-item-active {
  color: #1ea54c;
  background: rgba(30, 165, 76, 0.08);
}

/* ── Output ── */
.hm-output {
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.15);
  border-radius: 5px;
  padding: 10px 12px;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.hm-output-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: #1ea54c;
  word-break: break-all;
  line-height: 1.6;
}

/* ── Actions ── */
.hm-actions {
  display: flex;
  gap: 8px;
}

.hm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: transparent !important;
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.hm-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.65);
  color: #1ea54c;
}

.hm-btn-primary {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}

.hm-btn-primary:hover {
  background: rgba(30, 165, 76, 0.22);
  border-color: #1ea54c;
}
</style>
