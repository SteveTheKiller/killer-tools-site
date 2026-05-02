<script setup lang="ts">
import { generateMeta } from '@it-tools/oggen';
import _ from 'lodash';
import { image, ogSchemas, twitter, website } from './og-schemas';
import type { OGSchemaType, OGSchemaTypeElementSelect } from './OGSchemaType.type';
import { useCopy } from '@/composable/copy';

const metadata = ref<{ type: string; [k: string]: any }>({
  'type': 'website',
  'twitter:card': 'summary_large_image',
});

watch(
  () => ref(metadata.value.type),
  (_ignored, prevSection) => {
    const section = ogSchemas[prevSection.value];
    if (!section) return;
    section.elements.forEach(({ key }) => {
      metadata.value[key] = '';
    });
  },
);

const sections = computed(() => {
  const secs: OGSchemaType[] = [website, image, twitter];
  const additionalSchema = ogSchemas[metadata.value.type];
  if (additionalSchema) secs.push(additionalSchema);
  return secs;
});

const metaTags = computed(() => {
  const twitterMeta = _.chain(metadata.value)
    .pickBy((_value, k) => k.startsWith('twitter:'))
    .mapKeys((_value, k) => k.replace(/^twitter:/, ''))
    .value();
  const otherMeta = _.pickBy(metadata.value, (_value, k) => !k.startsWith('twitter:'));
  return generateMeta({ ...otherMeta, twitter: twitterMeta }, { generateTwitterCompatibleMeta: true });
});

const { copy, copied } = useCopy({ source: metaTags, text: 'Meta tags copied!' });

// ── HTML syntax highlighter ──
function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightHtml(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="hl-comment">$1</span>')
    .replace(/\b(property|name|content|value|rel|href)(?==)/g, '<span class="hl-attr">$1</span>')
    .replace(/(&quot;[^&]*&quot;)/g, '<span class="hl-value">$1</span>')
    .replace(/(&lt;\/?meta\b|\/&gt;)/g, '<span class="hl-tag">$1</span>');
}

const highlightedOutput = computed(() => highlightHtml(metaTags.value));

// ── Custom dropdowns ──
const openDropdowns = ref<Record<string, boolean>>({});

function toggleDropdown(key: string) {
  openDropdowns.value = { ...openDropdowns.value, [key]: !openDropdowns.value[key] };
}

function selectOption(key: string, value: string) {
  metadata.value[key] = value;
  openDropdowns.value[key] = false;
}

function closeOnBlur(key: string) {
  return (e: FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest?.(`[data-dd="${key}"]`)) {
      openDropdowns.value[key] = false;
    }
  };
}

function getSelectLabel(element: OGSchemaTypeElementSelect): string {
  const opts = element.options as any[];
  for (const opt of opts) {
    if (opt.children) {
      const child = opt.children.find((c: any) => c.value === metadata.value[element.key]);
      if (child) return child.label;
    }
    else if (opt.value === metadata.value[element.key]) {
      return opt.label;
    }
  }
  return '';
}
</script>

<template>
  <!-- Left: form panel -->
  <div class="mg-form-wrap">
    <div
      v-for="{ name, elements } of sections"
      :key="name"
      class="mg-section"
    >
      <span class="mg-section-label">{{ name.toUpperCase() }}</span>

      <div class="mg-fields">
        <div
          v-for="{ key, type, label, placeholder, ...element } of elements"
          :key="key"
          class="mg-row"
        >
          <span class="mg-field-label">{{ label }}</span>

          <!-- Text input -->
          <input
            v-if="type === 'input'"
            v-model="metadata[key]"
            class="mg-input"
            :placeholder="placeholder"
            spellcheck="false"
          >

          <!-- Select / dropdown -->
          <div
            v-else-if="type === 'select'"
            class="mg-dropdown"
            :data-dd="key"
            tabindex="0"
            @blur="closeOnBlur(key)($event)"
          >
            <button
              type="button"
              class="mg-dropdown-trigger"
              @click="toggleDropdown(key)"
            >
              <span>{{ getSelectLabel(element as OGSchemaTypeElementSelect) || placeholder }}</span>
              <icon-mdi-chevron-down
                class="mg-chevron"
                :class="{ 'mg-chevron-open': openDropdowns[key] }"
              />
            </button>
            <div v-if="openDropdowns[key]" class="mg-dropdown-menu">
              <template v-for="opt in (element as OGSchemaTypeElementSelect).options" :key="(opt as any).value ?? (opt as any).key">
                <!-- Group header -->
                <div v-if="(opt as any).children" class="mg-group-header">
                  {{ (opt as any).label }}
                </div>
                <template v-if="(opt as any).children">
                  <button
                    v-for="child in (opt as any).children"
                    :key="child.value"
                    type="button"
                    class="mg-dropdown-item mg-dropdown-item-indent"
                    :class="{ 'mg-item-active': metadata[key] === child.value }"
                    @click="selectOption(key, child.value)"
                  >
                    {{ child.label }}
                  </button>
                </template>
                <button
                  v-else
                  type="button"
                  class="mg-dropdown-item"
                  :class="{ 'mg-item-active': metadata[key] === (opt as any).value }"
                  @click="selectOption(key, (opt as any).value)"
                >
                  {{ (opt as any).label }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right: output panel -->
  <div class="mg-output-wrap">
    <div class="mg-output-header">
      <span class="mg-section-label">YOUR META TAGS</span>
      <button type="button" class="mg-copy-btn" @click="copy()">
        <span v-if="copied">✓ Copied</span>
        <template v-else>
          <icon-mdi-content-copy />
          Copy
        </template>
      </button>
    </div>
    <div class="mg-code-panel">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <pre class="mg-pre" v-html="highlightedOutput" />
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper sizing ── */
.mg-form-wrap {
  flex: 1 1 480px;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mg-output-wrap {
  flex: 1 1 380px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Section ── */
.mg-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mg-section-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Fields ── */
.mg-fields {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  overflow: hidden;
}

.mg-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: stretch;
  border-bottom: 1px solid rgba(30, 165, 76, 0.08);
}

.mg-row:last-child {
  border-bottom: none;
}

.mg-field-label {
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(30, 165, 76, 0.1);
  white-space: nowrap;
}

/* ── Text input ── */
.mg-input {
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  width: 100%;
  box-sizing: border-box;
  transition: background 0.12s;
}

.mg-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.mg-input:focus {
  background: rgba(30, 165, 76, 0.04);
  outline: none;
}

/* ── Dropdown ── */
.mg-dropdown {
  position: relative;
  outline: none;
}

.mg-dropdown-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  gap: 6px;
}

.mg-dropdown-trigger:hover,
.mg-dropdown:focus-within .mg-dropdown-trigger {
  background: rgba(30, 165, 76, 0.04);
}

.mg-chevron {
  margin-left: auto;
  color: rgba(30, 165, 76, 0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.mg-chevron-open {
  transform: rotate(180deg);
}

.mg-dropdown-menu {
  position: absolute;
  top: calc(100% + 2px);
  left: -110px;
  right: 0;
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.mg-group-header {
  padding: 5px 14px 3px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(30, 165, 76, 0.06);
}

.mg-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(30, 165, 76, 0.06);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.mg-dropdown-item:last-child {
  border-bottom: none;
}

.mg-dropdown-item:hover {
  background: rgba(30, 165, 76, 0.1);
  color: #fff;
}

.mg-dropdown-item-indent {
  padding-left: 24px;
}

.mg-item-active {
  color: #1ea54c;
  background: rgba(30, 165, 76, 0.08);
}

/* ── Output panel ── */
.mg-output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mg-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: rgba(30, 165, 76, 0.08);
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.7rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.mg-copy-btn:hover {
  background: rgba(30, 165, 76, 0.18);
  border-color: #1ea54c;
  color: #1ea54c;
}

.mg-code-panel {
  flex: 1;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 14px 16px;
  overflow: auto;
}

.mg-pre {
  margin: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  white-space: pre-wrap;
  word-break: break-all;
}

/* ── Syntax highlighting ── */
:deep(.hl-comment) {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

:deep(.hl-tag) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.hl-attr) {
  color: #e0a040;
}

:deep(.hl-value) {
  color: #1ea54c;
}
</style>
