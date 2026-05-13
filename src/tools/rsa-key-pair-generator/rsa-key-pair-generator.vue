<script setup lang="ts">
import { computedRefreshableAsync } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { withDefaultOnErrorAsync } from '@/utils/defaults';
import { generateKeyPair } from './rsa-key-pair-generator.service';

const bits = ref(2048);
const emptyCerts = { publicKeyPem: '', privateKeyPem: '' };

const bitsValidation = useValidation({
  source: bits,
  rules: [
    {
      message: 'Bits must be 256–16384 and a multiple of 8',
      validator: (value: number) => value >= 256 && value <= 16384 && value % 8 === 0,
    },
  ],
});

const [certs, refreshCerts] = computedRefreshableAsync(
  () => withDefaultOnErrorAsync(() => generateKeyPair({ bits: bits.value }), emptyCerts),
  emptyCerts,
);

const publicKey = computed(() => certs.value?.publicKeyPem ?? '');
const privateKey = computed(() => certs.value?.privateKeyPem ?? '');

const { copy: copyPublic } = useCopy({ source: publicKey, text: 'Public key copied' });
const { copy: copyPrivate } = useCopy({ source: privateKey, text: 'Private key copied' });

const loading = computed(() => !certs.value?.publicKeyPem && !certs.value?.privateKeyPem);
</script>

<template>
  <div class="rsa-wrap">
    <!-- Controls -->
    <div class="rsa-controls">
      <div class="rsa-bits-field">
        <span class="rsa-label">Bits</span>
        <div class="rsa-input-row" :class="{ 'rsa-input-error': bitsValidation.status === 'error' }">
          <button class="rsa-step-btn" :disabled="bits <= 256" @click="bits = Math.max(256, bits - 8)">
            −
          </button>
          <input
            v-model.number="bits"
            class="rsa-bits-input"
            type="number"
            min="256"
            max="16384"
            step="8"
          >
          <button class="rsa-step-btn" :disabled="bits >= 16384" @click="bits = Math.min(16384, bits + 8)">
            +
          </button>
        </div>
        <span v-if="bitsValidation.message" class="rsa-error-msg">{{ bitsValidation.message }}</span>
      </div>

      <button class="rsa-btn rsa-btn-primary" @click="refreshCerts()">
        <icon-mdi-refresh />
        Refresh key pair
      </button>
    </div>

    <!-- Key panels -->
    <div class="rsa-keys-row">
      <!-- Public key -->
      <div class="rsa-panel kt-terminal">
        <div class="rsa-panel-header kt-terminal-bar">
          <span class="kt-terminal-bar-title">Public Key</span>
          <button class="rsa-copy-btn kt-copy" title="Copy public key" @click="copyPublic()">
            <icon-mdi-content-copy />
            Copy
          </button>
        </div>
        <div class="rsa-key-body">
          <span v-if="loading" class="rsa-generating">Generating...</span>
          <pre v-else class="rsa-key-text">{{ publicKey }}</pre>
        </div>
      </div>

      <!-- Private key -->
      <div class="rsa-panel kt-terminal">
        <div class="rsa-panel-header kt-terminal-bar">
          <span class="kt-terminal-bar-title">Private Key</span>
          <button class="rsa-copy-btn kt-copy" title="Copy private key" @click="copyPrivate()">
            <icon-mdi-content-copy />
            Copy
          </button>
        </div>
        <div class="rsa-key-body">
          <span v-if="loading" class="rsa-generating">Generating...</span>
          <pre v-else class="rsa-key-text">{{ privateKey }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rsa-wrap {
  flex: 1 1 700px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Controls bar ── */
.rsa-controls {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
}

.rsa-bits-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rsa-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.rsa-input-row {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.rsa-input-row:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.rsa-input-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.rsa-step-btn {
  width: 30px;
  height: 32px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.12);
  color: #1ea54c;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.rsa-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.rsa-step-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.1);
}

.rsa-step-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.rsa-bits-input {
  width: 80px;
  background: transparent;
  border: none;
  outline: none;
  padding: 6px 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  text-align: center;
  -moz-appearance: textfield;
  appearance: textfield;
}

.rsa-bits-input::-webkit-inner-spin-button,
.rsa-bits-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.rsa-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Buttons ── */
.rsa-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: transparent;
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  align-self: flex-end;
  height: 32px;
}

.rsa-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.65);
  color: #1ea54c;
}

.rsa-btn-primary {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}

.rsa-btn-primary:hover {
  background: rgba(0, 0, 0, 0.50);
  border-color: #1ea54c;
}

/* ── Key panels row ── */
.rsa-keys-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.rsa-panel {
  flex: 1 1 0;
  min-width: 0;
  width: 0;
}

@media (max-width: 640px) {
  .rsa-keys-row {
    flex-direction: column;
  }
  .rsa-panel {
    width: 100%;
    flex: 1 1 100%;
  }
}

.rsa-copy-btn {
  margin-left: auto;
}

.rsa-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 4px;
  padding: 2px 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.65rem;
  color: rgba(30, 165, 76, 0.6);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.rsa-copy-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.55);
  color: #1ea54c;
}

.rsa-key-body {
  padding: 12px 14px;
}

.rsa-key-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: #1ea54c;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.rsa-generating {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(30, 165, 76, 0.4);
  font-style: italic;
}

/* ── Light mode ── */
html:not(.dark) .rsa-key-text    { color: #0b5c28; }
html:not(.dark) .rsa-generating  { color: rgba(13, 112, 51, 0.55); }
html:not(.dark) .rsa-bits-input  { color: #0d7033 !important; background: transparent !important; }
</style>
