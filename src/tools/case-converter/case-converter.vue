<script setup lang="ts">
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  trainCase as headerCase,
  noCase,
  kebabCase as paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from 'change-case';

// eslint-disable-next-line ts/no-unsafe-assignment
const baseConfig = {
  stripRegexp: /[^\p{L}]+/gu,
} as any;

const input = ref('lorem ipsum dolor sit amet');

const formats = computed(() => [
  { label: 'Lowercase', value: input.value.toLocaleLowerCase() },
  { label: 'Uppercase', value: input.value.toLocaleUpperCase() },
  { label: 'Camelcase', value: camelCase(input.value, baseConfig) },
  { label: 'Capitalcase', value: capitalCase(input.value, baseConfig) },
  { label: 'Constantcase', value: constantCase(input.value, baseConfig) },
  { label: 'Dotcase', value: dotCase(input.value, baseConfig) },
  { label: 'Headercase', value: headerCase(input.value, baseConfig) },
  { label: 'Nocase', value: noCase(input.value, baseConfig) },
  { label: 'Paramcase', value: paramCase(input.value, baseConfig) },
  { label: 'Pascalcase', value: pascalCase(input.value, baseConfig) },
  { label: 'Pathcase', value: pathCase(input.value, baseConfig) },
  { label: 'Sentencecase', value: sentenceCase(input.value, baseConfig) },
  { label: 'Snakecase', value: snakeCase(input.value, baseConfig) },
  {
    label: 'Mockingcase',
    value: input.value.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join(''),
  },
]);

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
      placeholder="Your string..."
      raw-text
      autofocus
      mb-3
    />

    <div class="case-terminal">
      <div class="case-section-header">
        OUTPUT
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
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}


.case-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.case-row {
  display: grid;
  grid-template-columns: auto 120px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.case-row:last-child { border-bottom: none; }
.case-row:hover { background: rgba(30, 165, 76, 0.05) !important; }

.case-prompt {
  color: rgba(30, 165, 76, 0.5);
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
  color: #1ea54c;
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
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.case-row:hover .case-copy { color: rgba(30, 165, 76, 0.8); }
.case-copy-done { color: #1ea54c !important; }

@container (max-width: 480px) {
  .case-row { grid-template-columns: 120px 1fr auto; }
  .case-prompt { display: none; }
}
</style>
