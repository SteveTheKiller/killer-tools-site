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
    <c-card>
      <div class="mac-section-label">
        MAC Address
      </div>
      <c-input-text
        v-model:value="macAddress"
        placeholder="20:37:06:12:34:56"
        clearable
        autofocus
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :validation-rules="macAddressValidationRules"
        font-mono
      />

      <div class="kt-divider" />

      <div class="mac-section-label">
        Vendor Info
      </div>
      <div class="mac-terminal">
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

        <template v-if="lines.length">
          <div
            v-for="(line, i) in lines"
            :key="i"
            class="mac-line"
          >
            <span class="mac-prompt">&gt;_</span>
            <code class="mac-value">{{ line }}</code>
          </div>
        </template>
        <div v-else class="mac-line mac-empty">
          <span class="mac-prompt">&gt;_</span>
          <code class="mac-unknown">Unknown vendor for this address</code>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.mac-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.mac-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.mac-terminal {
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  padding-right: 52px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mac-copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.75);
  cursor: pointer;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
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

.mac-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

.mac-line {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.mac-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  flex-shrink: 0;
}

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
</style>
