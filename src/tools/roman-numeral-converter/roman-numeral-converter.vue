<script setup lang="ts">
import {
  MAX_ARABIC_TO_ROMAN,
  MIN_ARABIC_TO_ROMAN,
  arabicToRoman,
  isValidRomanNumber,
  romanToArabic,
} from './roman-numeral-converter.service';
import { useCopy } from '@/composable/copy';

const arabic = ref('42');
const roman = ref('XLII');
let updating = false;

const arabicValid = computed(() => {
  const n = parseInt(arabic.value);
  return !Number.isNaN(n) && n >= MIN_ARABIC_TO_ROMAN && n <= MAX_ARABIC_TO_ROMAN;
});
const romanValid = computed(() => isValidRomanNumber(roman.value));

watch(arabic, (val) => {
  if (updating) return;
  const n = parseInt(val);
  if (!Number.isNaN(n) && n >= MIN_ARABIC_TO_ROMAN && n <= MAX_ARABIC_TO_ROMAN) {
    updating = true;
    roman.value = arabicToRoman(n);
    nextTick(() => { updating = false; });
  }
});

watch(roman, (val) => {
  if (updating) return;
  if (isValidRomanNumber(val)) {
    updating = true;
    arabic.value = String(romanToArabic(val));
    nextTick(() => { updating = false; });
  }
});

const { copy: copyRoman, copied: copiedRoman } = useCopy({ source: roman, text: 'Roman numeral copied' });
const { copy: copyArabic, copied: copiedArabic } = useCopy({ source: arabic, text: 'Arabic number copied' });
</script>

<template>
  <div class="rn-wrap">
    <div class="rn-panel">
      <!-- Arabic side -->
      <div class="rn-side">
        <span class="rn-sublabel">ARABIC</span>
        <div class="rn-input-wrap" :class="{ 'rn-input-error': arabic && !arabicValid }">
          <input
            v-model="arabic"
            class="rn-input"
            type="number"
            :min="MIN_ARABIC_TO_ROMAN"
            :max="MAX_ARABIC_TO_ROMAN"
            placeholder="1–3999"
            autofocus
            spellcheck="false"
          >
        </div>
        <span v-if="arabic && !arabicValid" class="rn-error-msg">
          Must be {{ MIN_ARABIC_TO_ROMAN }}–{{ MAX_ARABIC_TO_ROMAN.toLocaleString() }}
        </span>
        <button class="rn-copy-btn" :disabled="!arabicValid" @click="copyArabic()">
          <span v-if="copiedArabic">✓ Copied</span>
          <template v-else>
            <icon-mdi-content-copy />
            Copy
          </template>
        </button>
      </div>

      <!-- Divider -->
      <div class="rn-divider">
        <span class="rn-arrows">⟷</span>
      </div>

      <!-- Roman side -->
      <div class="rn-side">
        <span class="rn-sublabel">ROMAN NUMERAL</span>
        <div class="rn-input-wrap" :class="{ 'rn-input-error': roman && !romanValid }">
          <input
            v-model="roman"
            class="rn-input rn-input-roman"
            placeholder="XIV"
            spellcheck="false"
          >
        </div>
        <span v-if="roman && !romanValid" class="rn-error-msg">
          Not a valid Roman numeral
        </span>
        <button class="rn-copy-btn" :disabled="!romanValid" @click="copyRoman()">
          <span v-if="copiedRoman">✓ Copied</span>
          <template v-else>
            <icon-mdi-content-copy />
            Copy
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rn-wrap {
  flex: 1 1 480px;
  max-width: 800px;
}

.rn-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

/* ── Side ── */
.rn-side {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rn-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Input ── */
.rn-input-wrap {
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.rn-input-wrap:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.rn-input-error {
  border-color: rgba(224, 85, 85, 0.45) !important;
}

.rn-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  outline: none;
  padding: 10px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1ea54c;
  box-sizing: border-box;
  -moz-appearance: textfield;
}

.rn-input::-webkit-inner-spin-button,
.rn-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.rn-input::placeholder {
  color: rgba(255, 255, 255, 0.15);
  font-weight: 400;
  font-size: 1rem;
}

/* ── Divider ── */
.rn-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 28px;
  flex-shrink: 0;
}

.rn-arrows {
  font-size: 1.2rem;
  color: rgba(30, 165, 76, 0.35);
  user-select: none;
}

/* ── Error ── */
.rn-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Copy button ── */
.rn-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: rgba(30, 165, 76, 0.08);
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.75rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.rn-copy-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.18);
  border-color: #1ea54c;
  color: #1ea54c;
}

.rn-copy-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
