<script setup lang="ts">
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { errorsByCategory } from './windows-error-codes.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);

const severityColor = {
  Info: 'default',
  Warning: 'warning',
  Error: 'error',
  Critical: 'error',
} as const;

const allErrors = errorsByCategory.flatMap(({ errors, category }) =>
  errors.map(e => ({ ...e, category })),
);

const { searchResult } = useFuzzySearch({
  search,
  data: allErrors,
  options: {
    keys: [
      { name: 'hex', weight: 3 },
      { name: 'name', weight: 3 },
      { name: 'decimal', weight: 2 },
      'description',
      'category',
    ],
  },
});

const filtered = computed(() => {
  if (!search.value) {
    return errorsByCategory;
  }
  return [{ category: 'Search results', errors: searchResult.value }];
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
      placeholder="Search by hex code, error name, or description..."
      autofocus
      raw-text
      mb-4
    />

    <div v-for="{ errors, category } of filtered" :key="category" class="wec-section">
      <div class="wec-category-header">
        {{ category }}
      </div>

      <div class="wec-grid">
        <div
          v-for="{ hex, decimal, name, description, severity } of errors"
          :key="hex"
          class="kt-terminal wec-card"
        >
          <div
            class="kt-terminal-bar wec-bar"
            :class="{ 'wec-bar-copied': copiedValue === hex }"
            :title="copiedValue === hex ? 'Copied!' : 'Click to copy hex code'"
            @click="copyValue(hex)"
          >
            <span class="kt-prompt">&gt;_</span>
            <code class="wec-hex">{{ copiedValue === hex ? '✓ copied' : hex }}</code>
            <span class="wec-severity" :class="`wec-sev-${severityColor[severity]}`">{{ severity }}</span>
          </div>

          <div class="wec-body">
            <div class="wec-name">
              {{ name }}
            </div>
            <div class="wec-decimal">
              decimal {{ decimal }}
            </div>
            <div class="wec-desc">
              {{ description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.wec-section {
  margin-bottom: 32px;
}

.wec-category-header {
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

.wec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.wec-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.wec-bar-copied {
  background: rgba(var(--kt-accent-rgb), 0.22) !important;
}

.wec-hex {
  flex: 1;
  font-size: 1.35rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.05em;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

html:not(.dark) .wec-hex {
  text-shadow: none;
}

.wec-severity {
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

.wec-sev-default { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }
.wec-sev-warning  { background: rgba(234,179,8,0.12);  color: #ca8a04; border: 1px solid rgba(234,179,8,0.3); }
.wec-sev-error    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

.wec-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wec-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--kt-accent);
  line-height: 1.3;
  word-break: break-word;
}

.wec-decimal {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.78);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  letter-spacing: 0.03em;
}

.wec-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
