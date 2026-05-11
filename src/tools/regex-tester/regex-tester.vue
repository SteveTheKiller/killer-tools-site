<script setup lang="ts">
import type { ShadowRootExpose } from 'vue-shadow-dom';
import { render } from '@regexper/render';
import RandExp from 'randexp';
import { useQueryParamOrStorage } from '@/composable/queryParams';
import { useValidation } from '@/composable/validation';
import { matchRegex } from './regex-tester.service';

const regex = useQueryParamOrStorage({ name: 'regex', storageName: 'regex-tester:regex', defaultValue: '' });
const text = ref('');
const global = ref(true);
const ignoreCase = ref(false);
const multiline = ref(false);
const dotAll = ref(true);
const unicode = ref(true);
const unicodeSets = ref(false);
const visualizerSVG = ref<ShadowRootExpose>();

const regexValidation = useValidation({
  source: regex,
  rules: [
    {
      message: 'Invalid regex: {0}',
      validator: (value: string) => new RegExp(value),
      getErrorMessage: (value: string) => {
        const _ = new RegExp(value);
        return '';
      },
    },
  ],
});

const results = computed(() => {
  let flags = 'd';
  if (global.value) {
    flags += 'g';
  }
  if (ignoreCase.value) {
    flags += 'i';
  }
  if (multiline.value) {
    flags += 'm';
  }
  if (dotAll.value) {
    flags += 's';
  }
  if (unicode.value) {
    flags += 'u';
  }
  else if (unicodeSets.value) {
    flags += 'v';
  }

  try {
    return matchRegex(regex.value, text.value, flags);
  }
  catch {
    return [];
  }
});

const sample = computed(() => {
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/\(\?<[^>]*>/g, '(?:')));
    return randexp.gen();
  }
  catch {
    return '';
  }
});

watchEffect(
  async () => {
    const regexValue = regex.value;
    const visualizer = visualizerSVG.value?.shadow_root;
    if (visualizer) {
      while (visualizer.lastChild) {
        visualizer.removeChild(visualizer.lastChild);
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      try {
        await render(regexValue, svg);
      }
      catch {
      }
      visualizer.appendChild(svg);
    }
  },
);

const cheatsheet = [
  {
    title: 'Normal characters',
    rows: [
      { expr: '. or [^\\n\\r]', desc: 'Any character excluding newline or carriage return' },
      { expr: '[A-Za-z]', desc: 'Alphabet' },
      { expr: '[a-z]', desc: 'Lowercase alphabet' },
      { expr: '[A-Z]', desc: 'Uppercase alphabet' },
      { expr: '\\d or [0-9]', desc: 'Digit' },
      { expr: '\\D or [^0-9]', desc: 'Non-digit' },
      { expr: '_', desc: 'Underscore' },
      { expr: '\\w or [A-Za-z0-9_]', desc: 'Alphabet, digit or underscore' },
      { expr: '\\W or [^A-Za-z0-9_]', desc: 'Inverse of \\w' },
      { expr: '\\S', desc: 'Inverse of \\s' },
    ],
  },
  {
    title: 'Whitespace',
    rows: [
      { expr: ' ', desc: 'Space' },
      { expr: '\\t', desc: 'Tab' },
      { expr: '\\n', desc: 'Newline' },
      { expr: '\\r', desc: 'Carriage return' },
      { expr: '\\s', desc: 'Space, tab, newline or carriage return' },
    ],
  },
  {
    title: 'Character sets',
    rows: [
      { expr: '[xyz]', desc: 'Either x, y or z' },
      { expr: '[^xyz]', desc: 'Neither x, y nor z' },
      { expr: '[1-3]', desc: 'Either 1, 2 or 3' },
      { expr: '[^1-3]', desc: 'Neither 1, 2 nor 3' },
    ],
  },
  {
    title: 'Escaping (outside set)',
    rows: [
      { expr: '\\.', desc: 'Period' },
      { expr: '\\^', desc: 'Caret' },
      { expr: '\\$', desc: 'Dollar sign' },
      { expr: '\\|', desc: 'Pipe' },
      { expr: '\\\\', desc: 'Backslash' },
      { expr: '\\(  \\)', desc: 'Brackets' },
      { expr: '\\[  \\]', desc: 'Square brackets' },
      { expr: '\\{  \\}', desc: 'Curly brackets' },
    ],
  },
  {
    title: 'Quantifiers',
    rows: [
      { expr: '{2}', desc: 'Exactly 2' },
      { expr: '{2,}', desc: 'At least 2' },
      { expr: '{2,7}', desc: 'At least 2, no more than 7' },
      { expr: '*', desc: '0 or more' },
      { expr: '+', desc: '1 or more' },
      { expr: '?', desc: 'Exactly 0 or 1' },
    ],
  },
  {
    title: 'Boundaries',
    rows: [
      { expr: '^', desc: 'Start of string' },
      { expr: '$', desc: 'End of string' },
      { expr: '\\b', desc: 'Word boundary' },
    ],
  },
  {
    title: 'Matching',
    rows: [
      { expr: 'foo|bar', desc: 'Match foo or bar' },
      { expr: 'foo(?=bar)', desc: 'Match foo if before bar' },
      { expr: 'foo(?!bar)', desc: 'Match foo if NOT before bar' },
      { expr: '(?<=bar)foo', desc: 'Match foo if after bar' },
      { expr: '(?<!bar)foo', desc: 'Match foo if NOT after bar' },
    ],
  },
  {
    title: 'Groups & Capturing',
    rows: [
      { expr: '(foo)', desc: 'Capturing group' },
      { expr: '(?:foo)', desc: 'Non-capturing group' },
      { expr: '(foo)bar\\1', desc: 'Backreference to 1st group' },
    ],
  },
];
</script>

<template>
  <div class="regex-layout" style="flex: 1 1 auto; width: 100%; max-width: 1400px; margin-top: 0; display: flex; gap: 16px; align-items: start;">
    <!-- Left: Tester -->
    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px;">
      <!-- Regex input -->
      <div class="kt-terminal rt-card">
        <div class="kt-terminal-bar rt-bar">
          <span class="rt-title">REGEX</span>
        </div>
        <div class="rt-body">
          <c-input-text
            v-model:value="regex"
            label="Regex to test:"
            placeholder="Put the regex to test"
            multiline
            autofocus
            rows="3"
            :validation="regexValidation"
          />
          <div class="kt-pill-row" style="margin-top: 10px;">
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': global }" title="Global search" @click="global = !global">
              Global
            </button>
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': ignoreCase }" title="Case-insensitive search" @click="ignoreCase = !ignoreCase">
              Ignore case
            </button>
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': multiline }" title="Allows ^ and $ to match next to newline characters." @click="multiline = !multiline">
              Multiline
            </button>
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': dotAll }" title="Allows . to match newline characters." @click="dotAll = !dotAll">
              Singleline
            </button>
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': unicode }" title="Unicode; treat a pattern as a sequence of Unicode code points." @click="unicode = !unicode">
              Unicode
            </button>
            <button type="button" class="kt-pill" :class="{ 'kt-pill-active': unicodeSets }" title="An upgrade to the u mode with more Unicode features." @click="unicodeSets = !unicodeSets">
              Unicode Sets
            </button>
          </div>
          <div class="kt-divider" />
          <c-input-text
            v-model:value="text"
            label="Text to match:"
            placeholder="Put the text to match"
            multiline
            rows="5"
          />
        </div>
      </div>

      <!-- Matches -->
      <div class="kt-terminal rt-card">
        <div class="kt-terminal-bar rt-bar">
          <span class="rt-title">MATCHES</span>
          <span v-if="results?.length > 0" class="rt-count">{{ results.length }}</span>
        </div>
        <div class="rt-body rt-body-matches">
          <template v-if="results?.length > 0">
            <div class="rt-match-header">
              <span class="rt-match-col-idx">Index</span>
              <span class="rt-match-col-val">Value</span>
              <span class="rt-match-col-cap">Captures</span>
              <span class="rt-match-col-grp">Groups</span>
            </div>
            <div
              v-for="match of results"
              :key="match.index"
              class="rt-match-row"
            >
              <span class="rt-match-col-idx rt-match-idx">{{ match.index }}</span>
              <span class="rt-match-col-val rt-match-val">{{ match.value }}</span>
              <span class="rt-match-col-cap rt-match-meta">
                <span v-for="capture in match.captures" :key="capture.name" class="rt-capture">
                  "{{ capture.name }}" = {{ capture.value }} [{{ capture.start }}-{{ capture.end }}]
                </span>
              </span>
              <span class="rt-match-col-grp rt-match-meta">
                <span v-for="group in match.groups" :key="group.name" class="rt-capture">
                  "{{ group.name }}" = {{ group.value }} [{{ group.start }}-{{ group.end }}]
                </span>
              </span>
            </div>
          </template>
          <div v-else class="rt-no-match">
            <span class="kt-prompt">&gt;_</span> No match
          </div>
        </div>
      </div>

      <!-- Sample -->
      <div class="kt-terminal rt-card">
        <div class="kt-terminal-bar rt-bar">
          <span class="rt-title">SAMPLE</span>
        </div>
        <div class="rt-body">
          <pre class="rt-sample">{{ sample || '—' }}</pre>
        </div>
      </div>

      <!-- Diagram -->
      <div class="kt-terminal rt-card">
        <div class="kt-terminal-bar rt-bar">
          <span class="rt-title">DIAGRAM</span>
        </div>
        <div class="rt-body rt-diagram-body">
          <shadow-root ref="visualizerSVG">
&#xa0;
          </shadow-root>
        </div>
      </div>
    </div>

    <!-- Right: Cheatsheet -->
    <div class="cheatsheet-panel">
      <div class="rt-cs-panel">
        <div class="rt-cs-panel-bar kt-terminal-bar">
          <span class="rt-cs-panel-title">Quick Reference</span>
        </div>
        <div class="rt-cheatsheet-body">
          <div
            v-for="section in cheatsheet"
            :key="section.title"
            class="rt-cs-section"
          >
            <div class="rt-cs-header">
              {{ section.title }}
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr
                v-for="row in section.rows"
                :key="row.expr"
                style="border-bottom: 1px solid rgba(255,255,255,0.05);"
              >
                <td style="padding: 3px 8px 3px 0; white-space: nowrap; width: 1%;">
                  <code class="rt-cs-expr">{{ row.expr }}</code>
                </td>
                <td style="padding: 3px 0; font-size: 0.72rem; opacity: 0.7;">
                  {{ row.desc }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal { background: #121212 !important; }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.regex-layout {
  container-type: inline-size;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
}

@media (max-width: 1000px) {
  .regex-layout {
    flex-direction: column;
  }

  .cheatsheet-panel {
    width: 100% !important;
    position: static !important;
    max-height: none !important;
  }
}

.cheatsheet-panel {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.cheatsheet-panel::-webkit-scrollbar {
  width: 4px;
}

.cheatsheet-panel::-webkit-scrollbar-track {
  background: transparent;
}

.cheatsheet-panel::-webkit-scrollbar-thumb {
  background: rgba(30, 165, 76, 0.3);
  border-radius: 2px;
}

.cheatsheet-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(30, 165, 76, 0.55);
}

.rt-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rt-title {
  flex: 1;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.1em;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.rt-count {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(30, 165, 76, 0.15);
  color: #1ea54c;
  border: 1px solid rgba(30, 165, 76, 0.3);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.rt-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

/* Allow flag pills to wrap rather than blow out the card width */
.rt-body .kt-pill-row {
  flex-shrink: 1;
  flex-wrap: wrap;
  width: auto;
  overflow: visible;
  border-radius: 6px;
}

/* Collapse NaiveUI form-item margin inside rt-body */
.rt-body ::v-deep(.n-form-item) { margin-bottom: 0 !important; }
.rt-body ::v-deep(.n-form-item-label) { padding-bottom: 2px !important; }
.rt-body ::v-deep(.n-form-item-feedback-wrapper) { min-height: 0 !important; }

/* Green text inside Regex and Text inputs */
.rt-body ::v-deep(.n-input__textarea-el),
.rt-body ::v-deep(.n-input__input-el) {
  color: #1ea54c !important;
  caret-color: #1ea54c;
}

/* Shrink the divider margin in this context */
.rt-body .kt-divider { margin: 4px 0; }

.rt-body-matches {
  padding: 0;
}

.rt-match-header {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr;
  gap: 8px;
  padding: 5px 14px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  border-bottom: 1px solid rgba(30, 165, 76, 0.1);
}

.rt-match-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr;
  gap: 8px;
  padding: 7px 14px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.06);
  font-size: 0.75rem;
  align-items: start;
}

.rt-match-row:last-child {
  border-bottom: none;
}

.rt-match-idx {
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.rt-match-val {
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  word-break: break-all;
}

.rt-match-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rt-capture {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  word-break: break-all;
}

.rt-no-match {
  padding: 14px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rt-sample {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.rt-diagram-body {
  overflow-x: auto;
  padding: 12px 14px;
}

/* Cheatsheet panel - matches PS Builder style */
.rt-cs-panel {
  background: var(--kt-term-bg);
  border: 1px solid var(--kt-term-border);
  border-radius: 8px;
  overflow: visible;
}

.rt-cs-panel-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
  padding: 6px 12px;
  min-height: 32px;
}

.rt-cs-panel-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

html:not(.dark) .rt-cs-panel-title { color: #1ea54c; }

.rt-cheatsheet-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rt-cs-section {
  display: flex;
  flex-direction: column;
}

.rt-cs-header {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.5;
  margin-bottom: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.rt-cs-expr {
  font-size: 0.72rem;
  color: #1ea54c;
  background: rgba(30, 165, 76, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
</style>
