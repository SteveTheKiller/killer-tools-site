<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import JSON5 from 'json5';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { formatJson } from './json.models';

const inputElement = ref<HTMLElement>();

const rawJson = useStorage('json-prettify:raw-json', '{"hello": "world", "foo": "bar"}');
const indentSize = useStorage('json-prettify:indent-size', 3);
const sortKeys = useStorage('json-prettify:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatJson({ rawJson, indentSize, sortKeys }), ''));

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: [
    {
      validator: (v: string) => v === '' || JSON5.parse(v),
      message: 'Provided JSON is not valid.',
    },
  ],
});
</script>

<template>
  <div class="jv-controls">
    <button type="button" class="kt-pill" :class="{ 'kt-pill-active': sortKeys }" @click="sortKeys = !sortKeys">
      Sort keys
    </button>

    <!-- Indent size stepper -->
    <div class="jv-control">
      <span class="jv-control-label">Indent size</span>
      <div class="jv-stepper">
        <button class="jv-step-btn" :disabled="indentSize <= 0" @click="indentSize = Math.max(0, indentSize - 1)">
          −
        </button>
        <span class="jv-step-val">{{ indentSize }}</span>
        <button class="jv-step-btn" :disabled="indentSize >= 10" @click="indentSize = Math.min(10, indentSize + 1)">
          +
        </button>
      </div>
    </div>
  </div>

  <div style="flex: 1 1 300px; min-width: 0;">
    <div class="kt-section-label">
      Your raw JSON
    </div>
    <c-input-text
      ref="inputElement"
      v-model:value="rawJson"
      :validation="rawJsonValidation"
      placeholder="Paste your raw JSON here..."
      rows="20"
      multiline
      autofocus
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </div>
  <div style="flex: 1 1 300px; min-width: 0;">
    <div class="kt-section-label">
      Prettified version of your JSON
    </div>
    <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" />
  </div>
</template>

<style scoped>
/* ── Controls bar ── */
.jv-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

/* ── Stepper ── */
.jv-stepper {
  display: inline-flex;
  align-items: center;
  background: #0f0f11;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.jv-step-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.12);
  color: #1ea54c;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.jv-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.jv-step-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.1);
}

.jv-step-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.jv-step-val {
  min-width: 28px;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
}
</style>
