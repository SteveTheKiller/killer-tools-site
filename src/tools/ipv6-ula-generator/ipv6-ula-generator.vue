<script setup lang="ts">
import { SHA1 } from 'crypto-js';
import { macAddressValidation } from '@/utils/macAddress';

const { t } = useI18n();

const macAddress = ref('20:37:06:12:34:56');
const calculatedSections = computed(() => {
  const timestamp = Date.now();
  const hex40bit = SHA1(timestamp + macAddress.value)
    .toString()
    .substring(30);

  const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`;

  return [
    { label: t('tools.ipv6-ula-generator.ui.ipv6Ula'), value: `${ula}::/48` },
    { label: t('tools.ipv6-ula-generator.ui.firstRoutable'), value: `${ula}:0::/64` },
    { label: t('tools.ipv6-ula-generator.ui.lastRoutable'), value: `${ula}:ffff::/64` },
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
      {{ t('tools.ipv6-ula-generator.ui.infoAlert') }}
    </div>

    <c-input-text
      v-model:value="macAddress"
      :label="t('tools.ipv6-ula-generator.ui.macAddress')"
      placeholder="20:37:06:12:34:56"
      mb-3
      clearable
      raw-text
      autofocus
      font-mono
      :validation="addressValidation"
    />

    <div v-if="addressValidation.isValid" class="kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">{{ t('tools.ipv6-ula-generator.ui.output') }}</span>
      </div>
      <div
        v-for="{ label, value } in calculatedSections"
        :key="label"
        class="kt-row ula-row"
      >
        <span class="kt-prompt">&gt;_</span>
        <span class="kt-label">{{ label }}</span>
        <code class="kt-value">{{ value }}</code>
        <button
          type="button"
          class="kt-copy"
          :title="copiedLabel === label ? t('tools.ipv6-ula-generator.ui.copied') : t('tools.ipv6-ula-generator.ui.copy')"
          @click="copyValue(label, value)"
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

.ula-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.ula-row {
  grid-template-columns: auto 130px 1fr auto;
}

@container (max-width: 560px) {
  .ula-row {
    grid-template-columns: auto 100px 1fr auto;
    gap: 6px;
    padding: 6px 8px;
  }
}
</style>
