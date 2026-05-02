<script setup lang="ts">
import { ulid } from 'ulid';
import _ from 'lodash';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';

const amount = useStorage('ulid-generator-amount', 1);
const format = useStorage<'raw' | 'json'>('ulid-generator-format', 'raw');

const [ulids, refreshUlids] = computedRefreshable(() => {
  const ids = _.times(amount.value, () => ulid());
  if (format.value === 'json') {
    return JSON.stringify(ids, null, 2);
  }
  return ids.join('\n');
});

const { copy } = useCopy({ source: ulids, text: 'ULIDs copied to the clipboard' });
</script>

<template>
  <div class="ul-wrap">
    <div class="ul-panel">
      <!-- Controls -->
      <div class="ul-controls">
        <div class="ul-field">
          <span class="ul-sublabel">QUANTITY</span>
          <div class="ul-stepper">
            <button class="ul-step-btn" :disabled="amount <= 1" @click="amount = Math.max(1, amount - 1)">
              −
            </button>
            <span class="ul-step-val">{{ amount }}</span>
            <button class="ul-step-btn" :disabled="amount >= 100" @click="amount = Math.min(100, amount + 1)">
              +
            </button>
          </div>
        </div>

        <div class="ul-field">
          <span class="ul-sublabel">FORMAT</span>
          <div class="ul-toggle-group">
            <button
              type="button"
              class="ul-toggle"
              :class="{ 'ul-toggle-on': format === 'raw' }"
              @click="format = 'raw'"
            >
              Raw
            </button>
            <button
              type="button"
              class="ul-toggle"
              :class="{ 'ul-toggle-on': format === 'json' }"
              @click="format = 'json'"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Output -->
      <div class="ul-output-wrap">
        <span class="ul-sublabel">OUTPUT</span>
        <div class="ul-output" data-test-id="ulids">
          <pre class="ul-output-text">{{ ulids }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="ul-actions">
        <button type="button" class="ul-btn ul-btn-primary" @click="copy()">
          <icon-mdi-content-copy />
          Copy
        </button>
        <button type="button" class="ul-btn" data-test-id="refresh" @click="refreshUlids()">
          <icon-mdi-refresh />
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ul-wrap {
  flex: 1 1 480px;
  max-width: 720px;
}

.ul-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ul-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.ul-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ul-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Stepper ── */
.ul-stepper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.ul-step-btn {
  width: 30px;
  height: 32px;
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

.ul-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.ul-step-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.1);
}

.ul-step-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.ul-step-val {
  min-width: 40px;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  padding: 0 4px;
}

/* ── Toggle pills ── */
.ul-toggle-group {
  display: flex;
  gap: 6px;
}

.ul-toggle {
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: all 0.15s;
}

.ul-toggle-on {
  border-color: #1ea54c;
  background: rgba(30, 165, 76, 0.15);
  color: #1ea54c;
}

/* ── Output ── */
.ul-output-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ul-output {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.15);
  border-radius: 5px;
  padding: 10px 14px;
  min-height: 42px;
}

.ul-output-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
}

/* ── Actions ── */
.ul-actions {
  display: flex;
  gap: 8px;
}

.ul-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: transparent;
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.ul-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.65);
  color: #1ea54c;
}

.ul-btn-primary {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}

.ul-btn-primary:hover {
  background: rgba(30, 165, 76, 0.22);
  border-color: #1ea54c;
}
</style>
