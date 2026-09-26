<script setup lang="ts">
import type { Ipv4RangeExpanderResult } from './ipv4-range-expander.types';
import { useValidation } from '@/composable/validation';
import { isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';
import { calculateCidr } from './ipv4-range-expander.service';

const { t } = useI18n();

const rawStartAddress = useStorage('ipv4-range-expander:startAddress', '192.168.1.1');
const rawEndAddress = useStorage('ipv4-range-expander:endAddress', '192.168.6.255');

const result = computed(() => calculateCidr({ startIp: rawStartAddress.value, endIp: rawEndAddress.value }));

const calculatedValues = computed<{
  label: string
  getOldValue: (result: Ipv4RangeExpanderResult | undefined) => string | undefined
  getNewValue: (result: Ipv4RangeExpanderResult | undefined) => string | undefined
}[]>(() => [
  {
    label: 'CIDR',
    getOldValue: () => '',
    getNewValue: result => result?.newCidr,
  },
  {
    label: t('tools.ipv4-range-expander.ui.startAddress'),
    getOldValue: () => rawStartAddress.value,
    getNewValue: result => result?.newStart,
  },
  {
    label: t('tools.ipv4-range-expander.ui.endAddress'),
    getOldValue: () => rawEndAddress.value,
    getNewValue: result => result?.newEnd,
  },
  {
    label: t('tools.ipv4-range-expander.ui.addressesInRange'),
    getOldValue: result => result?.oldSize?.toLocaleString(),
    getNewValue: result => result?.newSize?.toLocaleString(),
  },
]);

const startIpValidation = useValidation({
  source: rawStartAddress,
  rules: [{ message: t('tools.ipv4-range-expander.ui.invalidIpv4'), validator: (ip: string) => isValidIpv4({ ip }) }],
});
const endIpValidation = useValidation({
  source: rawEndAddress,
  rules: [{ message: t('tools.ipv4-range-expander.ui.invalidIpv4'), validator: (ip: string) => isValidIpv4({ ip }) }],
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
    <div class="range-fields" mb-3>
      <c-input-text
        v-model:value="rawStartAddress"
        :label="t('tools.ipv4-range-expander.ui.startAddress')"
        placeholder="192.168.1.1"
        :validation="startIpValidation"
        clearable
        autofocus
        font-mono
      />
      <c-input-text
        v-model:value="rawEndAddress"
        :label="t('tools.ipv4-range-expander.ui.endAddress')"
        placeholder="192.168.6.255"
        :validation="endIpValidation"
        clearable
        font-mono
      />
    </div>

    <div v-if="invalidCombination" class="kt-alert kt-alert-error" mb-3>
      <div class="kt-alert-title">
        {{ t('tools.ipv4-range-expander.ui.invalidCombinationTitle') }}
      </div>
      <div style="opacity: 0.8; margin-bottom: 12px;">
        {{ t('tools.ipv4-range-expander.ui.invalidCombinationDescription') }}
      </div>
      <button type="button" class="kt-pill" style="color: inherit; border-color: currentColor;" @click="onSwitchStartEndClicked">
        {{ t('tools.ipv4-range-expander.ui.switchStartEnd') }}
      </button>
    </div>

    <div v-if="showResult" class="kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">{{ t('tools.ipv4-range-expander.ui.result') }}</span>
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
          :title="copiedLabel === label ? t('tools.ipv4-range-expander.ui.copied') : t('tools.ipv4-range-expander.ui.copyResult')"
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
/* bar color now from global kt-terminal.css var(--kt-term-bar-bg) */
.kt-row { background: transparent !important; }
.kt-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

.range-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.range-fields {
  display: flex;
  gap: 16px;
}

.range-row {
  grid-template-columns: auto 140px 1fr 1fr auto;
}

@container (max-width: 560px) {
  .range-fields { flex-direction: column; gap: 8px; }
  .range-row { grid-template-columns: auto 110px 1fr 1fr auto; gap: 6px; padding: 6px 8px; }
}

/* Very small screens: drop "before" value column, wrap label */
@container (max-width: 400px) {
  .range-row { grid-template-columns: auto 1fr auto auto; gap: 4px; padding: 6px 8px; }
  .range-row .kt-value-faded { display: none; }
  .range-row .kt-label { white-space: normal; font-size: 0.7rem; }
}
</style>
