<script setup lang="ts">
import type { Ipv4RangeExpanderResult } from './ipv4-range-expander.types';
import { useValidation } from '@/composable/validation';
import { isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';
import { calculateCidr } from './ipv4-range-expander.service';

const rawStartAddress = useStorage('ipv4-range-expander:startAddress', '192.168.1.1');
const rawEndAddress = useStorage('ipv4-range-expander:endAddress', '192.168.6.255');

const result = computed(() => calculateCidr({ startIp: rawStartAddress.value, endIp: rawEndAddress.value }));

const calculatedValues: {
  label: string
  getOldValue: (result: Ipv4RangeExpanderResult | undefined) => string | undefined
  getNewValue: (result: Ipv4RangeExpanderResult | undefined) => string | undefined
}[] = [
  {
    label: 'Start address',
    getOldValue: () => rawStartAddress.value,
    getNewValue: result => result?.newStart,
  },
  {
    label: 'End address',
    getOldValue: () => rawEndAddress.value,
    getNewValue: result => result?.newEnd,
  },
  {
    label: 'Addresses in range',
    getOldValue: result => result?.oldSize?.toLocaleString(),
    getNewValue: result => result?.newSize?.toLocaleString(),
  },
  {
    label: 'CIDR',
    getOldValue: () => '',
    getNewValue: result => result?.newCidr,
  },
];

const startIpValidation = useValidation({
  source: rawStartAddress,
  rules: [{ message: 'Invalid ipv4 address', validator: (ip: string) => isValidIpv4({ ip }) }],
});
const endIpValidation = useValidation({
  source: rawEndAddress,
  rules: [{ message: 'Invalid ipv4 address', validator: (ip: string) => isValidIpv4({ ip }) }],
});

const showResult = computed(() => endIpValidation.isValid && startIpValidation.isValid && result.value !== undefined);

const invalidCombination = computed(
  () => startIpValidation.isValid && endIpValidation.isValid && result.value === undefined,
);

function onSwitchStartEndClicked() {
  const tmpStart = rawStartAddress.value;
  rawStartAddress.value = rawEndAddress.value;
  rawEndAddress.value = tmpStart;
}

const copiedLabel = ref<string | null>(null);

async function copyValue(label: string, value: string | undefined) {
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
  <div class="range-tool">
    <div class="range-inputs" mb-3>
      <c-input-text
        v-model:value="rawStartAddress"
        label="Start address"
        placeholder="192.168.1.1"
        :validation="startIpValidation"
        clearable
        autofocus
        font-mono
      />
      <c-input-text
        v-model:value="rawEndAddress"
        label="End address"
        placeholder="192.168.6.255"
        :validation="endIpValidation"
        clearable
        font-mono
      />
    </div>

    <div v-if="invalidCombination" class="kt-alert kt-alert-error" mb-3>
      <div class="kt-alert-title">
        Invalid combination of start and end IPv4 address
      </div>
      <div style="opacity: 0.8; margin-bottom: 12px;">
        The end IPv4 address is lower than the start IPv4 address. This is not valid and no result could be calculated.
      </div>
      <button type="button" class="kt-pill" style="color: inherit; border-color: currentColor;" @click="onSwitchStartEndClicked">
        Switch start and end IPv4 address
      </button>
    </div>

    <div v-if="showResult" class="range-terminal">
      <div class="range-terminal-bar">
        <span class="range-terminal-title">Result</span>
        <div class="range-col-headers">
          <span class="range-h-col">Input</span>
          <span class="range-h-col">Expanded</span>
          <span class="range-h-spacer" />
        </div>
      </div>
      <div
        v-for="{ label, getOldValue, getNewValue } in calculatedValues"
        :key="label"
        class="range-row"
      >
        <span class="range-label">{{ label }}</span>
        <code class="range-old">{{ getOldValue(result) }}</code>
        <code class="range-new">{{ getNewValue(result) }}</code>
        <button
          type="button"
          class="range-copy"
          :title="copiedLabel === label ? 'Copied!' : 'Copy result'"
          @click="copyValue(label, getNewValue(result))"
        >
          <span v-if="copiedLabel === label" class="range-copy-check">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.range-inputs {
  display: flex;
  gap: 16px;
}

/* ── Terminal ── */
.range-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.range-terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(30, 165, 76, 0.2);
}

.range-terminal-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
}

.range-col-headers {
  display: flex;
  gap: 0;
}

.range-h-col {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
  width: 160px;
  text-align: left;
}

.range-h-spacer {
  width: 36px;
}

/* ── Rows ── */
.range-row {
  display: grid;
  grid-template-columns: 140px 1fr 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}

.range-row:last-child { border-bottom: none; }
.range-row:hover { background: rgba(30, 165, 76, 0.05); }

.range-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.range-old {
  color: rgba(255, 255, 255, 0.28);
  font-size: 0.8rem;
  word-break: break-all;
}

.range-new {
  color: #1ea54c;
  font-size: 0.8rem;
  word-break: break-all;
}

.range-copy {
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

.range-copy:hover {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.range-copy-check { color: #1ea54c; font-weight: 700; }

@container (max-width: 560px) {
  .range-inputs { flex-direction: column; gap: 8px; }
  .range-col-headers { display: none; }
  .range-row { grid-template-columns: 100px 1fr 1fr auto; gap: 6px; padding: 6px 8px; }
  .range-label { font-size: 0.7rem; }
  .range-old, .range-new { font-size: 0.74rem; }
}
</style>
