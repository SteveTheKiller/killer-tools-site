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
    <div class="jd-panels">
      <!-- Left input -->
      <div class="jd-field-block">
        <div class="jd-field-wrap kt-terminal" :class="{ 'jd-field-error': rawLeftJson && !leftIsValid }">
          <div class="kt-terminal-bar">
            <span class="kt-terminal-bar-title">YOUR FIRST JSON</span>
          </div>
          <textarea
            v-model="rawLeftJson"
            class="jd-textarea"
            placeholder="Paste your first JSON here..."
            rows="18"
            spellcheck="false"
            :style="isLight ? 'background: #f0f0f0 !important; color: rgba(0,0,0,0.85) !important' : 'background: #121212 !important; color: rgba(255,255,255,0.85) !important'"
          />
        </div>
        <span v-if="rawLeftJson && !leftIsValid" class="jd-error-msg">Invalid JSON format</span>
      </div>

      <!-- Right input -->
      <div class="jd-field-block">
        <div class="jd-field-wrap kt-terminal" :class="{ 'jd-field-error': rawRightJson && !rightIsValid }">
          <div class="kt-terminal-bar">
            <span class="kt-terminal-bar-title">YOUR JSON TO COMPARE</span>
          </div>
          <textarea
            v-model="rawRightJson"
            class="jd-textarea"
            placeholder="Paste your JSON to compare here..."
            rows="18"
            spellcheck="false"
            :style="isLight ? 'background: #f0f0f0 !important; color: rgba(0,0,0,0.85) !important' : 'background: #121212 !important; color: rgba(255,255,255,0.85) !important'"
          />
        </div>
        <span v-if="rawRightJson && !rightIsValid" class="jd-error-msg">Invalid JSON format</span>
      </div>
    </div>

    <DiffsViewer :left-json="leftJson" :right-json="rightJson" />
  </div>
</template>

<style scoped>
.jd-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* Side-by-side inputs at full width */
.jd-panels {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.jd-field-block {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

@media (max-width: 900px) {
  .jd-panels {
    flex-direction: column;
    align-items: stretch;
  }
}

.jd-field-wrap {
  display: flex;
  flex-direction: column;
}

.jd-field-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.jd-field-wrap:focus-within {
  border-color: rgba(30, 165, 76, 0.55) !important;
}

.jd-textarea {
  width: 100%;
  background: #121212;
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
html:not(.dark) .jd-textarea::placeholder { color: rgba(0, 0, 0, 0.25); }
</style>
