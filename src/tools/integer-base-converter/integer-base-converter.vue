<script setup lang="ts">
import { convertBase } from './integer-base-converter.model';
import { getErrorMessageIfThrows } from '@/utils/error';

const input = ref('42');
const inputBase = ref(10);
const outputBase = ref(42);

function errorlessConvert(...args: Parameters<typeof convertBase>) {
  try {
    return convertBase(...args);
  }
  catch {
    return '';
  }
}

const error = computed(() =>
  getErrorMessageIfThrows(() =>
    convertBase({ value: input.value, fromBase: inputBase.value, toBase: outputBase.value }),
  ),
);

const fixedBases = [
  { label: 'Binary', base: 2 },
  { label: 'Octal', base: 8 },
  { label: 'Decimal', base: 10 },
  { label: 'Hexadecimal', base: 16 },
  { label: 'Base64', base: 64 },
];

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
  <div class="base-tool">
    <c-card>
      <div class="base-section-label">
        Input
      </div>
      <div class="base-inputs">
        <c-input-text
          v-model:value="input"
          label="Number"
          placeholder="42"
          label-position="left"
          label-width="80px"
          font-mono
        />
        <n-form-item label="Base" label-placement="left" label-width="80" :show-feedback="false">
          <n-input-number v-model:value="inputBase" max="64" min="2" w-full />
        </n-form-item>
      </div>

      <n-alert v-if="error" type="error" mt-3>
        {{ error }}
      </n-alert>

      <n-divider />

      <div class="base-section-label">
        Output
      </div>

      <div class="base-grid">
        <div
          v-for="{ label, base } in fixedBases"
          :key="base"
          class="base-row"
        >
          <span class="base-prompt">&gt;_</span>
          <span class="base-label">{{ label }} ({{ base }})</span>
          <code class="base-value">{{ errorlessConvert({ value: input, fromBase: inputBase, toBase: base }) }}</code>
          <button
            type="button"
            class="base-copy"
            :disabled="!errorlessConvert({ value: input, fromBase: inputBase, toBase: base })"
            :title="copiedLabel === label ? 'Copied!' : 'Copy'"
            @click="copyValue(label, errorlessConvert({ value: input, fromBase: inputBase, toBase: base }))"
          >
            <span v-if="copiedLabel === label" class="base-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>

        <!-- Custom base row -->
        <div class="base-row base-custom-row">
          <span class="base-prompt">&gt;_</span>
          <div class="base-custom-label">
            <span class="base-label-text">Custom</span>
            <n-input-number
              v-model:value="outputBase"
              min="2"
              max="64"
              size="small"
              class="base-custom-spinner"
            />
          </div>
          <code class="base-value">{{ errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase }) }}</code>
          <button
            type="button"
            class="base-copy"
            :disabled="!errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase })"
            :title="copiedLabel === 'custom' ? 'Copied!' : 'Copy'"
            @click="copyValue('custom', errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase }))"
          >
            <span v-if="copiedLabel === 'custom'" class="base-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.base-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.base-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.base-inputs {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.base-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.base-row {
  display: grid;
  grid-template-columns: auto 160px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.base-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.base-custom-row {
  border-color: rgba(30, 165, 76, 0.45);
}

.base-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.base-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
}

.base-custom-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-label-text {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.base-custom-spinner {
  width: 80px;
}

.base-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.base-copy {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.75);
  cursor: pointer;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  align-self: start;
}

.base-copy:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.base-copy:disabled {
  opacity: 0.3;
  cursor: default;
}

.base-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 560px) {
  .base-inputs {
    flex-direction: column;
    gap: 8px;
  }

  .base-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .base-prompt {
    display: none;
  }

  .base-label {
    font-size: 0.72rem;
  }

  .base-value {
    font-size: 0.76rem;
  }
}
</style>
