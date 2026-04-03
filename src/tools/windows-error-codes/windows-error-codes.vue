<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { errorsByCategory } from './windows-error-codes.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

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
      mb-10
    />

    <div v-for="{ errors, category } of filtered" :key="category" mb-8>
      <div mb-4 text-xl>
        {{ category }}
      </div>

      <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <c-card
          v-for="{ hex, decimal, name, description, severity } of errors"
          :key="hex"
          class="flex flex-col justify-between"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.1rem; letter-spacing: 0.03em; line-height: 1;"
              >{{ hex }}</span>
              <div flex items-center gap-1>
                <n-tag size="small" :type="severityColor[severity]">
                  {{ severity }}
                </n-tag>
                <c-tooltip :tooltip="copiedValue === hex ? 'Copied!' : 'Copy hex code'">
                  <c-button
                    circle
                    variant="text"
                    style="width: 24px; height: 24px;"
                    @click.stop="copyValue(hex)"
                  >
                    <n-icon size="14" :component="copiedValue === hex ? Check : Copy" />
                  </c-button>
                </c-tooltip>
              </div>
            </div>

            <div class="mb-1 text-xs text-neutral-400" style="font-size: 0.7rem;">
              Decimal: {{ decimal }}
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
