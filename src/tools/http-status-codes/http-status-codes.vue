<script setup lang="ts">
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { codesByCategories } from './http-status-codes.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);

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
      placeholder="Search http status..."
      autofocus
      raw-text
      mb-4
    />

    <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" class="hsc-section">
      <div class="hsc-category-header">
        {{ category }}
      </div>

      <div class="hsc-grid">
        <div
          v-for="{ code, description, name, type } of codes"
          :key="code"
          class="kt-terminal hsc-card"
        >
          <div
            class="kt-terminal-bar hsc-bar"
            :class="{ 'hsc-bar-copied': copiedValue === String(code) }"
            :title="copiedValue === String(code) ? 'Copied!' : 'Click to copy status code'"
            @click="copyValue(String(code))"
          >
            <span class="kt-prompt">&gt;_</span>
            <code class="hsc-code">{{ copiedValue === String(code) ? '✓ copied' : code }}</code>
            <span v-if="type !== 'HTTP'" class="hsc-type-pill hsc-type-webdav">{{ type }}</span>
          </div>

          <div class="hsc-body">
            <div class="hsc-name">
              {{ name }}
            </div>
            <div class="hsc-desc">
              {{ description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal { background: #0a0a0c !important; }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.hsc-section {
  margin-bottom: 32px;
}

.hsc-category-header {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(30, 165, 76, 0.65);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  padding: 0 2px 8px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.15);
  margin-bottom: 12px;
}

.hsc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.hsc-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.hsc-bar:hover {
  background: rgba(30, 165, 76, 0.18) !important;
}

.hsc-bar-copied {
  background: rgba(30, 165, 76, 0.22) !important;
}

.hsc-code {
  flex: 1;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1ea54c;
  letter-spacing: 0.05em;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.hsc-type-pill {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.hsc-type-webdav { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }

.hsc-bar {
  padding: 4px 10px !important;
}

.hsc-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hsc-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.3;
}

.hsc-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
