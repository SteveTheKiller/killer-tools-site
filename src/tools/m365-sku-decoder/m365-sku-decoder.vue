<script setup lang="ts">
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { skusByCategory } from './m365-sku-decoder.constants';

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
      mb-4
    />

    <div class="mb-6 text-xs" style="color: rgba(255,255,255,0.4);">
      See also: <a href="https://m365maps.com" target="_blank" rel="noopener" style="color: #1ea54c; text-decoration: none;">M365 Maps</a> by Aaron Dinnage
    </div>

    <div v-for="{ skus, category } of filtered" :key="category" class="sku-section">
      <div class="sku-category-header">
        {{ category }}
      </div>

      <div class="sku-grid">
        <div
          v-for="{ stringId, name, description, tier } of skus"
          :key="stringId"
          class="kt-terminal sku-card"
        >
          <div class="kt-terminal-bar sku-bar">
            <span class="sku-tier" :class="`sku-tier-${tierColor[tier]}`">{{ tier }}</span>
          </div>
          <div
            class="sku-body"
            :class="{ 'sku-body-copied': copiedId === stringId }"
            :title="copiedId === stringId ? 'Copied!' : 'Click to copy string ID'"
            @click="copyValue(stringId)"
          >
            <div class="sku-name">
              {{ name }}
            </div>
            <code class="sku-string-id">{{ copiedId === stringId ? '✓ copied' : stringId }}</code>
            <div class="sku-desc">
              {{ description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal { background: #121212 !important; }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.sku-section {
  margin-bottom: 32px;
}

.sku-category-header {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  padding: 0 2px 8px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.2);
  margin-bottom: 12px;
}

.sku-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.sku-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  padding: 3px 10px !important;
}

.sku-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 4px;
  line-height: 1.3;
}

.sku-tier {
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

.sku-tier-info    { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.sku-tier-success { background: rgba(30, 165, 76, 0.12);  color: #1ea54c; border: 1px solid rgba(30, 165, 76, 0.3); }
.sku-tier-warning { background: rgba(234, 179, 8, 0.12);  color: #ca8a04; border: 1px solid rgba(234, 179, 8, 0.3); }
.sku-tier-error   { background: rgba(239, 68, 68, 0.12);  color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.sku-tier-default { background: rgba(255, 255, 255, 0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }

.sku-body {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.1s;
}
.sku-body-copied {
  background: rgba(30, 165, 76, 0.12) !important;
}

.sku-string-id {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  color: #1ea54c;
  letter-spacing: 0.03em;
  word-break: break-all;
  margin-bottom: 6px;
}

.sku-string-id:hover {
  color: #4ade80;
}

.sku-desc {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
