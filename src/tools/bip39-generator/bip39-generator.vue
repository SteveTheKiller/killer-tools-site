<script setup lang="ts">
import {
  chineseSimplifiedWordList,
  chineseTraditionalWordList,
  czechWordList,
  englishWordList,
  entropyToMnemonic,
  frenchWordList,
  generateEntropy,
  italianWordList,
  japaneseWordList,
  koreanWordList,
  mnemonicToEntropy,
  portugueseWordList,
  spanishWordList,
} from '@it-tools/bip39';

import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const languages = {
  'English': englishWordList,
  'Chinese simplified': chineseSimplifiedWordList,
  'Chinese traditional': chineseTraditionalWordList,
  'Czech': czechWordList,
  'French': frenchWordList,
  'Italian': italianWordList,
  'Japanese': japaneseWordList,
  'Korean': koreanWordList,
  'Portuguese': portugueseWordList,
  'Spanish': spanishWordList,
};

const entropy = ref(generateEntropy());
const passphraseInput = ref('');

const language = ref<keyof typeof languages>('English');
const passphrase = computed({
  get() {
    return withDefaultOnError(() => entropyToMnemonic(entropy.value, languages[language.value]), passphraseInput.value);
  },
  set(value: string) {
    passphraseInput.value = value;
    entropy.value = withDefaultOnError(() => mnemonicToEntropy(value, languages[language.value]), '');
  },
});

const entropyValidation = useValidation({
  source: entropy,
  rules: [
    {
      validator: (value: string) => value === '' || (value.length <= 32 && value.length >= 16 && value.length % 4 === 0),
      message: 'Entropy length should be >= 16, <= 32 and be a multiple of 4',
    },
    {
      validator: (value: string) => /^[a-f0-9]*$/i.test(value),
      message: 'Entropy should be a hexadecimal string',
    },
  ],
});

const mnemonicValidation = useValidation({
  source: passphrase,
  rules: [
    {
      validator: (value: string) => isNotThrowing(() => mnemonicToEntropy(value, languages[language.value])),
      message: 'Invalid mnemonic',
    },
  ],
});

function refreshEntropy() {
  entropy.value = generateEntropy();
}

const dropdownOpen = ref(false);
function selectLanguage(lang: keyof typeof languages) {
  language.value = lang;
  dropdownOpen.value = false;
}

function onDropdownBlur(e: FocusEvent) {
  const rel = e.relatedTarget as HTMLElement | null;
  if (!rel?.closest?.('.bip-dropdown')) {
    dropdownOpen.value = false;
  }
}

const { copy: copyEntropy } = useCopy({ source: entropy, text: 'Entropy copied to the clipboard' });
const { copy: copyPassphrase } = useCopy({ source: passphrase, text: 'Passphrase copied to the clipboard' });
</script>

<template>
  <div class="bip-wrap">
    <div class="bip-panel">
      <div class="bip-body">
        <!-- Language -->
        <div class="bip-lang-row">
          <span class="bip-label">Language</span>
          <div class="bip-dropdown" tabindex="0" @blur="onDropdownBlur">
            <button
              class="bip-dropdown-trigger"
              type="button"
              @click="dropdownOpen = !dropdownOpen"
            >
              <span>{{ language }}</span>
              <icon-mdi-chevron-down class="bip-dropdown-chevron" :class="{ 'bip-chevron-open': dropdownOpen }" />
            </button>
            <div v-if="dropdownOpen" class="bip-dropdown-menu">
              <button
                v-for="lang in Object.keys(languages)"
                :key="lang"
                type="button"
                class="bip-dropdown-item"
                :class="{ 'bip-dropdown-item-active': lang === language }"
                @click="selectLanguage(lang as keyof typeof languages)"
              >
                {{ lang }}
              </button>
            </div>
          </div>
        </div>

        <!-- Entropy -->
        <div class="bip-field bip-field-col">
          <span class="bip-sublabel">ENTROPY (SEED)</span>
          <div class="bip-input-row" :class="{ 'bip-error': entropyValidation.status === 'error' }">
            <input
              v-model="entropy"
              class="bip-input bip-mono"
              placeholder="Hex entropy..."
              spellcheck="false"
            >
            <button class="bip-icon-btn" title="Regenerate" @click="refreshEntropy()">
              <icon-mdi-refresh />
            </button>
            <button class="bip-icon-btn" title="Copy entropy" @click="copyEntropy()">
              <icon-mdi-content-copy />
            </button>
          </div>
          <span v-if="entropyValidation.message" class="bip-error-msg">{{ entropyValidation.message }}</span>
        </div>

        <!-- Passphrase -->
        <div class="bip-field bip-field-col">
          <span class="bip-sublabel">PASSPHRASE (MNEMONIC)</span>
          <div class="bip-input-row bip-input-row-ta" :class="{ 'bip-error': mnemonicValidation.status === 'error' }">
            <textarea
              :value="passphrase"
              class="bip-input bip-mono bip-passphrase"
              placeholder="Mnemonic words..."
              spellcheck="false"
              rows="3"
              @input="passphrase = ($event.target as HTMLTextAreaElement).value"
            />
            <button class="bip-icon-btn bip-icon-btn-ta" title="Copy passphrase" @click="copyPassphrase()">
              <icon-mdi-content-copy />
            </button>
          </div>
          <span v-if="mnemonicValidation.message" class="bip-error-msg">{{ mnemonicValidation.message }}</span>
        </div>

        <!-- Word chips -->
        <div v-if="passphrase && !mnemonicValidation.message" class="bip-word-grid bip-word-grid-3col">
          <span
            v-for="(word, i) in passphrase.trim().split(/\s+/)"
            :key="i"
            class="bip-word-chip"
          >
            <span class="bip-word-idx">{{ i + 1 }}</span>
            {{ word }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bip-wrap {
  flex: 1 1 540px;
  max-width: 900px;
}

/* ── Panel ── */
.bip-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.25);
  border-radius: 8px;
  overflow: hidden;
}

.bip-panel-header {
  padding: 5px 14px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.bip-panel-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.bip-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Language row (inline, auto-width select) ── */
.bip-lang-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Fields ── */
.bip-field {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px;
}

.bip-field-col {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.bip-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.bip-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Custom dropdown ── */
.bip-dropdown {
  position: relative;
  display: inline-block;
  outline: none;
}

.bip-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 6px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: border-color 0.15s;
  white-space: nowrap;
  min-width: 180px;
}

.bip-dropdown-trigger:hover,
.bip-dropdown:focus-within .bip-dropdown-trigger {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.bip-dropdown-chevron {
  margin-left: auto;
  color: rgba(var(--kt-accent-rgb), 0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.bip-chevron-open {
  transform: rotate(180deg);
}

.bip-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.bip-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.06);
}

.bip-dropdown-item:last-child {
  border-bottom: none;
}

.bip-dropdown-item:hover {
  background: rgba(var(--kt-accent-rgb), 0.1);
  color: #fff;
}

.bip-dropdown-item-active {
  color: var(--kt-accent);
  background: rgba(var(--kt-accent-rgb), 0.08);
}

/* ── Input row (input + icon buttons) ── */
.bip-input-row {
  display: flex;
  align-items: center;
  width: 100%;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.bip-input-row:focus-within {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.bip-input-row.bip-error {
  border-color: rgba(224, 85, 85, 0.5);
}

.bip-input-row-ta {
  align-items: flex-start;
}

.bip-input {
  flex: 1 1 0;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 7px 10px;
  font-size: 0.8rem;
  color: #fff;
  resize: none;
  line-height: 1.5;
}

.bip-mono {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.bip-passphrase {
  color: var(--kt-accent);
}

.bip-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.bip-icon-btn-ta {
  margin-top: 4px;
}

.bip-icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-left: 1px solid rgba(var(--kt-accent-rgb), 0.12);
  color: rgba(var(--kt-accent-rgb), 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.12s, color 0.12s;
}

.bip-icon-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.1);
  color: var(--kt-accent);
}

.bip-error-msg {
  font-size: 0.68rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
  padding-left: 2px;
}

/* ── Word chips ── */
.bip-word-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
}

.bip-word-grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.bip-word-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(var(--kt-accent-rgb), 0.08);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 4px;
  padding: 3px 8px 3px 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: var(--kt-accent);
}

.bip-word-idx {
  font-size: 0.6rem;
  color: rgba(var(--kt-accent-rgb), 0.45);
  min-width: 14px;
  text-align: right;
}

/* ── Light mode ── */
html:not(.dark) .bip-passphrase       { color: #0b5c28; }
html:not(.dark) .bip-input            { color: rgba(0, 0, 0, 0.80); }
html:not(.dark) .bip-input::placeholder { color: rgba(0, 0, 0, 0.30); }

html:not(.dark) .bip-word-chip {
  background: rgba(13, 112, 51, 0.10);
  border-color: rgba(13, 112, 51, 0.25);
  color: #0b5c28;
}
html:not(.dark) .bip-word-idx         { color: rgba(13, 112, 51, 0.50); }

html:not(.dark) .bip-icon-btn         { color: rgba(13, 112, 51, 0.55); border-left-color: rgba(0, 0, 0, 0.08); }
html:not(.dark) .bip-icon-btn:hover   { color: #0b5c28; background: rgba(13, 112, 51, 0.10); }

html:not(.dark) .bip-dropdown-trigger {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.18);
  color: rgba(0, 0, 0, 0.80);
}
html:not(.dark) .bip-dropdown-chevron { color: rgba(13, 112, 51, 0.60); }
html:not(.dark) .bip-dropdown-menu    { background: #fff; border-color: rgba(13, 112, 51, 0.25); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
html:not(.dark) .bip-dropdown-item    { color: rgba(0, 0, 0, 0.65); border-bottom-color: rgba(0,0,0,0.06); }
html:not(.dark) .bip-dropdown-item:hover { background: rgba(13, 112, 51, 0.08); color: #083d1a; }
html:not(.dark) .bip-dropdown-item-active { color: #0b5c28; background: rgba(13, 112, 51, 0.10); }
</style>
