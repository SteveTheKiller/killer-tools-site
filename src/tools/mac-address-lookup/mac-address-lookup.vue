<script setup lang="ts">
import db from 'oui-data';
import { macAddressValidationRules } from '@/utils/macAddress';

const getVendorValue = (address: string) => address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6);

const macAddress = ref('20:37:06:12:34:56');
const details = computed<string | undefined>(() => (db as Record<string, string>)[getVendorValue(macAddress.value)]);
const lines = computed(() => details.value?.split('\n').filter(l => l.trim()) ?? []);

const copied = ref(false);
async function copyVendor() {
  if (!details.value) {
    return;
  }
  await navigator.clipboard.writeText(details.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="mac-tool">
    <c-input-text
      v-model:value="macAddress"
      label="MAC Address"
      placeholder="20:37:06:12:34:56"
      clearable
      autofocus
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :validation-rules="macAddressValidationRules"
      font-mono
      mb-3
    />

    <div class="mac-terminal">
      <div class="mac-terminal-bar">
        <span class="mac-terminal-title">Vendor Info</span>
        <button
          type="button"
          class="mac-copy-btn"
          :disabled="!details"
          :title="copied ? 'Copied!' : 'Copy vendor info'"
          @click="copyVendor"
        >
          <span v-if="copied" class="mac-copy-check">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>

      <template v-if="lines.length">
        <div
          v-for="(line, i) in lines"
          :key="i"
          class="mac-row"
        >
          <code class="mac-value">{{ line }}</code>
        </div>
      </template>
      <div v-else class="mac-row">
        <code class="mac-unknown">Unknown vendor for this address</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mac-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

/* ── Terminal ── */
.mac-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.mac-terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(30, 165, 76, 0.2);
}

.mac-terminal-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
}

/* ── Rows ── */
.mac-row {
  padding: 6px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}

.mac-row:last-child { border-bottom: none; }
.mac-row:hover { background: rgba(30, 165, 76, 0.05); }

.mac-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.6;
  word-break: break-all;
}

.mac-unknown {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.82rem;
  font-style: italic;
  line-height: 1.6;
}

/* ── Copy button ── */
.mac-copy-btn {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.65);
  cursor: pointer;
  padding: 2px 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  flex-shrink: 0;
}

.mac-copy-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.mac-copy-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.mac-copy-check { color: #1ea54c; font-weight: 700; }
</style>
