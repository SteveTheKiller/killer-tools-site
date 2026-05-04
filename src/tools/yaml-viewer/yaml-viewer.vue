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
    <div class="yv-control">
      <span class="yv-control-label">Sort keys</span>
      <button type="button" class="yv-switch" :class="{ 'yv-switch-on': sortKeys }" @click="sortKeys = !sortKeys">
        <span class="yv-switch-thumb" />
      </button>
    </div>
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

  <n-form-item
    label="Your raw YAML"
    :feedback="rawYamlValidation.message"
    :validation-status="rawYamlValidation.status"
  >
    <c-input-text
      ref="inputElement"
      v-model:value="rawYaml"
      placeholder="Paste your raw YAML here..."
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item label="Prettified version of your YAML">
    <TextareaCopyable :value="cleanYaml" language="yaml" :follow-height-of="inputElement" />
  </n-form-item>
</template>

<style scoped>
.yv-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.yv-control { display: flex; align-items: center; gap: 10px; }
.yv-control-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}
.yv-switch {
  position: relative; width: 40px; height: 22px; border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(0,0,0,0.4);
  cursor: pointer; transition: background 0.2s, border-color 0.2s; padding: 0; flex-shrink: 0;
}
.yv-switch-on { background: rgba(30,165,76,0.25); border-color: #1ea54c; }
.yv-switch-thumb {
  position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  border-radius: 50%; background: rgba(255,255,255,0.3); transition: transform 0.2s, background 0.2s;
}
.yv-switch-on .yv-switch-thumb { transform: translateX(18px); background: #1ea54c; }
.yv-stepper {
  display: inline-flex; align-items: center;
  background: rgba(0,0,0,0.4); border: 1px solid rgba(30,165,76,0.2); border-radius: 5px; overflow: hidden;
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
</style>
