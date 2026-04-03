<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { eventsByCategory } from './windows-event-lookup.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

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
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <c-input-text
      v-model:value="search"
      placeholder="Search by event ID, name, or description..."
      autofocus
      raw-text
      mb-10
    />

    <div v-for="{ events, category, log } of filtered" :key="category" mb-8>
      <div mb-4 text-xl>
        {{ category }}
        <span v-if="log" ml-2 text-sm op-40>{{ log }} Log</span>
      </div>

      <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <c-card
          v-for="{ id, name, description, severity } of events"
          :key="id"
          class="flex flex-col justify-between"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.4rem; letter-spacing: 0.05em; line-height: 1;"
              >{{ id }}</span>
              <div flex items-center gap-1>
                <n-tag size="small" :type="severityColor[severity]">
                  {{ severity }}
                </n-tag>
                <c-tooltip :tooltip="copiedId === id ? 'Copied!' : 'Copy ID'">
                  <c-button
                    circle
                    variant="text"
                    style="width: 24px; height: 24px;"
                    @click.stop="copyId(id)"
                  >
                    <n-icon size="14" :component="copiedId === id ? Check : Copy" />
                  </c-button>
                </c-tooltip>
              </div>
            </div>
            <div class="mb-1 text-sm font-semibold">
              {{ name }}
            </div>
            <div
              class="text-xs text-neutral-500 dark:text-neutral-400"
              style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ description }}
            </div>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>
