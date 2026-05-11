<script setup lang="ts">
import lookup from 'country-code-lookup';
import { getCountries, getCountryCallingCode, parsePhoneNumber } from 'libphonenumber-js/max';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import {
  formatTypeToHumanReadable,
  getDefaultCountryCode,
  getFullCountryName,
} from './phone-parser-and-formatter.models';

const rawPhone = ref('');
const defaultCountryCode = ref(getDefaultCountryCode());
const validation = useValidation({
  source: rawPhone,
  rules: [
    {
      validator: (value: string) => value === '' || /^[0-9 +\-()]+$/.test(value),
      message: 'Invalid phone number',
    },
  ],
});

const sections = computed(() => {
  if (!validation.isValid) {
    return undefined;
  }

  const parsed = withDefaultOnError(() => parsePhoneNumber(rawPhone.value, defaultCountryCode.value), undefined);

  if (!parsed) {
    return undefined;
  }

  return [
    {
      name: 'Location',
      rows: [
        { label: 'Country code', value: parsed.country ?? '' },
        { label: 'Country', value: getFullCountryName(parsed.country) ?? '' },
        { label: 'Calling code', value: parsed.countryCallingCode ? `+${parsed.countryCallingCode}` : '' },
      ],
    },
    {
      name: 'Validation',
      rows: [
        { label: 'Is valid?', value: parsed.isValid() ? 'Yes' : 'No' },
        { label: 'Is possible?', value: parsed.isPossible() ? 'Yes' : 'No' },
        { label: 'Type', value: formatTypeToHumanReadable(parsed.getType()) ?? 'Unknown' },
      ],
    },
    {
      name: 'Formats',
      rows: [
        { label: 'International', value: parsed.formatInternational() },
        { label: 'National', value: parsed.formatNational() },
        { label: 'E.164', value: parsed.format('E.164') },
        { label: 'RFC3966', value: parsed.format('RFC3966') },
      ],
    },
  ];
});

const countriesOptions = getCountries().map(code => ({
  label: `${lookup.byIso(code)?.country || code} (+${getCountryCallingCode(code)})`,
  value: code,
}));

const copiedKey = ref<string | null>(null);
async function copyValue(key: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) {
      copiedKey.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="ph-wrap">
    <div class="ph-terminal">
      <!-- Country selector + input -->
      <div class="ph-input-area">
        <div class="ph-country-row">
          <label class="ph-input-label">Default country</label>
          <c-select
            v-model:value="defaultCountryCode"
            :options="countriesOptions"
            searchable
          />
        </div>
        <label class="ph-input-label">Phone number</label>
        <c-input-text
          v-model:value="rawPhone"
          :validation-status="validation.isValid ? undefined : 'error'"
          :validation-message="validation.message"
          placeholder="+1 800 555 0199"
          raw-text
          autofocus
        />
      </div>

      <!-- Parsed output -->
      <template v-if="sections">
        <template v-for="section in sections" :key="section.name">
          <div class="ph-section-header">
            {{ section.name.toUpperCase() }}
          </div>
          <div
            v-for="row in section.rows"
            :key="row.label"
            class="ph-row"
            :class="{ 'ph-row-empty': !row.value }"
            @click="copyValue(row.label, row.value)"
          >
            <span class="ph-prompt">&gt;_</span>
            <span class="ph-label">{{ row.label }}</span>
            <span v-if="row.value" class="ph-value">{{ row.value }}</span>
            <span v-else class="ph-fallback">—</span>
            <span class="ph-copy-icon" :class="{ 'ph-copy-done': copiedKey === row.label }">
              <span v-if="copiedKey === row.label">✓</span>
              <icon-mdi-content-copy v-else-if="row.value" />
            </span>
          </div>
        </template>
      </template>

      <template v-else-if="validation.isValid && !rawPhone.trim()">
        <div class="ph-empty-state">
          <span class="ph-fallback">Enter a phone number above to parse</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ph-wrap {
  flex: 1 1 500px;
  max-width: 800px;
}

.ph-terminal {
  background: #121212 !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: visible;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ph-input-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--kt-term-bar-border);
  border-radius: 8px 8px 0 0;
}

.ph-country-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.ph-input-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ph-input {
  width: 100%;
  background: transparent !important;
  border: none;
  outline: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  box-sizing: border-box;
  appearance: none;
}

.ph-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.ph-input-error {
  color: #e05555;
}

.ph-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

.ph-empty-state {
  padding: 16px;
}

.ph-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
  padding: 5px 12px 3px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
}

.ph-row {
  display: grid;
  grid-template-columns: auto 120px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.ph-row:last-child {
  border-bottom: none;
}

.ph-row:hover {
  background: rgba(30, 165, 76, 0.05) !important;
}

.ph-row-empty {
  cursor: default;
}

.ph-row-empty:hover {
  background: transparent !important;
}

.ph-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.ph-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.ph-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
  min-width: 0;
}

.ph-fallback {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  font-size: 0.75rem;
}

.ph-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.ph-row:hover .ph-copy-icon {
  color: rgba(30, 165, 76, 0.8);
}

.ph-copy-done {
  color: #1ea54c !important;
}
</style>
