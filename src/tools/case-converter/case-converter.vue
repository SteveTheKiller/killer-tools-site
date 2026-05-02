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

const baseConfig = {
  stripRegexp: /[^A-Za-zÀ-ÖØ-öø-ÿ]+/gi,
};

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
    value: input.value
      .split('')
      .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
      .join(''),
  },
]);

const copiedLabel = ref<string | null>(null);

async function copyValue(label: string, value: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) copiedLabel.value = null;
  }, 2000);
}
</script>

<template>
  <div class="case-tool">
    <c-card>
      <div class="case-section-label">
        Your string
      </div>
      <c-input-text
        v-model:value="input"
        placeholder="Your string..."
        raw-text
        font-mono
      />

      <n-divider />

      <div class="case-section-label">
        Output
      </div>

      <div class="case-terminal">
        <div
          v-for="{ label, value } in formats"
          :key="label"
          class="case-line"
          @click="copyValue(label, value)"
        >
          <span class="case-prompt">&gt;_</span>
          <span class="case-label">{{ label }}</span>
          <code class="case-value">{{ value }}</code>
          <span class="case-copy-hint">{{ copiedLabel === label ? '✓' : '' }}</span>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.case-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.case-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.case-terminal {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  padding: 6px 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.case-line {
  display: grid;
  grid-template-columns: auto 112px 1fr auto;
  align-items: baseline;
  gap: 12px;
  padding: 4px 14px;
  cursor: pointer;
  transition: background 0.1s;
}

.case-line:hover {
  background: rgba(30, 165, 76, 0.07);
}

.case-prompt {
  color: rgba(30, 165, 76, 0.4);
  font-size: 0.8rem;
  user-select: none;
}

.case-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.case-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
}

.case-copy-hint {
  font-size: 0.78rem;
  color: #1ea54c;
  font-weight: 700;
  min-width: 12px;
  text-align: right;
}

@container (max-width: 480px) {
  .case-line {
    grid-template-columns: 112px 1fr auto;
    gap: 8px;
    padding: 4px 10px;
  }

  .case-prompt {
    display: none;
  }
}
</style>
