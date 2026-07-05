<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from './text-to-binary.models';

const text = ref('');
const binary = ref('');
let updating = false;

const binaryValid = computed(() =>
  binary.value === '' || isNotThrowing(() => convertAsciiBinaryToText(binary.value)),
);

watch(text, (val) => {
  if (updating) {
    return;
  }
  updating = true;
  binary.value = convertTextToAsciiBinary(val);
  nextTick(() => {
    updating = false;
  });
});

watch(binary, (val) => {
  if (updating) {
    return;
  }
  if (val === '' || isNotThrowing(() => convertAsciiBinaryToText(val))) {
    updating = true;
    text.value = withDefaultOnError(() => convertAsciiBinaryToText(val), '');
    nextTick(() => {
      updating = false;
    });
  }
});

const { copy: copyText, isJustCopied: copiedText } = useCopy({ source: text, text: 'Text copied' });
const { copy: copyBinary, isJustCopied: copiedBinary } = useCopy({ source: binary, text: 'Binary copied' });
</script>

<template>
  <div class="tb-wrap">
    <div class="tb-panel kt-terminal">
      <div class="tb-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">TEXT ↔ ASCII BINARY</span>
      </div>
      <div class="tb-body">
        <!-- Text side -->
        <div class="tb-side">
          <div class="tb-side-header">
            <span class="tb-sublabel">TEXT</span>
            <button class="tb-copy-btn" :disabled="!text" @click="copyText()">
              <span v-if="copiedText">✓ Copied</span>
              <template v-else>
                <icon-mdi-content-copy />
                Copy
              </template>
            </button>
          </div>
          <textarea
            v-model="text"
            class="tb-textarea"
            placeholder="e.g. Hello world"
            rows="8"
            spellcheck="false"
            autofocus
            data-test-id="text-to-binary-input"
          />
        </div>

        <!-- Divider -->
        <div class="tb-divider">
          <span class="tb-arrows">⟷</span>
          <span class="tb-divider-label">ASCII<br>BIN</span>
        </div>

        <!-- Binary side -->
        <div class="tb-side">
          <div class="tb-side-header">
            <span class="tb-sublabel">BINARY</span>
            <button class="tb-copy-btn" :disabled="!binary || !binaryValid" @click="copyBinary()">
              <span v-if="copiedBinary">✓ Copied</span>
              <template v-else>
                <icon-mdi-content-copy />
                Copy
              </template>
            </button>
          </div>
          <textarea
            v-model="binary"
            class="tb-textarea tb-textarea-binary"
            :class="{ 'tb-textarea-error': binary && !binaryValid }"
            placeholder="e.g. 01001000 01100101 01101100 01101100 01101111"
            rows="8"
            spellcheck="false"
            data-test-id="binary-to-text-input"
          />
          <span v-if="binary && !binaryValid" class="tb-error-msg">
            Must be valid ASCII binary (multiples of 8 bits)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tb-wrap {
  flex: 1 1 700px;
  max-width: 1200px;
}

.tb-panel {
  display: flex;
  flex-direction: column;
}

.tb-panel-bar {
  /* padding inherits from .kt-terminal-bar global (6px 10px) */
}

.tb-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
}

/* ── Side ── */
.tb-side {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tb-side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tb-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Textarea ── */
.tb-textarea {
  width: 100%;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 10px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: vertical;
  line-height: 1.65;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.tb-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.tb-textarea:focus {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.tb-textarea-binary {
  color: var(--kt-accent);
  font-size: 0.75rem;
  word-break: break-all;
}

.tb-textarea-error {
  border-color: rgba(224, 85, 85, 0.45) !important;
}

/* ── Divider ── */
.tb-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 28px;
  flex-shrink: 0;
}

.tb-arrows {
  font-size: 1.1rem;
  color: rgba(var(--kt-accent-rgb), 0.35);
  user-select: none;
}

.tb-divider-label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  text-align: center;
  line-height: 1.4;
}

/* ── Error ── */
.tb-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Copy button ── */
.tb-copy-btn {
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

.tb-copy-btn:hover:not(:disabled) {
  background: rgba(var(--kt-accent-rgb), 0.18);
  border-color: var(--kt-accent);
  color: var(--kt-accent);
}

.tb-copy-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ── Responsive: single column ── */
@media (max-width: 500px) {
  .tb-body {
    flex-direction: column;
    align-items: stretch;
  }

  .tb-divider {
    flex-direction: row;
    padding-top: 0;
    width: 100%;
    justify-content: center;
    gap: 8px;
  }
}

/* ── Light mode ── */
html:not(.dark) .tb-sublabel { color: rgba(0, 0, 0, 0.55); }

html:not(.dark) .tb-arrows { color: rgba(13, 112, 51, 0.45); }

html:not(.dark) .tb-divider-label { color: rgba(0, 0, 0, 0.30); }

html:not(.dark) .tb-textarea {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.18);
  color: rgba(0, 0, 0, 0.85);
}

html:not(.dark) .tb-textarea::placeholder { color: rgba(0, 0, 0, 0.25); }
html:not(.dark) .tb-textarea:focus { border-color: rgba(13, 112, 51, 0.55); }
html:not(.dark) .tb-textarea-binary { color: #0d7033; }

html:not(.dark) .tb-copy-btn {
  background: rgba(13, 112, 51, 0.08);
  border-color: rgba(13, 112, 51, 0.30);
  color: #0b5c28;
}

html:not(.dark) .tb-copy-btn:hover:not(:disabled) {
  background: rgba(13, 112, 51, 0.18);
  border-color: #0d7033;
  color: #0d7033;
}
</style>
