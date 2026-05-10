<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import yaml from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { formatYaml } from './yaml-models';

const inputElement = ref<HTMLElement>();

const rawYaml = useStorage('yaml-prettify:raw-yaml', '');
const indentSize = useStorage('yaml-prettify:indent-size', 2);
const sortKeys = useStorage('yaml-prettify:sort-keys', false);

const cleanYaml = computed(() => withDefaultOnError(() => formatYaml({ rawYaml, indentSize, sortKeys }), ''));

const rawYamlValidation = useValidation({
  source: rawYaml,
  rules: [
    {
      validator: (v: string) => v === '' || yaml.parse(v),
      message: 'Provided YAML is not valid.',
    },
  ],
});
</script>

<template>
  <div class="yv-controls">
    <button type="button" class="kt-pill" :class="{ 'kt-pill-active': sortKeys }" @click="sortKeys = !sortKeys">
      Sort keys
    </button>
    <div class="yv-control">
      <span class="yv-control-label">Indent size</span>
      <div class="yv-stepper">
        <button class="yv-step-btn" :disabled="indentSize <= 1" @click="indentSize = Math.max(1, indentSize - 1)">
          −
        </button>
        <span class="yv-step-val">{{ indentSize }}</span>
        <button class="yv-step-btn" :disabled="indentSize >= 10" @click="indentSize = Math.min(10, indentSize + 1)">
          +
        </button>
      </div>
    </div>
  </div>

  <div style="flex: 1 1 300px; min-width: 0;">
    <div class="kt-section-label">
      Your raw YAML
    </div>
    <c-input-text
      ref="inputElement"
      v-model:value="rawYaml"
      :validation="rawYamlValidation"
      placeholder="Paste your raw YAML here..."
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
      Prettified version of your YAML
    </div>
    <TextareaCopyable :value="cleanYaml" language="yaml" :follow-height-of="inputElement" />
  </div>
</template>

<style scoped>
.yv-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

/* Standalone pill — restore border-radius overridden by the global connected-row rule */
.kt-pill {
  border-radius: 6px !important;
  border: 1px solid rgba(30, 165, 76, 0.3) !important;
}

.yv-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.yv-control-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.yv-stepper {
  display: inline-flex; align-items: center;
  background: #0f0f11; border: 1px solid rgba(30,165,76,0.2); border-radius: 5px; overflow: hidden;
}
.yv-step-btn {
  width: 28px; height: 28px; background: transparent; border: none;
  border-right: 1px solid rgba(30,165,76,0.12); color: #1ea54c; font-size: 1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.yv-step-btn:last-child { border-right: none; border-left: 1px solid rgba(30,165,76,0.12); }
.yv-step-btn:hover:not(:disabled) { background: rgba(30,165,76,0.1); }
.yv-step-btn:disabled { opacity: 0.3; cursor: default; }
.yv-step-val {
  min-width: 28px; text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; font-size: 0.82rem; color: #1ea54c;
}

/* ── Light mode ── */
html:not(.dark) .yv-control-label { color: rgba(0, 0, 0, 0.55); }

html:not(.dark) .yv-stepper { background: #f0f0f0; border-color: rgba(0, 0, 0, 0.18); }
html:not(.dark) .yv-step-btn { color: #0d7033; border-color: rgba(0, 0, 0, 0.10); }
html:not(.dark) .yv-step-btn:last-child { border-color: rgba(0, 0, 0, 0.10); }
html:not(.dark) .yv-step-btn:hover:not(:disabled) { background: rgba(13, 112, 51, 0.08); }
html:not(.dark) .yv-step-val { color: #0d7033; }
</style>
