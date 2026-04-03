<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { skusByCategory } from './m365-sku-decoder.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

const search = ref('');
const copiedId = ref<string | null>(null);

const tierColor: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  'Business': 'info',
  'Enterprise': 'success',
  'Frontline': 'warning',
  'Add-on': 'default',
  'Education': 'info',
  'Gov': 'error',
};

const allSkus = skusByCategory.flatMap(({ skus, category }) =>
  skus.map(s => ({ ...s, category })),
);

const { searchResult } = useFuzzySearch({
  search,
  data: allSkus,
  options: {
    keys: [
      { name: 'stringId', weight: 3 },
      { name: 'guid', weight: 3 },
      { name: 'name', weight: 2 },
      'description',
      'category',
    ],
  },
});

const filtered = computed(() => {
  if (!search.value) {
    return skusByCategory;
  }
  return [{ category: 'Search results', skus: searchResult.value }];
});

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedId.value = value;
  setTimeout(() => {
    copiedId.value = null;
  }, 1500);
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <c-input-text
      v-model:value="search"
      placeholder="Search by SKU name, string ID, or description..."
      autofocus
      raw-text
      mb-10
    />

    <div v-for="{ skus, category } of filtered" :key="category" mb-8>
      <div mb-4 text-xl>
        {{ category }}
      </div>

      <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <c-card
          v-for="{ stringId, name, description, tier } of skus"
          :key="stringId"
          class="flex flex-col justify-between"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <n-tag size="small" :type="tierColor[tier]">
                {{ tier }}
              </n-tag>
              <c-tooltip :tooltip="copiedId === stringId ? 'Copied!' : 'Copy String ID'">
                <c-button
                  circle
                  variant="text"
                  style="width: 24px; height: 24px;"
                  @click.stop="copyValue(stringId)"
                >
                  <n-icon size="14" :component="copiedId === stringId ? Check : Copy" />
                </c-button>
              </c-tooltip>
            </div>

            <div
              class="mb-1 text-primary font-bold font-mono"
              style="font-size: 0.75rem; letter-spacing: 0.03em; word-break: break-all;"
            >
              {{ stringId }}
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
