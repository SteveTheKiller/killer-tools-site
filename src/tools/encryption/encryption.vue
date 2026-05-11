<script setup lang="ts">
import { AES, enc, Rabbit, RC4, TripleDES } from 'crypto-js';
import { computedCatch } from '@/composable/computed/catchedComputed';

const algos = { AES, TripleDES, Rabbit, RC4 };
const algoOptions = Object.keys(algos) as (keyof typeof algos)[];

const cypherInput = ref('Lorem ipsum dolor sit amet');
const cypherAlgo = ref<keyof typeof algos>('AES');
const cypherSecret = ref('my secret key');
const cypherOutput = computed(() =>
  algos[cypherAlgo.value].encrypt(cypherInput.value, cypherSecret.value).toString(),
);

const decryptInput = ref('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
const decryptAlgo = ref<keyof typeof algos>('AES');
const decryptSecret = ref('my secret key');
const [decryptOutput, decryptError] = computedCatch(
  () => algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8),
  { defaultValue: '', defaultErrorMessage: 'Unable to decrypt your text' },
);

const cypherAlgoOpen = ref(false);
const decryptAlgoOpen = ref(false);

function closeOnBlur(set: (val: boolean) => void) {
  return (e: FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest?.('.en-dropdown')) {
      set(false);
    }
  };
}
</script>

<template>
  <div class="en-wrap">
    <!-- Encrypt panel -->
    <div class="en-panel kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">ENCRYPT</span>
      </div>
      <div class="en-body">
        <div class="en-row">
          <div class="en-field en-field-grow">
            <span class="en-label">YOUR TEXT</span>
            <textarea
              v-model="cypherInput"
              class="en-textarea"
              rows="5"
              placeholder="The string to encrypt"
              spellcheck="false"
            />
          </div>
          <div class="en-field-col">
            <div class="en-field">
              <span class="en-label">YOUR SECRET KEY</span>
              <input
                v-model="cypherSecret"
                class="en-input"
                type="text"
                placeholder="Secret key..."
                spellcheck="false"
              >
            </div>
            <div class="en-field">
              <span class="en-label">ALGORITHM</span>
              <div class="en-dropdown" tabindex="0" @blur="closeOnBlur(v => cypherAlgoOpen = v)($event)">
                <button type="button" class="en-dropdown-trigger" @click="cypherAlgoOpen = !cypherAlgoOpen">
                  <span>{{ cypherAlgo }}</span>
                  <icon-mdi-chevron-down class="en-chevron" :class="{ 'en-chevron-open': cypherAlgoOpen }" />
                </button>
                <div v-if="cypherAlgoOpen" class="en-dropdown-menu">
                  <button
                    v-for="algo in algoOptions" :key="algo" type="button"
                    class="en-dropdown-item" :class="{ 'en-dropdown-item-active': algo === cypherAlgo }"
                    @click="cypherAlgo = algo; cypherAlgoOpen = false"
                  >
                    {{ algo }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="en-field">
          <span class="en-label">ENCRYPTED OUTPUT</span>
          <textarea class="en-textarea en-textarea-output" :value="cypherOutput" rows="3" readonly spellcheck="false" />
        </div>
      </div>
    </div>

    <!-- Decrypt panel -->
    <div class="en-panel kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">DECRYPT</span>
      </div>
      <div class="en-body">
        <div class="en-row">
          <div class="en-field en-field-grow">
            <span class="en-label">YOUR ENCRYPTED TEXT</span>
            <textarea
              v-model="decryptInput"
              class="en-textarea"
              rows="5"
              placeholder="The ciphertext to decrypt"
              spellcheck="false"
            />
          </div>
          <div class="en-field-col">
            <div class="en-field">
              <span class="en-label">YOUR SECRET KEY</span>
              <input
                v-model="decryptSecret"
                class="en-input"
                type="text"
                placeholder="Secret key..."
                spellcheck="false"
              >
            </div>
            <div class="en-field">
              <span class="en-label">ALGORITHM</span>
              <div class="en-dropdown" tabindex="0" @blur="closeOnBlur(v => decryptAlgoOpen = v)($event)">
                <button type="button" class="en-dropdown-trigger" @click="decryptAlgoOpen = !decryptAlgoOpen">
                  <span>{{ decryptAlgo }}</span>
                  <icon-mdi-chevron-down class="en-chevron" :class="{ 'en-chevron-open': decryptAlgoOpen }" />
                </button>
                <div v-if="decryptAlgoOpen" class="en-dropdown-menu">
                  <button
                    v-for="algo in algoOptions" :key="algo" type="button"
                    class="en-dropdown-item" :class="{ 'en-dropdown-item-active': algo === decryptAlgo }"
                    @click="decryptAlgo = algo; decryptAlgoOpen = false"
                  >
                    {{ algo }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="decryptError" class="en-error">
          <icon-mdi-alert-circle class="en-error-icon" />
          <span>{{ decryptError }}</span>
        </div>
        <div v-else class="en-field">
          <span class="en-label">DECRYPTED OUTPUT</span>
          <textarea class="en-textarea en-textarea-output" :value="decryptOutput" rows="3" readonly spellcheck="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Outer wrapper — 2-col grid at wide viewports */
.en-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
  width: 100%;
}

@media (max-width: 900px) {
  .en-wrap {
    grid-template-columns: 1fr;
  }
}

/* Panel */
.en-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.en-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

/* Row */
.en-row {
  display: flex;
  gap: 14px;
}

.en-field-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

/* Fields */
.en-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.en-field-grow {
  flex: 1.2;
}

/* Label */
.en-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* Textarea */
.en-textarea {
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}

.en-textarea:focus { border-color: rgba(30, 165, 76, 0.5); }
.en-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

.en-textarea-output {
  color: #1ea54c;
  cursor: default;
  resize: none;
}

/* Input */
.en-input {
  height: 32px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 0 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.en-input:focus { border-color: rgba(30, 165, 76, 0.5); }
.en-input::placeholder { color: rgba(255, 255, 255, 0.2); }

/* Dropdown */
.en-dropdown { position: relative; outline: none; }

.en-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
}

.en-dropdown-trigger:hover,
.en-dropdown:focus-within .en-dropdown-trigger {
  border-color: rgba(30, 165, 76, 0.55);
}

.en-chevron {
  margin-left: auto;
  color: rgba(30, 165, 76, 0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.en-chevron-open { transform: rotate(180deg); }

.en-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.en-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(30, 165, 76, 0.06);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.en-dropdown-item:last-child { border-bottom: none; }
.en-dropdown-item:hover { background: rgba(30, 165, 76, 0.1); color: #fff; }
.en-dropdown-item-active { color: #1ea54c; background: rgba(30, 165, 76, 0.08); }

/* Error */
.en-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(200, 50, 50, 0.1);
  border: 1px solid rgba(200, 50, 50, 0.3);
  border-radius: 5px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: #e05555;
}

.en-error-icon { flex-shrink: 0; }
</style>
