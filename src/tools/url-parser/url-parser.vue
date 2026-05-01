<script setup lang="ts">
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const urlToParse = ref('https://me:pwd@killertools.net:3000/url-parser?key1=value&key2=value2#the-hash');
const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));

const urlValidationRules = [
  {
    validator: (value: string) => isNotThrowing(() => new URL(value)),
    message: 'Invalid url',
  },
];

const properties: { title: string; key: keyof URL }[] = [
  { title: 'Protocol', key: 'protocol' },
  { title: 'Username', key: 'username' },
  { title: 'Password', key: 'password' },
  { title: 'Hostname', key: 'hostname' },
  { title: 'Port', key: 'port' },
  { title: 'Path', key: 'pathname' },
  { title: 'Params', key: 'search' },
];

const searchParams = computed(() => {
  if (!urlParsed.value) return [];
  return Array.from(urlParsed.value.searchParams.entries());
});

const copiedLabel = ref<string | null>(null);
async function copyValue(label: string, value: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) copiedLabel.value = null;
  }, 2000);
}

const isError = computed(() => !urlParsed.value);
</script>

<template>
  <div class="url-tool">
    <c-card>
      <div class="url-section-label">
        URL
      </div>
      <c-input-text
        v-model:value="urlToParse"
        placeholder="https://me:pwd@killertools.net:3000/url-parser?key1=value&key2=value2"
        raw-text
        :validation-rules="urlValidationRules"
        font-mono
      />

      <n-divider />

      <div class="url-section-label">
        Output
      </div>

      <div class="url-grid">
        <div
          v-for="{ title, key } in properties"
          :key="key"
          class="url-row"
        >
          <span class="url-prompt">&gt;_</span>
          <span class="url-label">{{ title }}</span>
          <code class="url-value">{{ isError ? '' : (urlParsed?.[key] as string) ?? '' }}</code>
          <button
            type="button"
            class="url-copy"
            :disabled="isError || !((urlParsed?.[key] as string) ?? '')"
            :title="copiedLabel === title ? 'Copied!' : 'Copy'"
            @click="copyValue(title, (urlParsed?.[key] as string) ?? '')"
          >
            <span v-if="copiedLabel === title" class="url-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>

        <template v-if="!isError && searchParams.length">
          <div
            v-for="[k, v] in searchParams"
            :key="k"
            class="url-row url-param-row"
          >
            <span class="url-param-arrow">→</span>
            <span class="url-param-key">{{ k }}</span>
            <code class="url-value">{{ v }}</code>
            <button
              type="button"
              class="url-copy"
              :title="copiedLabel === `param:${k}` ? 'Copied!' : 'Copy value'"
              @click="copyValue(`param:${k}`, v)"
            >
              <span v-if="copiedLabel === `param:${k}`" class="url-copy-check">✓</span>
              <icon-mdi-content-copy v-else />
            </button>
          </div>
        </template>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.url-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.url-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.url-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.url-row {
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

.url-row:hover {
  border-color: rgba(30, 165, 76, 0.55);
  background: rgba(0, 0, 0, 0.7);
}

.url-param-row {
  margin-left: 24px;
  border-color: rgba(30, 165, 76, 0.18);
  background: rgba(0, 0, 0, 0.35);
}

.url-param-row:hover {
  border-color: rgba(30, 165, 76, 0.4);
  background: rgba(0, 0, 0, 0.55);
}

.url-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.url-param-arrow {
  color: rgba(30, 165, 76, 0.4);
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.url-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
}

.url-param-key {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  white-space: nowrap;
  font-style: italic;
}

.url-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.url-copy {
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

.url-copy:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.url-copy:disabled {
  opacity: 0.3;
  cursor: default;
}

.url-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 560px) {
  .url-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
  }

  .url-prompt,
  .url-param-arrow {
    display: none;
  }

  .url-param-row {
    margin-left: 12px;
  }

  .url-label,
  .url-param-key {
    font-size: 0.72rem;
  }

  .url-value {
    font-size: 0.76rem;
  }
}
</style>
