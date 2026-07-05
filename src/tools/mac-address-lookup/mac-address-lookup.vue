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
      mb-3
      font-mono
    />

    <div class="kt-terminal">
      <div
        class="kt-terminal-bar"
        :class="{ 'kt-terminal-bar--copied': copied }"
        :style="details ? 'cursor: pointer' : ''"
        :title="details ? (copied ? 'Copied!' : 'Click to copy vendor info') : ''"
        @click="copyVendor"
      >
        <span class="kt-terminal-bar-title">{{ copied ? '✓ copied' : 'Vendor Info' }}</span>
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
/* bar color now from global kt-terminal.css var(--kt-term-bar-bg) */
.kt-row { background: transparent !important; }
.kt-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

.mac-tool {
  flex: 1 1 700px;
  max-width: 1200px;
}

.mac-row {
  grid-template-columns: 1fr;
  padding: 6px 12px;
}
</style>
