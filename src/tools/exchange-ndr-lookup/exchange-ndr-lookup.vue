<script setup lang="ts">
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { ndrCategories } from './exchange-ndr-lookup.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);

const severityColor = {
  Info: 'default',
  Warning: 'warning',
  Error: 'error',
  Critical: 'error',
} as const;

const allCodes = ndrCategories.flatMap(({ codes, category }) =>
  codes.map(c => ({ ...c, category })),
);

const { searchResult } = useFuzzySearch({
  search,
  data: allCodes,
  options: {
    keys: [
      { name: 'code', weight: 3 },
      { name: 'name', weight: 2 },
      'description',
      'cause',
      'fix',
      'category',
    ],
  },
});

const filtered = computed(() => {
  if (!search.value) {
    return ndrCategories;
  }
  return [{ category: 'Search results', codes: searchResult.value }];
});

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <c-input-text
      v-model:value="search"
      placeholder="Search by NDR code, error name, cause, or fix..."
      autofocus
      raw-text
      mb-4
    />

    <div v-for="{ codes, category } of filtered" :key="category" class="ndr-section">
      <div class="ndr-category-header">
        {{ category }}
      </div>

      <div class="ndr-grid">
        <div
          v-for="{ code, name, description, cause, fix, severity } of codes"
          :key="code"
          class="kt-terminal ndr-card"
        >
          <div
            class="kt-terminal-bar ndr-bar"
            :class="{ 'ndr-bar-copied': copiedValue === code }"
            :title="copiedValue === code ? 'Copied!' : 'Click to copy NDR code'"
            @click="copyValue(code)"
          >
            <code class="ndr-code">{{ copiedValue === code ? '✓ copied' : code }}</code>
            <span class="ndr-severity" :class="`ndr-sev-${severityColor[severity]}`">{{ severity }}</span>
          </div>

          <div class="ndr-body">
            <div class="ndr-name">
              {{ name }}
            </div>
            <div class="ndr-description">
              {{ description }}
            </div>
            <div class="ndr-kv-block">
              <div class="ndr-kv-row">
                <span class="ndr-kv-label">Cause</span>
                <span class="ndr-kv-value">{{ cause }}</span>
              </div>
              <div class="ndr-kv-row">
                <span class="ndr-kv-label">Fix</span>
                <span class="ndr-kv-value ndr-kv-fix">{{ fix }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.ndr-section {
  margin-bottom: 32px;
}

.ndr-category-header {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kt-accent);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  padding: 0 2px 8px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.15);
  margin-bottom: 12px;
}

.ndr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 10px;
}

.ndr-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.ndr-bar-copied {
  background: rgba(var(--kt-accent-rgb), 0.22) !important;
}

.ndr-code {
  flex: 1;
  font-size: 1.35rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.05em;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

html:not(.dark) .ndr-code {
  color: #1a1a1a;
  text-shadow: none;
}

.ndr-severity {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ndr-sev-default { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }
.ndr-sev-warning  { background: rgba(234,179,8,0.12);  color: #ca8a04; border: 1px solid rgba(234,179,8,0.3); }
.ndr-sev-error    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

.ndr-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ndr-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--kt-accent);
  line-height: 1.3;
}

.ndr-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.ndr-kv-block {
  border-radius: 5px;
  overflow: hidden;
  margin-top: 2px;
}

.ndr-kv-row {
  display: grid;
  grid-template-columns: 46px 1fr;
  font-size: 0.75rem;
  padding: 5px 10px;
  gap: 8px;
}

.ndr-kv-row + .ndr-kv-row {
  border-top: 1px solid rgba(var(--kt-accent-rgb), 0.08);
}

.ndr-kv-label {
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding-top: 1px;
}

.ndr-kv-value {
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
}

.ndr-kv-fix {
  color: var(--kt-accent);
}
</style>
