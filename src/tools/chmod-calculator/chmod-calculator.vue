<script setup lang="ts">
import type { Group, Scope } from './chmod-calculator.types';
import { useCopy } from '@/composable/copy';
import { useStyleStore } from '@/stores/style.store';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation } from './chmod-calculator.service';

const scopes: { scope: Scope, title: string, bit: number }[] = [
  { scope: 'read', title: 'Read', bit: 4 },
  { scope: 'write', title: 'Write', bit: 2 },
  { scope: 'execute', title: 'Execute', bit: 1 },
];

const groups: { key: Group, label: string, short: string }[] = [
  { key: 'owner', label: 'Owner', short: 'u' },
  { key: 'group', label: 'Group', short: 'g' },
  { key: 'public', label: 'Public', short: 'o' },
];

const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions: permissions.value }));
const command = computed(() => `chmod ${octal.value} path`);

const { copy } = useCopy({ source: command, text: 'chmod command copied' });

const styleStore = useStyleStore();

// Digit color per octal value
function digitColor(n: number) {
  const dark = styleStore.isDarkTheme;
  if (n === 0) {
    return dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)';
  }
  if (n >= 6) {
    return '#1ea54c';
  }
  if (n >= 4) {
    return dark ? '#8be0a8' : '#2a9650';
  }
  return dark ? '#c9f5d8' : '#4db87a';
}
</script>

<template>
  <div class="ch-wrap">
    <div class="ch-panel">
      <!-- Permission grid -->
      <div class="ch-grid">
        <!-- Header row -->
        <div class="ch-cell ch-header-blank" />
        <div v-for="g in groups" :key="g.key" class="ch-cell ch-col-header">
          {{ g.label }}
          <span class="ch-short">({{ g.short }})</span>
        </div>

        <!-- Permission rows -->
        <template v-for="s in scopes" :key="s.scope">
          <div class="ch-cell ch-row-label">
            <span class="ch-scope-name">{{ s.title }}</span>
            <span class="ch-scope-bit">{{ s.bit }}</span>
          </div>
          <div v-for="g in groups" :key="g.key" class="ch-cell ch-checkbox-cell">
            <button
              type="button"
              class="ch-checkbox"
              :class="{ 'ch-checkbox-on': permissions[g.key][s.scope] }"
              @click="permissions[g.key][s.scope] = !permissions[g.key][s.scope]"
            >
              <icon-mdi-check v-if="permissions[g.key][s.scope]" />
            </button>
          </div>
        </template>
      </div>

      <!-- Divider -->
      <div class="ch-divider" />

      <!-- Octal + symbolic display -->
      <div class="ch-results">
        <div class="ch-octal-row">
          <span
            v-for="(digit, i) in octal.split('')"
            :key="i"
            class="ch-digit"
            :style="{ color: digitColor(Number(digit)) }"
          >{{ digit }}</span>
        </div>
        <div class="ch-symbolic">
          {{ symbolic }}
        </div>
      </div>

      <!-- Command output -->
      <div class="ch-cmd-wrap">
        <div class="ch-input-row">
          <span class="ch-prompt">&gt;_</span>
          <span class="ch-cmd-text">{{ command }}</span>
          <button class="ch-copy-btn" title="Copy command" @click="copy()">
            <icon-mdi-content-copy />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ch-wrap {
  flex: 1 1 480px;
  max-width: 640px;
}

.ch-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  overflow: hidden;
}

/* ── Permission grid ── */
.ch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid rgba(30, 165, 76, 0.1);
}

.ch-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  border-right: 1px solid rgba(30, 165, 76, 0.07);
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
}

.ch-cell:nth-child(4n) {
  border-right: none;
}

.ch-header-blank {
  background: rgba(255, 255, 255, 0.01);
}

.ch-col-header {
  flex-direction: column;
  gap: 2px;
  font-size: 0.75rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  background: rgba(255, 255, 255, 0.02);
}

.ch-short {
  font-size: 0.6rem;
  color: rgba(30, 165, 76, 0.5);
}

.ch-row-label {
  justify-content: flex-end;
  gap: 8px;
  padding-right: 14px;
}

.ch-scope-name {
  font-size: 0.75rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.45);
}

.ch-scope-bit {
  font-size: 0.65rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(30, 165, 76, 0.4);
  min-width: 10px;
}

/* ── Custom checkbox ── */
.ch-checkbox-cell {
  padding: 10px;
}

.ch-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(30, 165, 76, 0.25);
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.ch-checkbox:hover {
  border-color: rgba(30, 165, 76, 0.5);
  background: rgba(30, 165, 76, 0.05);
}

.ch-checkbox-on {
  background: rgba(30, 165, 76, 0.18);
  border-color: #1ea54c;
  color: #1ea54c;
}

/* ── Divider ── */
.ch-divider {
  height: 1px;
  background: rgba(30, 165, 76, 0.1);
}

/* ── Results ── */
.ch-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px 16px;
}

.ch-octal-row {
  display: flex;
  gap: 4px;
}

.ch-digit {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1;
  transition: color 0.2s;
}

.ch-symbolic {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1rem;
  color: rgba(30, 165, 76, 0.6);
  letter-spacing: 0.12em;
}

/* ── Command row ── */
.ch-cmd-wrap {
  padding: 0 0 0 0;
  border-top: 1px solid rgba(30, 165, 76, 0.1);
}

.ch-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
}

.ch-prompt {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;
}

.ch-cmd-text {
  flex: 1 1 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
}

.ch-copy-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.ch-copy-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.55);
  color: #1ea54c;
}

/* ── Light mode ── */
html:not(.dark) .ch-panel {
  background: var(--kt-term-bg, #e0e0e0);
  border-color: rgba(13, 112, 51, 0.25);
}

html:not(.dark) .ch-grid {
  border-bottom-color: rgba(13, 112, 51, 0.15);
}

html:not(.dark) .ch-cell {
  border-right-color: rgba(13, 112, 51, 0.10);
  border-bottom-color: rgba(13, 112, 51, 0.10);
}

html:not(.dark) .ch-col-header {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.03);
}

html:not(.dark) .ch-scope-name { color: rgba(0, 0, 0, 0.55); }
html:not(.dark) .ch-scope-bit  { color: rgba(13, 112, 51, 0.55); }

html:not(.dark) .ch-checkbox {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(13, 112, 51, 0.30);
}

html:not(.dark) .ch-checkbox:hover {
  background: rgba(13, 112, 51, 0.08);
  border-color: rgba(13, 112, 51, 0.55);
}

html:not(.dark) .ch-checkbox-on {
  background: rgba(13, 112, 51, 0.15);
  border-color: #0d7033;
  color: #0d7033;
}

html:not(.dark) .ch-symbolic   { color: rgba(13, 112, 51, 0.70); }

html:not(.dark) .ch-cmd-wrap   { border-top-color: rgba(13, 112, 51, 0.15); }

html:not(.dark) .ch-prompt     { color: rgba(13, 112, 51, 0.55); }

html:not(.dark) .ch-copy-btn {
  border-color: rgba(13, 112, 51, 0.25);
  color: rgba(13, 112, 51, 0.60);
}

html:not(.dark) .ch-copy-btn:hover {
  background: rgba(13, 112, 51, 0.10);
  border-color: rgba(13, 112, 51, 0.55);
  color: #0d7033;
}
</style>
