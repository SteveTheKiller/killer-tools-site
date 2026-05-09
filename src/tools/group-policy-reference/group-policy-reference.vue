<script setup lang="ts">
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
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <c-input-text
      v-model:value="search"
      placeholder="Search policies, paths, registry keys..."
      autofocus
      raw-text
      mb-6
    />

    <div class="gpr-grid">
      <template v-for="{ policies, category } of filtered" :key="category">
        <div
          v-for="{ name, path, registry, defaultValue, recommendedValue, description, severity } of policies"
          :key="name"
          class="kt-terminal gpr-card"
        >
          <!-- Titlebar: category + severity pill -->
          <div class="kt-terminal-bar gpr-bar">
            <span class="kt-prompt">&gt;_</span>
            <span class="gpr-category">{{ category }}</span>
            <span class="gpr-severity" :class="`gpr-sev-${severityColor[severity]}`">{{ severity }}</span>
          </div>

          <!-- Body -->
          <div class="gpr-body">
            <div class="gpr-name">
              {{ name }}
            </div>
            <div class="gpr-path">
              {{ path }}
            </div>

            <div
              v-if="hasRegistry(registry)"
              class="gpr-registry"
              :title="copiedValue === registry ? 'Copied!' : 'Click to copy registry key'"
              :class="{ 'gpr-registry-copied': copiedValue === registry }"
              @click="copyValue(registry)"
            >
              {{ copiedValue === registry ? '✓ copied' : breakRegistry(registry) }}
            </div>

            <div class="gpr-kv-block">
              <div class="gpr-kv-row">
                <span class="gpr-kv-label">Default</span>
                <span class="gpr-kv-value">{{ defaultValue }}</span>
              </div>
              <div class="gpr-kv-row">
                <span class="gpr-kv-label">Recommended</span>
                <span class="gpr-kv-value gpr-kv-recommended">{{ recommendedValue }}</span>
              </div>
            </div>

            <div class="gpr-desc">
              {{ description }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal { background: #0a0a0c !important; }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.gpr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 10px;
}

.gpr-category {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.gpr-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
}

.gpr-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 2px;
}

.gpr-severity {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.gpr-sev-default { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }
.gpr-sev-warning  { background: rgba(234,179,8,0.12);  color: #ca8a04; border: 1px solid rgba(234,179,8,0.3); }
.gpr-sev-error    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

.gpr-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gpr-path {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.gpr-registry {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: #22d3ee;
  overflow-wrap: break-word;
  word-break: normal;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid rgba(34, 211, 238, 0.2);
  background: rgba(34, 211, 238, 0.05);
  transition: background 0.1s;
}

.gpr-registry:hover {
  background: rgba(34, 211, 238, 0.12);
  border-color: rgba(34, 211, 238, 0.4);
}

.gpr-registry-copied {
  color: #1ea54c !important;
  border-color: rgba(30, 165, 76, 0.4) !important;
  background: rgba(30, 165, 76, 0.1) !important;
}

.gpr-kv-block {
  border: 1px solid rgba(30, 165, 76, 0.12);
  border-radius: 5px;
  overflow: hidden;
  margin: 2px 0;
}

.gpr-kv-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  font-size: 0.78rem;
  padding: 5px 10px;
}

.gpr-kv-row + .gpr-kv-row {
  border-top: 1px solid rgba(30, 165, 76, 0.08);
}

.gpr-kv-label {
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
}

.gpr-kv-value {
  color: rgba(255, 255, 255, 0.85);
}

.gpr-kv-recommended {
  color: #1ea54c;
}

.gpr-desc {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
