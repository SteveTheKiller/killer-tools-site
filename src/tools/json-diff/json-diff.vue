<script setup lang="ts">
import JSON5 from 'json5';
import { useStyleStore } from '@/stores/style.store';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import DiffsViewer from './diff-viewer/diff-viewer.vue';

const styleStore = useStyleStore();
const isLight = computed(() => !styleStore.isDarkTheme);

const rawLeftJson = ref('');
const rawRightJson = ref('');

const leftJson = computed(() => withDefaultOnError(() => JSON5.parse(rawLeftJson.value), undefined));
const rightJson = computed(() => withDefaultOnError(() => JSON5.parse(rawRightJson.value), undefined));

const leftIsValid = computed(() => rawLeftJson.value === '' || isNotThrowing(() => JSON5.parse(rawLeftJson.value)));
const rightIsValid = computed(() => rawRightJson.value === '' || isNotThrowing(() => JSON5.parse(rawRightJson.value)));
</script>

<template>
  <div class="jd-wrap">
    <div class="jd-field-block">
      <div class="jd-field-wrap" :class="{ 'jd-field-error': rawLeftJson && !leftIsValid }">
        <div class="jd-field-header kt-section-row">
          <span class="jd-sublabel">YOUR FIRST JSON</span>
        </div>
        <textarea
          v-model="rawLeftJson"
          class="jd-textarea"
          placeholder="Paste your first JSON here..."
          rows="20"
          spellcheck="false"
          :style="isLight ? 'background: #f0f0f0 !important; color: rgba(0,0,0,0.85) !important' : 'background: #0f0f11 !important; color: rgba(255,255,255,0.85) !important'"
        />
      </div>
      <span v-if="rawLeftJson && !leftIsValid" class="jd-error-msg">Invalid JSON format</span>
    </div>

    <div class="jd-field-block">
      <div class="jd-field-wrap" :class="{ 'jd-field-error': rawRightJson && !rightIsValid }">
        <div class="jd-field-header kt-section-row">
          <span class="jd-sublabel">YOUR JSON TO COMPARE</span>
        </div>
        <textarea
          v-model="rawRightJson"
          class="jd-textarea"
          placeholder="Paste your JSON to compare here..."
          rows="20"
          spellcheck="false"
          :style="isLight ? 'background: #f0f0f0 !important; color: rgba(0,0,0,0.85) !important' : 'background: #0f0f11 !important; color: rgba(255,255,255,0.85) !important'"
        />
      </div>
      <span v-if="rawRightJson && !rightIsValid" class="jd-error-msg">Invalid JSON format</span>
    </div>

    <DiffsViewer :left-json="leftJson" :right-json="rightJson" />
  </div>
</template>

<style scoped>
.jd-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.jd-field-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.jd-field-wrap {
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}

.jd-field-wrap:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.jd-field-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.jd-field-header {
  display: flex;
  align-items: center;
  padding: 6px 14px;
}

.jd-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.80);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.jd-textarea {
  width: 100%;
  background: #0f0f11;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
  display: block;
}

.jd-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.jd-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* Light mode */
html:not(.dark) .jd-field-wrap { border-color: rgba(13, 112, 51, 0.35); }
html:not(.dark) .jd-field-wrap:focus-within { border-color: rgba(13, 112, 51, 0.55); }
html:not(.dark) .jd-textarea::placeholder { color: rgba(0, 0, 0, 0.25); }
</style>
