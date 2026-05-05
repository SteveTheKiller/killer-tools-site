<script setup lang="ts">
import { SHA1 } from 'crypto-js';
import { macAddressValidation } from '@/utils/macAddress';

const macAddress = ref('20:37:06:12:34:56');
const calculatedSections = computed(() => {
  const timestamp = Date.now();
  const hex40bit = SHA1(timestamp + macAddress.value)
    .toString()
    .substring(30);

  const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`;

  return [
    { label: 'IPv6 ULA', value: `${ula}::/48` },
    { label: 'First routable', value: `${ula}:0::/64` },
    { label: 'Last routable', value: `${ula}:ffff::/64` },
  ];
});

const addressValidation = macAddressValidation(macAddress);

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
  <div class="ula-tool">
    <div class="kt-alert kt-alert-info" mb-3>
      Uses current timestamp + MAC address, SHA1 hashed. Lower 40 bits form the global ID per RFC 4193.
    </div>

    <c-input-text
      v-model:value="macAddress"
      label="MAC Address"
      placeholder="20:37:06:12:34:56"
      clearable
      raw-text
      autofocus
      :validation="addressValidation"
      font-mono
      mb-3
    />

    <div v-if="addressValidation.isValid" class="ula-terminal">
      <div class="ula-terminal-bar">
        <span class="ula-terminal-title">Output</span>
      </div>
      <div
        v-for="{ label, value } in calculatedSections"
        :key="label"
        class="ula-row"
      >
        <span class="ula-prompt">&gt;_</span>
        <span class="ula-label">{{ label }}</span>
        <code class="ula-value">{{ value }}</code>
        <button
          type="button"
          class="ula-copy"
          :title="copiedLabel === label ? 'Copied!' : 'Copy'"
          @click="copyValue(label, value)"
        >
          <span v-if="copiedLabel === label" class="ula-copy-check">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ula-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

/* ── Terminal ── */
.ula-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ula-terminal-bar {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(30, 165, 76, 0.2);
}

.ula-terminal-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
}

/* ── Rows ── */
.ula-row {
  display: grid;
  grid-template-columns: auto 130px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}

.ula-row:last-child { border-bottom: none; }
.ula-row:hover { background: rgba(30, 165, 76, 0.05); }

.ula-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.ula-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.ula-value {
  color: #1ea54c;
  font-size: 0.8rem;
  word-break: break-all;
  min-width: 0;
}

.ula-copy {
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

.ula-copy:hover {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.ula-copy-check { color: #1ea54c; font-weight: 700; }

@container (max-width: 560px) {
  .ula-row { grid-template-columns: 100px 1fr auto; gap: 6px; padding: 6px 8px; }
  .ula-prompt { display: none; }
  .ula-label { font-size: 0.7rem; }
  .ula-value { font-size: 0.74rem; }
}
</style>
