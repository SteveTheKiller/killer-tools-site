<script setup lang="ts">
import { useEventListener } from '@vueuse/core';

const event = ref<KeyboardEvent>();

useEventListener(document, 'keydown', (e) => {
  event.value = e;
});

const fields = computed(() => [
  { label: 'Key', value: event.value?.key ?? '' },
  { label: 'Keycode', value: event.value ? String(event.value.keyCode) : '' },
  { label: 'Code', value: event.value?.code ?? '' },
  { label: 'Location', value: event.value ? String(event.value.location) : '' },
  {
    label: 'Modifiers',
    value: event.value
      ? [
          event.value.metaKey && 'Meta',
          event.value.shiftKey && 'Shift',
          event.value.ctrlKey && 'Ctrl',
          event.value.altKey && 'Alt',
        ].filter(Boolean).join(' + ')
      : '',
  },
]);

const copiedLabel = ref<string | null>(null);
async function copyValue(label: string, value: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) copiedLabel.value = null;
  }, 2000);
}
</script>

<template>
  <div class="kc-wrap">
    <!-- Key display -->
    <div class="kc-display">
      <div class="kc-key-area">
        <span v-if="event && event.key.length === 1" class="kc-key-char">{{ event.key }}</span>
        <span v-else-if="event" class="kc-key-name">{{ event.key }}</span>
        <span v-else class="kc-key-placeholder">—</span>
      </div>
      <span class="kc-hint">
        <span class="kc-cursor">▋</span>
        Press any key to get info
      </span>
    </div>

    <!-- Fields terminal (always rendered) -->
    <div class="kc-terminal">
      <div
        v-for="{ label, value } in fields"
        :key="label"
        class="kc-row"
        :class="{ 'kc-row-empty': !value }"
        @click="copyValue(label, value)"
      >
        <span class="kc-prompt">&gt;_</span>
        <span class="kc-label">{{ label }}</span>
        <span class="kc-value">{{ value || '—' }}</span>
        <span class="kc-copy-icon" :class="{ 'kc-copy-done': copiedLabel === label }">
          <span v-if="copiedLabel === label">✓</span>
          <icon-mdi-content-copy v-else-if="value" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kc-wrap {
  flex: 1 1 500px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Key display ── */
.kc-display {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 120px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  text-align: center;
}

.kc-key-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
}

.kc-key-char {
  font-size: 3rem;
  font-weight: 600;
  color: #1ea54c;
  line-height: 1;
}

.kc-key-name {
  font-size: 1.6rem;
  font-weight: 600;
  color: #1ea54c;
  line-height: 1;
}

.kc-key-placeholder {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.15);
  line-height: 1;
}

.kc-hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  gap: 6px;
}

.kc-cursor {
  color: rgba(30, 165, 76, 0.6);
  animation: kc-blink 1.1s step-end infinite;
}

@keyframes kc-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── Terminal rows ── */
.kc-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.kc-row {
  display: grid;
  grid-template-columns: auto 120px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
}

.kc-row:last-child {
  border-bottom: none;
}

.kc-row:hover {
  background: rgba(30, 165, 76, 0.05);
}

.kc-row-empty {
  cursor: default;
}

.kc-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.kc-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.kc-value {
  color: #1ea54c;
  font-size: 0.85rem;
  word-break: break-all;
  min-width: 0;
}

.kc-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.kc-row:hover .kc-copy-icon {
  color: rgba(30, 165, 76, 0.8);
}

.kc-copy-done {
  color: #1ea54c !important;
}
</style>
