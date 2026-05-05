<script setup lang="ts">
import type { UseValidationRule } from '@/composable/validation';
import { formatXml, isValidXML } from './xml-formatter.service';

const defaultValue = '<hello><world>foo</world><world>bar</world></hello>';
const indentSize = useStorage('xml-formatter:indent-size', 2);
const collapseContent = useStorage('xml-formatter:collapse-content', true);

function transformer(value: string) {
  return formatXml(value, {
    indentation: ' '.repeat(indentSize.value),
    collapseContent: collapseContent.value,
    lineSeparator: '\n',
  });
}

const rules: UseValidationRule<string>[] = [
  {
    validator: isValidXML,
    message: 'Provided XML is not valid.',
  },
];
</script>

<template>
  <div class="xf-controls">
    <button type="button" class="kt-pill" :class="{ 'kt-pill-active': collapseContent }" @click="collapseContent = !collapseContent">
      Collapse
    </button>
    <div class="xf-control">
      <span class="xf-control-label">Indent size</span>
      <div class="xf-stepper">
        <button class="xf-step-btn" :disabled="indentSize <= 0" @click="indentSize = Math.max(0, indentSize - 1)">
          −
        </button>
        <span class="xf-step-val">{{ indentSize }}</span>
        <button class="xf-step-btn" :disabled="indentSize >= 10" @click="indentSize = Math.min(10, indentSize + 1)">
          +
        </button>
      </div>
    </div>
  </div>

  <format-transformer
    input-label="Your XML"
    input-placeholder="Paste your XML here..."
    output-label="Formatted XML from your XML"
    output-language="xml"
    :input-validation-rules="rules"
    :transformer="transformer"
    :input-default="defaultValue"
  />
</template>

<style scoped>
.xf-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.xf-stepper {
  display: inline-flex; align-items: center;
  background: rgba(0,0,0,0.4); border: 1px solid rgba(30,165,76,0.2); border-radius: 5px; overflow: hidden;
}
.xf-step-btn {
  width: 28px; height: 28px; background: transparent; border: none;
  border-right: 1px solid rgba(30,165,76,0.12); color: #1ea54c; font-size: 1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.xf-step-btn:last-child { border-right: none; border-left: 1px solid rgba(30,165,76,0.12); }
.xf-step-btn:hover:not(:disabled) { background: rgba(30,165,76,0.1); }
.xf-step-btn:disabled { opacity: 0.3; cursor: default; }
.xf-step-val {
  min-width: 28px; text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace; font-size: 0.82rem; color: #1ea54c;
}
</style>
