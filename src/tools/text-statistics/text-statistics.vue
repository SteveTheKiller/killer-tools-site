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
  container-type: inline-size;
}

.ts-input {
  width: 100%;
  box-sizing: border-box;
  background: #0f0f11;
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

/* ── Light mode ── */
html:not(.dark) .ts-input {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.80);
}
html:not(.dark) .ts-input:focus       { border-color: rgba(13, 112, 51, 0.50); }
html:not(.dark) .ts-input::placeholder { color: rgba(0, 0, 0, 0.30); }

html:not(.dark) .ts-stats {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.12);
}
html:not(.dark) .ts-stat-label { color: rgba(0, 0, 0, 0.45); }
html:not(.dark) .ts-stat-value { color: #0b5c28; }
html:not(.dark) .ts-divider    { background: rgba(0, 0, 0, 0.10); }

/* ── Mobile: stack vertically ── */
@container (max-width: 520px) {
  .ts-stats {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .ts-stat {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(30, 165, 76, 0.1);
  }

  .ts-stat:last-child { border-bottom: none; }

  .ts-divider { display: none; }
}

html:not(.dark) .ts-stat { border-bottom-color: rgba(0, 0, 0, 0.08); }
</style>
