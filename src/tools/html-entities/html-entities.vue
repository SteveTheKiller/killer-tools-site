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
    <div class="he-terminal">
      <div class="he-input-area">
        <label class="he-field-label">Your string</label>
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
    <div class="he-terminal">
      <div class="he-input-area">
        <label class="he-field-label">Your escaped string</label>
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

@container (max-width: 700px) {
  .he-layout { flex-direction: column; }
}

/* ── Terminal panel ── */
.he-terminal {
  flex: 1 1 400px;
  min-width: 0;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  display: flex;
  flex-direction: column;
}

/* ── Input area ── */
.he-input-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.he-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.he-textarea {
  width: 100%;
  background: transparent;
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
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Output area ── */
.he-output-area {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex: 1;
}

.he-textarea-readonly {
  color: #1ea54c;
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
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.75);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  padding: 4px 12px;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}

.he-copy-btn:hover {
  color: #1ea54c;
  border-color: rgba(30, 165, 76, 0.7);
  background: rgba(30, 165, 76, 0.06);
}
</style>
