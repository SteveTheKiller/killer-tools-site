<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { decodeJwt } from './jwt-parser.service';

const styleStore = useStyleStore();
const isLight = computed(() => !styleStore.isDarkTheme);

const rawJwt = ref(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
);

const isValid = computed(() =>
  rawJwt.value.length > 0 && isNotThrowing(() => decodeJwt({ jwt: rawJwt.value })),
);

const decodedJWT = computed(() =>
  withDefaultOnError(() => decodeJwt({ jwt: rawJwt.value }), { header: [], payload: [] }),
);

const sections = [
  { key: 'header', title: 'Header' },
  { key: 'payload', title: 'Payload' },
] as const;

const copiedKey = ref<string | null>(null);
async function copyValue(key: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) {
      copiedKey.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="jwt-wrap">
    <!-- Input -->
    <div class="jwt-top-box">
      <div
        class="jwt-field-wrap kt-terminal"
        :class="{ 'jwt-textarea-error': rawJwt && !isValid }"
      >
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">JWT TO DECODE</span>
        </div>
        <textarea
          v-model="rawJwt"
          class="jwt-textarea"
          placeholder="Put your token here..."
          rows="4"
          spellcheck="false"
          autofocus
          :style="isLight ? 'background: #f0f0f0 !important; color: rgba(0,0,0,0.85) !important' : 'background: #121212 !important; color: rgba(255,255,255,0.85) !important'"
        />
      </div>
      <span v-if="rawJwt && !isValid" class="jwt-error-msg">Invalid JWT</span>
    </div>

    <!-- Decoded terminal -->
    <div v-if="isValid" class="jwt-terminal kt-terminal">
      <template v-for="section of sections" :key="section.key">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">{{ section.title.toUpperCase() }}</span>
        </div>
        <div
          v-for="{ claim, claimDescription, friendlyValue, value } in decodedJWT[section.key]"
          :key="claim + value"
          class="jwt-row"
          @click="copyValue(`${section.key}-${claim}`, String(value))"
        >
          <span class="jwt-prompt">&gt;_</span>
          <span class="jwt-claim">
            <span class="jwt-claim-key">{{ claim }}</span>
            <span v-if="claimDescription" class="jwt-claim-desc">({{ claimDescription }})</span>
          </span>
          <span class="jwt-value-cell">
            <span class="jwt-value">{{ value }}</span>
            <span v-if="friendlyValue" class="jwt-friendly">({{ friendlyValue }})</span>
          </span>
          <span class="jwt-copy-icon" :class="{ 'jwt-copy-done': copiedKey === `${section.key}-${claim}` }">
            <span v-if="copiedKey === `${section.key}-${claim}`">✓</span>
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.jwt-wrap {
  flex: 1 1 560px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Input ── */
.jwt-top-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.jwt-field-wrap {
  display: flex;
  flex-direction: column;
}

.jwt-field-wrap:focus-within {
  border-color: rgba(var(--kt-accent-rgb), 0.55) !important;
}

.jwt-textarea-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.jwt-textarea {
  width: 100%;
  background: #121212;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
  display: block;
}

.jwt-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.jwt-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Terminal ── */
.jwt-terminal {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.jwt-row {
  display: grid;
  grid-template-columns: auto 200px 1fr auto;
  align-items: baseline;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.jwt-row:last-child {
  border-bottom: none;
}

.jwt-row:hover {
  background: rgba(var(--kt-accent-rgb), 0.05) !important;
}

.jwt-prompt {
  color: rgba(var(--kt-accent-rgb), 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  align-self: center;
}

.jwt-claim {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.jwt-claim-key {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}

.jwt-claim-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.jwt-value-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.jwt-value {
  color: var(--kt-accent);
  font-size: 0.82rem;
  word-break: break-all;
}

.jwt-friendly {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}

.jwt-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(var(--kt-accent-rgb), 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
  align-self: center;
}

.jwt-row:hover .jwt-copy-icon {
  color: rgba(var(--kt-accent-rgb), 0.8);
}

.jwt-copy-done {
  color: var(--kt-accent) !important;
}

/* ── Light mode ── */
html:not(.dark) .jwt-textarea::placeholder { color: rgba(0, 0, 0, 0.25); }
html:not(.dark) .jwt-claim-key { color: rgba(0, 0, 0, 0.80); }
html:not(.dark) .jwt-claim-desc { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .jwt-value { color: #0d7033; }
html:not(.dark) .jwt-friendly { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .jwt-copy-icon { color: rgba(13, 112, 51, 0.35); }
html:not(.dark) .jwt-row:hover { background: rgba(13, 112, 51, 0.08) !important; }
html:not(.dark) .jwt-row:hover .jwt-copy-icon { color: rgba(13, 112, 51, 0.75); }
html:not(.dark) .jwt-copy-done { color: #0d7033 !important; }
</style>
