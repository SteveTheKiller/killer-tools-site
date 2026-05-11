<script setup lang="ts">
import { withDefaultOnError } from '@/utils/defaults';

const urlToParse = ref('https://me:pwd@killertools.net:3000/url-parser?key1=value&key2=value2#the-hash');
const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));
const isError = computed(() => urlToParse.value.trim().length > 0 && !urlParsed.value);

const sections = computed(() => {
  const u = urlParsed.value;
  return [
    {
      name: 'Host',
      rows: [
        { label: 'Protocol', value: u?.protocol ?? '' },
        { label: 'Hostname', value: u?.hostname ?? '' },
        { label: 'Port', value: u?.port ?? '' },
      ],
    },
    {
      name: 'Authentication',
      rows: [
        { label: 'Username', value: u?.username ?? '' },
        { label: 'Password', value: u?.password ?? '' },
      ],
    },
    {
      name: 'Path',
      rows: [
        { label: 'Pathname', value: u?.pathname ?? '' },
        { label: 'Search', value: u?.search ?? '' },
        { label: 'Hash', value: u?.hash ?? '' },
      ],
    },
  ];
});

const searchParams = computed(() => {
  if (!urlParsed.value) {
    return [];
  }
  return Array.from(urlParsed.value.searchParams.entries());
});

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
  <div class="url-wrap">
    <!-- Input card — full width -->
    <div class="url-input-card kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">URL</span>
      </div>
      <div class="url-input-area">
        <textarea
          v-model="urlToParse"
          class="url-textarea"
          :class="{ 'url-textarea-error': isError }"
          placeholder="https://me:pwd@example.com:3000/path?key=value#hash"
          rows="2"
          spellcheck="false"
          autofocus
        />
        <span v-if="isError" class="url-error-msg">Invalid URL</span>
      </div>
    </div>

    <!-- Section cards + params in a grid -->
    <div v-if="urlParsed" class="url-grid">
      <!-- Fixed sections -->
      <div
        v-for="section in sections"
        :key="section.name"
        class="url-card kt-terminal"
      >
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">{{ section.name.toUpperCase() }}</span>
        </div>
        <div
          v-for="row in section.rows"
          :key="row.label"
          class="url-row"
          :class="{ 'url-row-empty': !row.value }"
          @click="copyValue(row.label, row.value)"
        >
          <span class="url-prompt">&gt;_</span>
          <span class="url-label">{{ row.label }}</span>
          <span v-if="row.value" class="url-value">{{ row.value }}</span>
          <span v-else class="url-fallback">—</span>
          <span class="url-copy-icon" :class="{ 'url-copy-done': copiedKey === row.label }">
            <span v-if="copiedKey === row.label">✓</span>
            <icon-mdi-content-copy v-else-if="row.value" />
          </span>
        </div>
      </div>

      <!-- Params card -->
      <div v-if="searchParams.length" class="url-card kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">PARAMS</span>
        </div>
        <div
          v-for="[k, v] in searchParams"
          :key="k"
          class="url-row"
          @click="copyValue(`param:${k}`, v)"
        >
          <span class="url-prompt url-prompt-dim">→</span>
          <span class="url-param-key">{{ k }}</span>
          <span class="url-value">{{ v }}</span>
          <span class="url-copy-icon" :class="{ 'url-copy-done': copiedKey === `param:${k}` }">
            <span v-if="copiedKey === `param:${k}`">✓</span>
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="!isError && !urlToParse.trim()" class="url-empty-hint">
      Enter a URL above to parse
    </div>
  </div>
</template>

<style scoped>
.url-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* ── Input card ── */
.url-input-card {
  width: 100%;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.url-input-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
}

.url-textarea {
  width: 100%;
  background: transparent !important;
  border: none;
  outline: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: none;
  line-height: 1.6;
  box-sizing: border-box;
}

.url-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }
.url-textarea-error { color: #e05555; }

.url-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Section card grid ── */
.url-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: start;
}

@media (max-width: 1100px) {
  .url-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .url-grid {
    grid-template-columns: 1fr;
  }
}

.url-card {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Rows ── */
.url-row {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
}

.url-row:last-child { border-bottom: none; }
.url-row:hover { background: rgba(30, 165, 76, 0.05) !important; }
.url-row-empty { cursor: default; }
.url-row-empty:hover { background: transparent !important; }

.url-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.url-prompt-dim {
  color: rgba(30, 165, 76, 0.35);
  font-weight: 400;
}

.url-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.url-param-key {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.73rem;
  white-space: nowrap;
  font-style: italic;
}

.url-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
  min-width: 0;
}

.url-fallback {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  font-size: 0.75rem;
}

.url-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.url-row:hover .url-copy-icon { color: rgba(30, 165, 76, 0.8); }
.url-copy-done { color: #1ea54c !important; }

.url-empty-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.25);
  padding: 16px;
}
</style>
