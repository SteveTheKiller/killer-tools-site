<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { ndrCategories } from './exchange-ndr-lookup.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

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
      mb-10
    />

    <div v-for="{ codes, category } of filtered" :key="category" mb-8>
      <div mb-4 text-xl>
        {{ category }}
      </div>

      <div class="grid grid-cols-1 gap-12px md:grid-cols-2 xl:grid-cols-3">
        <c-card
          v-for="{ code, name, description, cause, fix, severity } of codes"
          :key="code"
          class="flex flex-col justify-between"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.3rem; letter-spacing: 0.03em; line-height: 1;"
              >{{ code }}</span>
              <div flex items-center gap-1>
                <n-tag size="small" :type="severityColor[severity]">
                  {{ severity }}
                </n-tag>
                <c-tooltip :tooltip="copiedValue === code ? 'Copied!' : 'Copy code'">
                  <c-button
                    circle
                    variant="text"
                    style="width: 24px; height: 24px;"
                    @click.stop="copyValue(code)"
                  >
                    <n-icon size="14" :component="copiedValue === code ? Check : Copy" />
                  </c-button>
                </c-tooltip>
              </div>
            </div>

            <div class="mb-1 text-sm font-semibold">
              {{ name }}
            </div>

            <div class="mb-2 text-xs op-70">
              {{ description }}
            </div>

            <div class="mb-1 text-xs">
              <span class="font-semibold op-60">Cause: </span>{{ cause }}
            </div>

            <div class="text-xs" style="color: #1ea54c;">
              <span class="font-semibold" style="opacity: 0.6; color: inherit;">Fix: </span>{{ fix }}
            </div>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>
