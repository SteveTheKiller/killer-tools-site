<script setup lang="ts">
import { compareSync, hashSync } from 'bcryptjs';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const input = ref('');
const saltCount = ref(10);
const hashed = computed(() => hashSync(input.value, saltCount.value));
const { copy } = useCopy({ source: hashed, text: t('tools.bcrypt.ui.copiedToClipboard') });

const compareString = ref('');
const compareHash = ref('');
const compareMatch = computed(() => {
  if (!compareString.value || !compareHash.value) {
    return null;
  }
  try {
    return compareSync(compareString.value, compareHash.value);
  }
  catch {
    return false;
  }
});
</script>

<template>
  <div class="bc-wrap">
    <!-- Hash panel -->
    <div class="kt-terminal bc-panel">
      <div class="kt-terminal-bar bc-panel-header">
        <span class="kt-terminal-bar-title">{{ t('tools.bcrypt.ui.hashTitle') }}</span>
      </div>

      <div class="bc-body">
        <div class="bc-field">
          <span class="bc-label">{{ t('tools.bcrypt.ui.stringLabel') }}</span>
          <input
            v-model="input"
            class="bc-input"
            :placeholder="t('tools.bcrypt.ui.stringPlaceholder')"
            type="text"
          >
        </div>

        <div class="bc-field">
          <span class="bc-label">{{ t('tools.bcrypt.ui.saltRoundsLabel') }}</span>
          <div class="bc-salt-row">
            <button class="bc-salt-btn" :disabled="saltCount <= 1" @click="saltCount = Math.max(1, saltCount - 1)">
              −
            </button>
            <span class="bc-salt-val">{{ saltCount }}</span>
            <button class="bc-salt-btn" :disabled="saltCount >= 100" @click="saltCount = Math.min(100, saltCount + 1)">
              +
            </button>
          </div>
        </div>

        <div class="bc-output-wrap">
          <span class="bc-section-label">{{ t('tools.bcrypt.ui.outputLabel') }}</span>
          <div class="bc-output">
            <span class="bc-hash-text">{{ hashed }}</span>
          </div>
        </div>

        <div class="bc-actions">
          <button class="bc-btn bc-btn-primary" @click="copy()">
            <icon-mdi-content-copy />
            {{ t('tools.bcrypt.ui.copyHash') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Compare panel -->
    <div class="kt-terminal bc-panel">
      <div class="kt-terminal-bar bc-panel-header">
        <span class="kt-terminal-bar-title">{{ t('tools.bcrypt.ui.compareTitle') }}</span>
      </div>

      <div class="bc-body">
        <div class="bc-field">
          <span class="bc-label">{{ t('tools.bcrypt.ui.stringLabel') }}</span>
          <input
            v-model="compareString"
            class="bc-input"
            :placeholder="t('tools.bcrypt.ui.compareStringPlaceholder')"
            type="text"
          >
        </div>

        <div class="bc-field">
          <span class="bc-label">{{ t('tools.bcrypt.ui.hashLabel') }}</span>
          <input
            v-model="compareHash"
            class="bc-input"
            :placeholder="t('tools.bcrypt.ui.compareHashPlaceholder')"
            type="text"
          >
        </div>

        <div class="bc-result-row">
          <span class="bc-label">{{ t('tools.bcrypt.ui.matchLabel') }}</span>
          <span
            v-if="compareMatch === null"
            class="bc-result bc-result-idle"
          >&mdash;</span>
          <span
            v-else-if="compareMatch"
            class="bc-result bc-result-yes"
          >✓ {{ t('tools.bcrypt.ui.yes') }}</span>
          <span
            v-else
            class="bc-result bc-result-no"
          >✗ {{ t('tools.bcrypt.ui.no') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1 1 600px;
  max-width: 1200px;
  align-items: flex-start;
}

.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

/* ── Panel ── */
.bc-panel {
  flex: 1 1 340px;
}

.bc-panel-header {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bc-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Field row ── */
.bc-field {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px;
}

.bc-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

/* ── Text input ── */
.bc-input {
  width: 100%;
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 6px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.bc-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.bc-input:focus {
  border-color: rgba(var(--kt-accent-rgb), 0.6);
}

/* ── Salt stepper ── */
.bc-salt-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bc-salt-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  background: transparent !important;
  color: var(--kt-accent);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bc-salt-btn:hover:not(:disabled) {
  background: rgba(var(--kt-accent-rgb), 0.12);
  border-color: rgba(var(--kt-accent-rgb), 0.6);
}

.bc-salt-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.bc-salt-val {
  font-size: 0.82rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: var(--kt-accent);
  min-width: 24px;
  text-align: center;
}

/* ── Output block ── */
.bc-output-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bc-section-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.bc-output {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.15);
  border-radius: 5px;
  padding: 8px 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.bc-hash-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.76rem;
  color: var(--kt-accent);
  word-break: break-all;
}

/* ── Actions ── */
.bc-actions {
  display: flex;
  gap: 8px;
}

.bc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 5px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.35);
  background: transparent !important;
  color: rgba(var(--kt-accent-rgb), 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.bc-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.1);
  border-color: rgba(var(--kt-accent-rgb), 0.65);
  color: var(--kt-accent);
}

.bc-btn-primary {
  background: rgba(var(--kt-accent-rgb), 0.12);
  border-color: rgba(var(--kt-accent-rgb), 0.5);
  color: var(--kt-accent);
}

.bc-btn-primary:hover {
  background: rgba(var(--kt-accent-rgb), 0.22);
  border-color: var(--kt-accent);
}

/* ── Match result ── */
.bc-result-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.bc-result {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 600;
}

.bc-result-idle {
  color: rgba(255, 255, 255, 0.2);
}

.bc-result-yes {
  color: var(--kt-accent);
}

.bc-result-no {
  color: #e05555;
}
</style>
