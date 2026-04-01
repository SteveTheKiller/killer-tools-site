<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { policyCategories } from './group-policy-reference.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);

const severityColor = {
  Info: 'default',
  Warning: 'warning',
  Critical: 'error',
} as const;

const naValues = [
  'N/A (SAM database)',
  'N/A (audit policy)',
  'N/A (LSA)',
  'N/A (Kerberos policy)',
  'N/A (advanced audit)',
  'N/A (AppLocker policy)',
  'N/A (Folder Redirection)',
];

function hasRegistry(registry: string): boolean {
  return !naValues.includes(registry);
}

function breakRegistry(registry: string): string {
  return registry.replace(/\\/g, '\\\u200B');
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) {
    return policyCategories;
  }
  return policyCategories
    .map(({ category, policies }) => ({
      category,
      policies: policies.filter(p =>
        p.name.toLowerCase().includes(q)
        || p.path.toLowerCase().includes(q)
        || p.registry.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || p.recommendedValue.toLowerCase().includes(q)
        || p.defaultValue.toLowerCase().includes(q)
        || category.toLowerCase().includes(q),
      ),
    }))
    .filter(({ policies }) => policies.length > 0);
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
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <c-input-text
      v-model:value="search"
      placeholder="Search by policy name, path, registry key, or description..."
      autofocus
      raw-text
      mb-10
    />

    <div class="grid grid-cols-1 gap-12px md:grid-cols-2 xl:grid-cols-3">
      <template v-for="{ policies, category } of filtered" :key="category">
        <c-card
          v-for="{ name, path, registry, defaultValue, recommendedValue, description, severity } of policies"
          :key="name"
          class="flex flex-col justify-between"
        >
          <div>
            <div flex items-start justify-between gap-2 mb-2>
              <n-tag size="small" :type="severityColor[severity]">
                {{ severity }}
              </n-tag>
              <c-tooltip :tooltip="copiedValue === registry ? 'Copied!' : 'Copy registry key'">
                <c-button
                  v-if="hasRegistry(registry)"
                  circle
                  variant="text"
                  style="width: 24px; height: 24px;"
                  @click.stop="copyValue(registry)"
                >
                  <n-icon size="14" :component="copiedValue === registry ? Check : Copy" />
                </c-button>
              </c-tooltip>
            </div>

            <div class="text-xs op-40 mb-1">
              {{ category }}
            </div>

            <div class="text-sm font-semibold mb-2">
              {{ name }}
            </div>

            <div
              class="text-xs op-50 mb-2"
              style="-webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ path }}
            </div>

            <div
              v-if="hasRegistry(registry)"
              class="font-mono text-primary mb-2"
              style="font-size: 0.7rem;"
            >
              {{ breakRegistry(registry) }}
            </div>

            <div class="text-xs mb-1">
              <span class="op-50">Default: </span>{{ defaultValue }}
            </div>

            <div class="text-xs mb-2" style="color: #1ea54c;">
              <span class="op-50" style="color: inherit;">Recommended: </span>{{ recommendedValue }}
            </div>

            <div
              class="text-xs text-neutral-500 dark:text-neutral-400"
              style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ description }}
            </div>
          </div>
        </c-card>
      </template>
    </div>
  </div>
</template>
