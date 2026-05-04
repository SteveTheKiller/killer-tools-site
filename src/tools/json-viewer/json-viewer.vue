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
    <!-- Sort keys toggle -->
    <div class="jv-control">
      <span class="jv-control-label">Sort keys</span>
      <button
        type="button"
        class="jv-switch"
        :class="{ 'jv-switch-on': sortKeys }"
        @click="sortKeys = !sortKeys"
      >
        <span class="jv-switch-thumb" />
      </button>
    </div>

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

  <n-form-item
    label="Your raw JSON"
    :feedback="rawJsonValidation.message"
    :validation-status="rawJsonValidation.status"
  >
    <c-input-text
      ref="inputElement"
      v-model:value="rawJson"
      placeholder="Paste your raw JSON here..."
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item label="Prettified version of your JSON">
    <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" />
  </n-form-item>
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

.jv-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.jv-control-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

/* ── Toggle switch ── */
.jv-switch {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.jv-switch-on {
  background: rgba(30, 165, 76, 0.25);
  border-color: #1ea54c;
}

.jv-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: transform 0.2s, background 0.2s;
}

.jv-switch-on .jv-switch-thumb {
  transform: translateX(18px);
  background: #1ea54c;
}

/* ── Stepper ── */
.jv-stepper {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
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
