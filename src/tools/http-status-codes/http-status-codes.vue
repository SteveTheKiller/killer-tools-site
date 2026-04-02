<script setup lang="ts">
import { codesByCategories } from './http-status-codes.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

const search = ref('');

const typeColor = {
  HTTP: 'default',
  WebDav: 'info',
} as const;

const { searchResult } = useFuzzySearch({
  search,
  data: codesByCategories.flatMap(({ codes, category }) => codes.map(code => ({ ...code, category }))),
  options: {
    keys: [{ name: 'code', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category'],
  },
});

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return codesByCategories;
  }
  return [{ category: 'Search results', codes: searchResult.value }];
});
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <c-input-text
      v-model:value="search"
      placeholder="Search http status..."
      autofocus
      raw-text
      mb-10
    />

    <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" mb-8>
      <div mb-4 text-xl>
        {{ category }}
      </div>

      <div class="grid grid-cols-1 gap-12px lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <c-card
          v-for="{ code, description, name, type } of codes"
          :key="code"
          class="flex flex-col justify-between"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.4rem; letter-spacing: 0.05em; line-height: 1;"
              >{{ code }}</span>
              <n-tag v-if="type !== 'HTTP'" size="small" :type="typeColor[type]">
                {{ type }}
              </n-tag>
            </div>
            <div class="mb-1 text-sm font-semibold">
              {{ name }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-400" style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
              {{ description }}
            </div>
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>
