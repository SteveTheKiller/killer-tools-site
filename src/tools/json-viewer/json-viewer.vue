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

  <div class="jv-panel">
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
/* ── Content panel — collapse NaiveUI form-item empty label/feedback space ── */
.jv-panel {
  flex: 1 1 300px;
  min-width: 0;
}

.jv-panel ::v-deep(.n-form-item) { margin-bottom: 0 !important; }
.jv-panel ::v-deep(.n-form-item-label) { padding-bottom: 0 !important; min-height: 0 !important; height: 0 !important; overflow: hidden !important; }
.jv-panel ::v-deep(.n-form-item-feedback-wrapper) { min-height: 0 !important; }

/* ── Controls bar ── */
.jv-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

/* Standalone pill — override the global connected-row border-radius reset */
.kt-pill {
  border-radius: 6px !important;
  border: 1px solid rgba(30, 165, 76, 0.3) !important;
}

.jv-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.jv-control-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
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

/* ── Light mode ── */
html:not(.dark) .jv-control-label { color: rgba(0, 0, 0, 0.55); }

html:not(.dark) .jv-stepper { background: #f0f0f0; border-color: rgba(0, 0, 0, 0.18); }
html:not(.dark) .jv-step-btn { color: #0d7033; border-color: rgba(0, 0, 0, 0.10); }
html:not(.dark) .jv-step-btn:last-child { border-color: rgba(0, 0, 0, 0.10); }
html:not(.dark) .jv-step-btn:hover:not(:disabled) { background: rgba(13, 112, 51, 0.08); }
html:not(.dark) .jv-step-val { color: #0d7033; }
</style>
