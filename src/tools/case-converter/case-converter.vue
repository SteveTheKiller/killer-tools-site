<script setup lang="ts">
import { convertCase } from './case-converter.models';

const { t } = useI18n();

const input = ref('lorem ipsum dolor sit amet');

const formats = computed(() => convertCase(input.value));

const copiedLabel = ref<string | null>(null);
async function copyValue(label: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) {
      copiedLabel.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="case-tool">
    <c-input-text
      v-model:value="input"
      :placeholder="t('tools.case-converter.ui.inputPlaceholder')"
      raw-text
      autofocus
      mb-3
    />

    <div class="kt-terminal case-terminal">
      <div class="kt-terminal-bar case-section-header">
        {{ t('tools.case-converter.ui.output') }}
      </div>

      <div
        v-for="{ label, value } in formats"
        :key="label"
        class="case-row"
        @click="copyValue(label, value)"
      >
        <span class="case-prompt">&gt;_</span>
        <span class="case-label">{{ label }}</span>
        <code class="case-value">{{ value }}</code>
        <span class="case-copy" :class="{ 'case-copy-done': copiedLabel === label }">
          <span v-if="copiedLabel === label">✓</span>
          <icon-mdi-content-copy v-else />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.case-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.case-terminal {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.case-row {
  display: grid;
  grid-template-columns: auto 120px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.case-row:last-child { border-bottom: none; }
.case-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

.case-prompt {
  color: rgba(var(--kt-accent-rgb), 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.case-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.case-value {
  color: var(--kt-accent);
  font-size: 0.82rem;
  word-break: break-all;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.case-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(var(--kt-accent-rgb), 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.case-row:hover .case-copy { color: rgba(var(--kt-accent-rgb), 0.8); }
.case-copy-done { color: var(--kt-accent) !important; }

@container (max-width: 480px) {
  .case-row { grid-template-columns: 120px 1fr auto; }
  .case-prompt { display: none; }
}
</style>
