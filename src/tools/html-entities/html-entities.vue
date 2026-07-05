<script setup lang="ts">
import { escape, unescape } from 'lodash';

const escapeInput = ref('<a href="https://killertools.net">Killer Tools & Utilities</a>');
const escapeOutput = computed(() => escape(escapeInput.value));

const unescapeInput = ref('&lt;a href=&quot;https://killertools.net&quot;&gt;Killer Tools &amp; Utilities&lt;/a&gt;');
const unescapeOutput = computed(() => unescape(unescapeInput.value));

const copiedEscape = ref(false);
const copiedUnescape = ref(false);

async function copyEscape() {
  await navigator.clipboard.writeText(escapeOutput.value);
  copiedEscape.value = true;
  setTimeout(() => {
    copiedEscape.value = false;
  }, 2000);
}

async function copyUnescape() {
  await navigator.clipboard.writeText(unescapeOutput.value);
  copiedUnescape.value = true;
  setTimeout(() => {
    copiedUnescape.value = false;
  }, 2000);
}
</script>

<template>
  <div class="he-layout">
    <!-- ESCAPE panel -->
    <div class="he-terminal kt-terminal">
      <div class="he-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">YOUR STRING</span>
      </div>
      <div class="he-body-area">
        <textarea
          v-model="escapeInput"
          class="he-textarea"
          placeholder="The string to escape..."
          rows="4"
          spellcheck="false"
        />
      </div>

      <div class="he-section-header">
        ESCAPED OUTPUT
      </div>

      <div class="he-output-area">
        <textarea
          class="he-textarea he-textarea-readonly"
          :value="escapeOutput"
          readonly
          rows="4"
          spellcheck="false"
        />
      </div>

      <div class="he-actions">
        <button class="he-copy-btn" @click="copyEscape">
          <icon-mdi-content-copy v-if="!copiedEscape" />
          <span v-else>✓</span>
          {{ copiedEscape ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </div>

    <!-- UNESCAPE panel -->
    <div class="he-terminal kt-terminal">
      <div class="he-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">YOUR ESCAPED STRING</span>
      </div>
      <div class="he-body-area">
        <textarea
          v-model="unescapeInput"
          class="he-textarea"
          placeholder="The string to unescape..."
          rows="4"
          spellcheck="false"
        />
      </div>

      <div class="he-section-header">
        UNESCAPED OUTPUT
      </div>

      <div class="he-output-area">
        <textarea
          class="he-textarea he-textarea-readonly"
          :value="unescapeOutput"
          readonly
          rows="4"
          spellcheck="false"
        />
      </div>

      <div class="he-actions">
        <button class="he-copy-btn" @click="copyUnescape">
          <icon-mdi-content-copy v-if="!copiedUnescape" />
          <span v-else>✓</span>
          {{ copiedUnescape ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.he-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1 1 800px;
  min-width: 0;
  container-type: inline-size;
}

@media (max-width: 900px) {
  .he-layout { flex-direction: column; align-items: stretch; }
  .he-terminal { flex-basis: auto; }
}

/* ── Terminal panel ── */
.he-terminal {
  flex: 1 1 400px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.he-bar {
  /* padding inherits from .kt-terminal-bar global (6px 10px) */
}

/* ── Body area ── */
.he-body-area {
  padding: 10px 12px;
  border-bottom: 1px solid var(--kt-term-bar-border);
}

.he-textarea {
  width: 100%;
  background: transparent !important;
  border: none;
  outline: none;
  box-shadow: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
}

.he-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* ── Section header ── */
.he-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
  padding: 5px 12px 3px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.1s;
}

.he-terminal:hover .he-section-header {
  background: var(--kt-term-bar-hover-bg);
}

/* ── Output area ── */
.he-output-area {
  padding: 10px 12px;
  border-bottom: 1px solid var(--kt-term-bar-border);
  flex: 1;
}

.he-textarea-readonly {
  color: var(--kt-accent);
  cursor: default;
}

/* ── Actions ── */
.he-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
}

.he-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.35);
  border-radius: 4px;
  color: rgba(var(--kt-accent-rgb), 0.75);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  padding: 4px 12px;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}

.he-copy-btn:hover {
  color: var(--kt-accent);
  border-color: rgba(var(--kt-accent-rgb), 0.7);
  background: rgba(var(--kt-accent-rgb), 0.06);
}
</style>
