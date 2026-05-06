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

    <div v-if="showResult" class="kt-terminal">
      <div class="kt-terminal-bar range-bar">
        <span class="kt-terminal-bar-title">Result</span>
        <div class="range-col-headers">
          <span class="range-h-col">Input</span>
          <span class="range-h-col">Expanded</span>
          <span class="range-h-spacer" />
        </div>
      </div>
      <div class="kt-section-row">
        CIDR EXPANSION
      </div>
      <div
        v-for="{ label, getOldValue, getNewValue } in calculatedValues"
        :key="label"
        class="kt-row range-row"
      >
        <span class="kt-prompt">&gt;_</span>
        <span class="kt-label">{{ label }}</span>
        <code class="kt-value-faded">{{ getOldValue(result) }}</code>
        <code class="kt-value">{{ getNewValue(result) }}</code>
        <button
          type="button"
          class="kt-copy"
          :title="copiedLabel === label ? 'Copied!' : 'Copy result'"
          @click="copyValue(label, getNewValue(result))"
        >
          <span v-if="copiedLabel === label" class="kt-copy-check">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped overrides beat NaiveUI's injected backgrounds */
.kt-terminal { background: #0a0a0c !important; }
.kt-terminal-bar { background: #0f0f11 !important; }
.kt-row { background: transparent !important; }
.kt-row:hover { background: rgba(30, 165, 76, 0.05) !important; }

.range-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.range-inputs {
  display: flex;
  gap: 16px;
}

.range-row {
  grid-template-columns: auto 140px 1fr 1fr auto;
}

.range-bar {
  justify-content: space-between;
}

.range-col-headers {
  display: flex;
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

@container (max-width: 560px) {
  .range-inputs { flex-direction: column; gap: 8px; }
  .range-col-headers { display: none; }
  .range-row { grid-template-columns: auto 100px 1fr 1fr auto; gap: 6px; padding: 6px 8px; }
}
</style>
