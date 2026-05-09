<script setup lang="ts">
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { decodeJwt } from './jwt-parser.service';

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
    <div class="jwt-input-panel">
      <span class="jwt-sublabel">JWT TO DECODE</span>
      <div class="jwt-textarea-wrap" :class="{ 'jwt-textarea-error': rawJwt && !isValid }">
        <textarea
          v-model="rawJwt"
          class="jwt-textarea"
          placeholder="Put your token here..."
          rows="4"
          spellcheck="false"
          autofocus
        />
      </div>
      <span v-if="rawJwt && !isValid" class="jwt-error-msg">Invalid JWT</span>
    </div>

    <!-- Decoded terminal -->
    <div v-if="isValid" class="jwt-terminal">
      <template v-for="section of sections" :key="section.key">
        <div class="jwt-section-header">
          {{ section.title.toUpperCase() }}
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
.jwt-input-panel {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.jwt-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.jwt-textarea-wrap {
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.jwt-textarea-wrap:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.jwt-textarea-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.jwt-textarea {
  width: 100%;
  background: #0f0f11 !important;
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
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.jwt-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
  padding: 5px 12px 3px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
}

.jwt-row {
  display: grid;
  grid-template-columns: auto 200px 1fr auto;
  align-items: baseline;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
  background: transparent !important;
}

.jwt-row:last-child {
  border-bottom: none;
}

.jwt-row:hover {
  background: rgba(30, 165, 76, 0.05) !important;
}

.jwt-prompt {
  color: rgba(30, 165, 76, 0.5);
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
  color: #1ea54c;
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
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
  align-self: center;
}

.jwt-row:hover .jwt-copy-icon {
  color: rgba(30, 165, 76, 0.8);
}

.jwt-copy-done {
  color: #1ea54c !important;
}
</style>
