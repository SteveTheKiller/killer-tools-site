<script setup lang="ts">
import { formatBytes } from '@/utils/convert';
import { getStringSizeInBytes } from './text-statistics.service';

const text = ref('');

const charCount = computed(() => text.value.length);
const wordCount = computed(() => text.value === '' ? 0 : text.value.split(/\s+/).length);
const lineCount = computed(() => text.value === '' ? 0 : text.value.split(/\r\n|\r|\n/).length);
const byteSize = computed(() => formatBytes(getStringSizeInBytes(text.value)));
</script>

<template>
  <div class="ts-wrap">
    <textarea
      v-model="text"
      class="ts-input"
      placeholder="Your text..."
      rows="8"
      spellcheck="false"
    />

    <div class="ts-stats">
      <div class="ts-stat">
        <span class="ts-stat-label">CHARACTER COUNT</span>
        <span class="ts-stat-value">{{ charCount }}</span>
      </div>
      <div class="ts-divider" />
      <div class="ts-stat">
        <span class="ts-stat-label">WORD COUNT</span>
        <span class="ts-stat-value">{{ wordCount }}</span>
      </div>
      <div class="ts-divider" />
      <div class="ts-stat">
        <span class="ts-stat-label">LINE COUNT</span>
        <span class="ts-stat-value">{{ lineCount }}</span>
      </div>
      <div class="ts-divider" />
      <div class="ts-stat">
        <span class="ts-stat-label">BYTE SIZE</span>
        <span class="ts-stat-value">{{ byteSize }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ts-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.ts-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 6px;
  padding: 12px 14px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.ts-input:focus { border-color: rgba(30, 165, 76, 0.5); }
.ts-input::placeholder { color: rgba(255, 255, 255, 0.2); }

/* Stats bar */
.ts-stats {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 6px;
  padding: 16px 0;
}

.ts-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
}

.ts-stat-label {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  white-space: nowrap;
}

.ts-stat-value {
  font-size: 1.7rem;
  font-weight: 600;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #1ea54c;
  line-height: 1;
  white-space: nowrap;
}

.ts-divider {
  width: 1px;
  height: 48px;
  background: rgba(30, 165, 76, 0.15);
  flex-shrink: 0;
}
</style>
