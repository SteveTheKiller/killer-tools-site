<script setup lang="ts">
import type { lib } from 'crypto-js';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';

import { convertHexToBin } from './hash-text.service';
import { useQueryParam } from '@/composable/queryParams';

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = keyof typeof enc | 'Bin';
const algoNames = Object.keys(algos) as AlgoNames[];
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');
const copiedAlgo = ref<AlgoNames | null>(null);

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }

  return words.toString(enc[encoding]);
}

const hashText = (algo: AlgoNames, value: string) => formatWithEncoding(algos[algo](value), encoding.value);

async function copyHash(algo: AlgoNames) {
  const value = hashText(algo, clearText.value);
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedAlgo.value = algo;
  setTimeout(() => {
    if (copiedAlgo.value === algo) {
      copiedAlgo.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="hash-tool">
    <c-card>
      <c-input-text v-model:value="clearText" multiline raw-text placeholder="Your string to hash..." rows="3" autosize autofocus label="Your text to hash:" />

      <n-divider />

      <div class="encoding-wrap">
        <c-select
          v-model:value="encoding"
          mb-4
          label="Digest encoding"
          :options="[
            {
              label: 'Binary (base 2)',
              value: 'Bin',
            },
            {
              label: 'Hexadecimal (base 16)',
              value: 'Hex',
            },
            {
              label: 'Base64 (base 64)',
              value: 'Base64',
            },
            {
              label: 'Base64url (base 64 with url safe chars)',
              value: 'Base64url',
            },
          ]"
        />
      </div>

      <div class="hash-section-label">
        Output
      </div>

      <div class="hash-grid">
        <div v-for="algo in algoNames" :key="algo" class="hash-row">
          <span class="hash-prompt">&gt;_</span>
          <span class="hash-label">{{ algo }}</span>
          <code class="hash-value">{{ hashText(algo, clearText) }}</code>
          <button
            type="button"
            class="hash-copy"
            :title="copiedAlgo === algo ? 'Copied!' : 'Copy hash'"
            @click="copyHash(algo)"
          >
            <span v-if="copiedAlgo === algo" class="hash-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.hash-tool {
  flex: 1 1 900px;
  max-width: 1600px;
  container-type: inline-size;
}

/* ── Encoding selector: cap so it doesn't stretch full width ───────── */
.encoding-wrap {
  max-width: 360px;
}

/* ── Section label above output rows ───────────────────────────────── */
.hash-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

/* ── Output grid ───────────────────────────────────────────────────── */
.hash-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Single hash row (terminal-style) ──────────────────────────────── */
.hash-row {
  display: grid;
  grid-template-columns: auto 90px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.hash-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.hash-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.hash-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
}

.hash-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.hash-copy {
  background: transparent;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 4px;
  color: rgba(30, 165, 76, 0.75);
  cursor: pointer;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  align-self: start;
}

.hash-copy:hover {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.hash-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

/* ── Mobile: collapse the prompt + tighten the label column ────────── */
@container (max-width: 600px) {
  .hash-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .hash-prompt {
    display: none;
  }

  .hash-label {
    font-size: 0.72rem;
  }

  .hash-value {
    font-size: 0.76rem;
  }
}
</style>
