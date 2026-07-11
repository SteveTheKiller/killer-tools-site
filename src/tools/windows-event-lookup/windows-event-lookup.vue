<script setup lang="ts">
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { eventsByCategory } from './windows-event-lookup.constants';

const search = ref('');
const copiedId = ref<number | null>(null);

const severityColor = {
  Info: 'default',
  Warning: 'warning',
  Error: 'error',
  Critical: 'error',
} as const;

const allEvents = eventsByCategory.flatMap(({ events, category, log }) =>
  events.map(e => ({ ...e, category, log })),
);

const { searchResult } = useFuzzySearch({
  search,
  data: allEvents,
  options: {
    keys: [{ name: 'id', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category', 'log'],
  },
});

const filtered = computed(() => {
  if (!search.value) {
    return eventsByCategory;
  }
  return [{ category: 'Search results', log: '', events: searchResult.value }];
});

function copyId(id: number) {
  navigator.clipboard.writeText(String(id));
  copiedId.value = id;
  setTimeout(() => {
    copiedId.value = null;
  }, 1500);
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1600px; margin-top: 0; min-width: 0; width: 100%;">
    <c-input-text
      v-model:value="search"
      placeholder="Search by event ID, name, or description..."
      autofocus
      raw-text
      mb-4
    />

    <div v-for="{ events, category, log } of filtered" :key="category" class="wel-section">
      <div class="wel-category-header">
        {{ category }}
        <span v-if="log" class="wel-log-badge">{{ log }}</span>
      </div>

      <div class="wel-grid">
        <div
          v-for="{ id, name, description, severity } of events"
          :key="id"
          class="kt-terminal wel-card"
        >
          <div
            class="kt-terminal-bar wel-bar"
            :class="{ 'wel-bar-copied': copiedId === id }"
            :title="copiedId === id ? 'Copied!' : 'Click to copy event ID'"
            @click="copyId(id)"
          >
            <code class="wel-id">{{ copiedId === id ? '✓ copied' : id }}</code>
            <span class="wel-severity" :class="`wel-sev-${severityColor[severity]}`">{{ severity }}</span>
          </div>

          <div class="wel-body">
            <div class="wel-name">
              {{ name }}
            </div>
            <div class="wel-desc">
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

.wel-section {
  margin-bottom: 32px;
}

.wel-category-header {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kt-accent);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  padding: 0 2px 8px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.15);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.wel-log-badge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  color: var(--kt-accent);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.35);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  white-space: nowrap;
}

.wel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.wel-bar {
  padding: 16px 16px 0 !important;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.wel-bar-copied {
  background: rgba(var(--kt-accent-rgb), 0.22) !important;
}

.wel-id {
  line-height: 0.8;
  position: relative;
  top: 1.2px;
  flex: 1;
  font-size: 1.35rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.05em;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

.wel-severity {
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

.wel-sev-default  { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }
.wel-sev-warning  { background: rgba(234,179,8,0.12);   color: #ca8a04; border: 1px solid rgba(234,179,8,0.3); }
.wel-sev-error    { background: rgba(239,68,68,0.12);   color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

.wel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wel-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--kt-accent);
  line-height: 1.3;
  word-break: break-word;
}

.wel-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Light mode ── */
html:not(.dark) .wel-category-header { color: #0d7033 !important; border-bottom-color: rgba(13, 112, 51, 0.20) !important; }

html:not(.dark) .wel-log-badge {
  background: rgba(13, 112, 51, 0.10) !important;
  color: #0b5c28 !important;
  border-color: rgba(13, 112, 51, 0.35) !important;
}

html:not(.dark) .wel-id           { color: rgba(0, 0, 0, 0.85) !important; text-shadow: none; }
html:not(.dark) .wel-name         { color: #0d7033 !important; }
html:not(.dark) .wel-desc         { color: rgba(0, 0, 0, 0.60) !important; border-top-color: rgba(0, 0, 0, 0.08) !important; }

html:not(.dark) .wel-sev-default  { background: rgba(0,0,0,0.06) !important; color: rgba(0,0,0,0.45) !important; border-color: rgba(0,0,0,0.12) !important; }
html:not(.dark) .wel-sev-warning  { color: #92600a !important; border-color: rgba(180,120,0,0.35) !important; }
html:not(.dark) .wel-sev-error    { color: #b02020 !important; border-color: rgba(176,32,32,0.35) !important; background: rgba(176,32,32,0.08) !important; }
</style>
