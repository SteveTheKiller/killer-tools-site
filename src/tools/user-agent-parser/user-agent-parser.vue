<script setup lang="ts">
import { UAParser } from 'ua-parser-js';
import { withDefaultOnError } from '@/utils/defaults';

const ua = ref(navigator.userAgent as string);

function getUserAgentInfo(userAgent: string) {
  return userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : undefined;
}

const uaInfo = computed(() => withDefaultOnError(() => getUserAgentInfo(ua.value), undefined));

const rows = computed(() => {
  const info = uaInfo.value;
  if (!info) {
    return [];
  }
  return [
    { section: 'Browser', label: 'Name', value: info.browser.name },
    { section: 'Browser', label: 'Version', value: info.browser.version },
    { section: 'Engine', label: 'Name', value: info.engine.name },
    { section: 'Engine', label: 'Version', value: info.engine.version },
    { section: 'OS', label: 'Name', value: info.os.name },
    { section: 'OS', label: 'Version', value: info.os.version },
    { section: 'Device', label: 'Model', value: info.device.model },
    { section: 'Device', label: 'Type', value: info.device.type },
    { section: 'Device', label: 'Vendor', value: info.device.vendor },
    { section: 'CPU', label: 'Architecture', value: info.cpu.architecture },
  ];
});

const copiedKey = ref<string | null>(null);
async function copyValue(key: string, value: string) {
  await navigator.clipboard.writeText(value);
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) {
      copiedKey.value = null;
    }
  }, 2000);
}

const sections = computed(() => {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows.value) {
    if (!seen.has(row.section)) {
      seen.add(row.section);
      order.push(row.section);
    }
  }
  return order.map(section => ({
    name: section,
    rows: rows.value.filter(r => r.section === section),
  }));
});
</script>

<template>
  <div class="ua-wrap">
    <!-- Input card — full width -->
    <div class="ua-input-card kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">USER AGENT STRING</span>
      </div>
      <div class="ua-input-area">
        <textarea
          v-model="ua"
          class="ua-input"
          placeholder="Put your user-agent here..."
          rows="2"
          spellcheck="false"
          autofocus
        />
      </div>
    </div>

    <!-- Section cards grid -->
    <div v-if="uaInfo" class="ua-grid">
      <div
        v-for="{ name, rows: sectionRows } in sections"
        :key="name"
        class="ua-card kt-terminal"
      >
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">{{ name.toUpperCase() }}</span>
        </div>
        <template v-for="row in sectionRows" :key="`${name}-${row.label}`">
          <div
            v-if="row.value"
            class="ua-row"
            @click="copyValue(`${name}-${row.label}`, row.value)"
          >
            <span class="ua-prompt">&gt;_</span>
            <span class="ua-label">{{ row.label }}</span>
            <span class="ua-value">{{ row.value }}</span>
            <span class="ua-copy" :class="{ 'ua-copy-done': copiedKey === `${name}-${row.label}` }">
              <span v-if="copiedKey === `${name}-${row.label}`">✓</span>
              <icon-mdi-content-copy v-else />
            </span>
          </div>
          <div v-else class="ua-row ua-row-empty">
            <span class="ua-prompt">&gt;_</span>
            <span class="ua-label">{{ row.label }}</span>
            <span class="ua-fallback">Unknown</span>
            <span class="ua-copy-placeholder" />
          </div>
        </template>
      </div>
    </div>

    <div v-else-if="ua.trim()" class="ua-empty-state kt-terminal">
      <div class="kt-terminal-bar">
        <span class="kt-terminal-bar-title">ERROR</span>
      </div>
      <div style="padding: 12px 16px;">
        <span class="ua-fallback">Could not parse user agent string</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ua-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* ── Input card ── */
.ua-input-card {
  width: 100%;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ua-input-area {
  padding: 10px 12px;
}

.ua-input {
  width: 100%;
  background: transparent !important;
  border: none;
  outline: none;
  box-shadow: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: none;
  line-height: 1.6;
  box-sizing: border-box;
}

.ua-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* ── Section card grid ── */
.ua-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: start;
}

@media (max-width: 1100px) {
  .ua-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .ua-grid {
    grid-template-columns: 1fr;
  }
}

.ua-card {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Rows ── */
.ua-row {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
  cursor: pointer;
}

.ua-row:last-child {
  border-bottom: none;
}

.ua-row:hover {
  background: rgba(30, 165, 76, 0.05) !important;
}

.ua-row-empty {
  cursor: default;
}

.ua-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.ua-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.ua-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
  min-width: 0;
}

.ua-fallback {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  font-size: 0.75rem;
}

.ua-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.ua-row:hover .ua-copy {
  color: rgba(30, 165, 76, 0.8);
}

.ua-copy-done {
  color: #1ea54c !important;
}

.ua-copy-placeholder {
  width: 24px;
  flex-shrink: 0;
}
</style>
