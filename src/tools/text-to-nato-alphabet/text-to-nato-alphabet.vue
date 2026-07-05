<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { natoAlphabet } from './text-to-nato-alphabet.constants';

const input = ref('');

interface NatoRow {
  char: string
  display: string
  nato: string
  isAlpha: boolean
}

const rows = computed<NatoRow[]>(() => {
  return input.value.split('').map((char) => {
    const idx = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
    const nato = natoAlphabet[idx];
    const isAlpha = nato !== undefined;
    return {
      char,
      display: char === ' ' ? '␣' : char,
      nato: nato ?? (char === ' ' ? '' : char),
      isAlpha,
    };
  });
});

const natoText = computed(() =>
  rows.value
    .filter(r => r.nato)
    .map(r => r.nato)
    .join(' '),
);

const { copy, isJustCopied: copied } = useCopy({ source: natoText, text: 'NATO string copied.' });
</script>

<template>
  <div class="nato-wrap">
    <!-- Input panel -->
    <div class="nato-input-panel">
      <span class="nato-sublabel">YOUR TEXT</span>
      <div class="nato-input-row">
        <input
          v-model="input"
          class="nato-input"
          placeholder="e.g. Hello world"
          spellcheck="false"
          autofocus
        >
        <button v-if="input" class="nato-clear-btn" @click="input = ''">
          ✕
        </button>
      </div>
    </div>

    <!-- Output terminal -->
    <div v-if="rows.length" class="nato-terminal">
      <div class="nato-terminal-header">
        <span class="nato-sublabel">NATO PHONETIC</span>
        <button class="nato-copy-btn" @click="copy()">
          <span v-if="copied">✓ Copied</span>
          <template v-else>
            <icon-mdi-content-copy />
            Copy all
          </template>
        </button>
      </div>
      <div
        v-for="(row, i) in rows"
        :key="i"
        class="nato-row"
        :class="{ 'nato-row-space': row.char === ' ' }"
      >
        <span class="nato-prompt">&gt;_</span>
        <span class="nato-char" :class="{ 'nato-char-symbol': !row.isAlpha && row.char !== ' ' }">
          {{ row.display }}
        </span>
        <span v-if="row.nato" class="nato-arrow">→</span>
        <span class="nato-word" :class="{ 'nato-word-dim': !row.isAlpha }">
          {{ row.nato || '&nbsp;' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nato-wrap {
  flex: 1 1 480px;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Input ── */
.nato-input-panel {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nato-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.nato-input-row {
  position: relative;
  display: flex;
  align-items: center;
}

.nato-input {
  width: 100%;
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 9px 36px 9px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.nato-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.nato-input:focus {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.nato-clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.12s;
}

.nato-clear-btn:hover {
  color: rgba(255, 255, 255, 0.7);
}

/* ── Terminal ── */
.nato-terminal {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.nato-terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 5px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nato-row {
  display: grid;
  grid-template-columns: auto 28px auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  background: transparent !important;
}

.nato-row:last-child {
  border-bottom: none;
}

.nato-row-space {
  opacity: 0.4;
}

.nato-prompt {
  color: rgba(var(--kt-accent-rgb), 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.nato-char {
  font-size: 0.88rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  text-transform: uppercase;
}

.nato-char-symbol {
  color: rgba(255, 255, 255, 0.35);
}

.nato-arrow {
  font-size: 0.75rem;
  color: rgba(var(--kt-accent-rgb), 0.35);
  user-select: none;
}

.nato-word {
  font-size: 0.85rem;
  color: var(--kt-accent);
  letter-spacing: 0.02em;
}

.nato-word-dim {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* ── Light mode ── */
html:not(.dark) .nato-sublabel { color: rgba(0, 0, 0, 0.65); }

html:not(.dark) .nato-input {
  background: #f0f0f0 !important;
  border-color: rgba(0, 0, 0, 0.18);
  color: rgba(0, 0, 0, 0.85);
}
html:not(.dark) .nato-input::placeholder { color: rgba(0, 0, 0, 0.28); }
html:not(.dark) .nato-input:focus { border-color: rgba(13, 112, 51, 0.55); }

/* .nato-input-panel matched by systemic [class*="-panel"] → gets #cccccc bg, visible on page */
html:not(.dark) .nato-input-panel { background: transparent !important; border: none !important; }
/* .nato-input-row caught by systemic [class*="-input-row"] → reset it */
html:not(.dark) .nato-input-row { background: transparent !important; border: none !important; }

html:not(.dark) .nato-clear-btn { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .nato-clear-btn:hover { color: rgba(0, 0, 0, 0.65); }

html:not(.dark) .nato-terminal-header {
  background: rgba(0, 0, 0, 0.05);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

html:not(.dark) .nato-char { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) .nato-char-symbol { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .nato-arrow { color: rgba(13, 112, 51, 0.40); }
html:not(.dark) .nato-word { color: #0d7033; }
html:not(.dark) .nato-word-dim { color: rgba(0, 0, 0, 0.30); }

html:not(.dark) .nato-copy-btn {
  background: rgba(13, 112, 51, 0.08);
  border-color: rgba(13, 112, 51, 0.30);
  color: #0b5c28;
}
html:not(.dark) .nato-copy-btn:hover {
  background: rgba(13, 112, 51, 0.18);
  border-color: #0d7033;
  color: #0d7033;
}

/* ── Copy button ── */
.nato-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.35);
  background: rgba(var(--kt-accent-rgb), 0.08);
  color: rgba(var(--kt-accent-rgb), 0.8);
  font-size: 0.7rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.nato-copy-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.18);
  border-color: var(--kt-accent);
  color: var(--kt-accent);
}
</style>
