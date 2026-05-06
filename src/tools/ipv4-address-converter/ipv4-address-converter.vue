<script setup lang="ts">
import { useValidation } from '@/composable/validation';
import { convertBase } from '../integer-base-converter/integer-base-converter.model';
import { ipv4ToInt, ipv4ToIpv6, isValidIpv4 } from './ipv4-address-converter.service';

const rawIpAddress = useStorage('ipv4-converter:ip', '192.168.1.1');

const convertedSections = computed(() => {
  const ipInDecimal = ipv4ToInt({ ip: rawIpAddress.value });

  return [
    { label: 'Decimal', value: String(ipInDecimal) },
    { label: 'Hexadecimal', value: convertBase({ fromBase: 10, toBase: 16, value: String(ipInDecimal) }).toUpperCase() },
    { label: 'Binary', value: convertBase({ fromBase: 10, toBase: 2, value: String(ipInDecimal) }) },
    { label: 'IPv6', value: ipv4ToIpv6({ ip: rawIpAddress.value }) },
    { label: 'IPv6 (short)', value: ipv4ToIpv6({ ip: rawIpAddress.value, prefix: '::ffff:' }) },
  ];
});

const { attrs: validationAttrs } = useValidation({
  source: rawIpAddress,
  rules: [{ message: 'Invalid ipv4 address', validator: (ip: string) => isValidIpv4({ ip }) }],
});

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

const isError = computed(() => validationAttrs.validationStatus === 'error');
</script>

<template>
  <div class="ip-tool">
    <c-card>
      <div class="ip-section-label">
        IPv4 Address
      </div>
      <c-input-text
        v-model:value="rawIpAddress"
        placeholder="192.168.1.1"
        font-mono
        autofocus
      />

      <div class="kt-divider" />

      <div class="ip-section-label">
        Output
      </div>

      <div class="ip-grid">
        <div
          v-for="{ label, value } in convertedSections"
          :key="label"
          class="ip-row"
        >
          <span class="ip-prompt">&gt;_</span>
          <span class="ip-label">{{ label }}</span>
          <code class="ip-value">{{ isError ? '' : value }}</code>
          <button
            type="button"
            class="ip-copy"
            :title="copiedLabel === label ? 'Copied!' : 'Copy'"
            :disabled="isError"
            @click="copyValue(label, value)"
          >
            <span v-if="copiedLabel === label" class="ip-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.ip-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.ip-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.ip-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ip-row {
  display: grid;
  grid-template-columns: auto 110px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 14px;
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.ip-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.ip-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.ip-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
}

.ip-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.ip-copy {
  background: transparent !important;
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

.ip-copy:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.ip-copy:disabled {
  opacity: 0.3;
  cursor: default;
}

.ip-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 560px) {
  .ip-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .ip-prompt {
    display: none;
  }

  .ip-label {
    font-size: 0.72rem;
  }

  .ip-value {
    font-size: 0.76rem;
  }
}
</style>
