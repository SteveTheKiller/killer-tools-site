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
    <c-card>
      <n-alert type="info" mb-4>
        Uses current timestamp + MAC address, SHA1 hashed. Lower 40 bits form the global ID per RFC 4193.
      </n-alert>

      <div class="ula-section-label">
        MAC Address
      </div>
      <c-input-text
        v-model:value="macAddress"
        placeholder="20:37:06:12:34:56"
        clearable
        raw-text
        :validation="addressValidation"
        font-mono
      />

      <template v-if="addressValidation.isValid">
        <n-divider />
        <div class="ula-section-label">
          Output
        </div>
        <div class="ula-grid">
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
      </template>
    </c-card>
  </div>
</template>

<style scoped>
.ula-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.ula-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.ula-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ula-row {
  display: grid;
  grid-template-columns: auto 130px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.ula-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.ula-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.ula-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
}

.ula-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.ula-copy {
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
  align-self: start;
}

.ula-copy:hover {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.ula-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 560px) {
  .ula-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .ula-prompt {
    display: none;
  }

  .ula-label {
    font-size: 0.72rem;
  }

  .ula-value {
    font-size: 0.76rem;
  }
}
</style>
