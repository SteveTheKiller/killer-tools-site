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

    <div class="kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">Vendor Info</span>
        <button
          type="button"
          class="kt-copy"
          :disabled="!details"
          :title="copied ? 'Copied!' : 'Copy vendor info'"
          @click="copyVendor"
        >
          <span v-if="copied" class="kt-copy-check">✓</span>
          <icon-mdi-content-copy v-else />
        </button>
      </div>

      <template v-if="lines.length">
        <div
          v-for="(line, i) in lines"
          :key="i"
          class="kt-row mac-row"
        >
          <code class="kt-value">{{ line }}</code>
        </div>
      </template>
      <div v-else class="kt-row mac-row">
        <code class="kt-fallback">Unknown vendor for this address</code>
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

.mac-tool {
  flex: 1 1 700px;
  max-width: 1200px;
}

.mac-row {
  grid-template-columns: 1fr;
  padding: 6px 12px;
}
</style>
