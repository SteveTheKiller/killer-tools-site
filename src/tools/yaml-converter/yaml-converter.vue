<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { parse as parseYaml } from 'yaml';
import { stringify as stringifyToml } from 'iarna-toml-esm';
import { withDefaultOnError } from '@/utils/defaults';
import { isNotThrowing } from '@/utils/boolean';

const input = ref('');
const outputFormat = ref<'json' | 'toml'>('json');
const copied = ref(false);

const isValid = computed(() => {
  if (!input.value.trim()) {
    return true;
  }
  return isNotThrowing(() => parseYaml(input.value));
});

const output = computed(() => {
  if (!input.value.trim()) {
    return '';
  }
  if (!isValid.value) {
    return '';
  }
  return withDefaultOnError(() => {
    const obj = parseYaml(input.value, { merge: true });
    if (!obj) {
      return '';
    }
    if (outputFormat.value === 'json') {
      return JSON.stringify(obj, null, 2);
    }
    return [stringifyToml(obj as any)].flat().join('\n').trim();
  }, '');
});

function copyOutput() {
  if (!output.value) {
    return;
  }
  navigator.clipboard.writeText(output.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div mb-4 flex items-center gap-3>
      <span class="text-sm op-60">Convert to:</span>
      <n-radio-group v-model:value="outputFormat" size="small">
        <n-radio-button value="json">
          JSON
        </n-radio-button>
        <n-radio-button value="toml">
          TOML
        </n-radio-button>
      </n-radio-group>
    </div>

    <div class="grid grid-cols-1 gap-12px md:grid-cols-2">
      <div>
        <div class="mb-1 text-xs op-60">
          Your YAML
        </div>
        <n-input
          v-model:value="input"
          type="textarea"
          placeholder="Paste your YAML here..."
          :rows="20"
          :status="isValid ? undefined : 'error'"
          style="font-family: monospace; font-size: 0.8rem;"
        />
        <div v-if="!isValid" class="mt-1 text-xs" style="color: var(--error-color, #e03131);">
          Provided YAML is not valid.
        </div>
      </div>

      <div>
        <div mb-1 flex items-center justify-between>
          <span class="text-xs op-60">{{ outputFormat.toUpperCase() }} output</span>
          <c-button
            v-if="output"
            circle
            variant="text"
            style="width: 24px; height: 24px;"
            @click="copyOutput"
          >
            <n-icon size="14" :component="copied ? Check : Copy" />
          </c-button>
        </div>
        <div
          class="rounded"
          style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); min-height: 460px; max-height: 460px; overflow: auto; padding: 10px 12px;"
        >
          <pre style="margin: 0; font-size: 0.8rem; white-space: pre; word-break: normal; opacity: 0.9;">{{ output }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
