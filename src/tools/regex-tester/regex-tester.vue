<script setup lang="ts">
import RandExp from 'randexp';
import { render } from '@regexper/render';
import type { ShadowRootExpose } from 'vue-shadow-dom';
import { matchRegex } from './regex-tester.service';
import { useValidation } from '@/composable/validation';
import { useQueryParamOrStorage } from '@/composable/queryParams';

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
      validator: value => new RegExp(value),
      getErrorMessage: (value) => {
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
  catch (_) {
    return [];
  }
});

const sample = computed(() => {
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/\(\?\<[^\>]*\>/g, '(?:')));
    return randexp.gen();
  }
  catch (_) {
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
      catch (_) {
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
  <div class="regex-layout" style="flex: 1 1 900px; max-width: 1400px; margin-top: 0; display: flex; gap: 16px; align-items: start;">
    <!-- Left: Tester -->
    <div style="flex: 1; min-width: 0;">
      <c-card title="Regex" mb-1>
        <c-input-text
          v-model:value="regex"
          label="Regex to test:"
          placeholder="Put the regex to test"
          multiline
          rows="3"
          :validation="regexValidation"
        />
        <n-space>
          <n-checkbox v-model:checked="global">
            <span title="Global search">Global search. (<code>g</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="ignoreCase">
            <span title="Case-insensitive search">Case-insensitive search. (<code>i</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="multiline">
            <span title="Allows ^ and $ to match next to newline characters.">Multiline(<code>m</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="dotAll">
            <span title="Allows . to match newline characters.">Singleline(<code>s</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="unicode">
            <span title="Unicode; treat a pattern as a sequence of Unicode code points.">Unicode(<code>u</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="unicodeSets">
            <span title="An upgrade to the u mode with more Unicode features.">Unicode Sets (<code>v</code>)</span>
          </n-checkbox>
        </n-space>

        <n-divider />

        <c-input-text
          v-model:value="text"
          label="Text to match:"
          placeholder="Put the text to match"
          multiline
          rows="5"
        />
      </c-card>

      <c-card title="Matches" mb-1 mt-3>
        <n-table v-if="results?.length > 0">
          <thead>
            <tr>
              <th scope="col">
                Index in text
              </th>
              <th scope="col">
                Value
              </th>
              <th scope="col">
                Captures
              </th>
              <th scope="col">
                Groups
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match of results" :key="match.index">
              <td>{{ match.index }}</td>
              <td>{{ match.value }}</td>
              <td>
                <ul>
                  <li v-for="capture in match.captures" :key="capture.name">
                    "{{ capture.name }}" = {{ capture.value }} [{{ capture.start }} - {{ capture.end }}]
                  </li>
                </ul>
              </td>
              <td>
                <ul>
                  <li v-for="group in match.groups" :key="group.name">
                    "{{ group.name }}" = {{ group.value }} [{{ group.start }} - {{ group.end }}]
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </n-table>
        <c-alert v-else>
          No match
        </c-alert>
      </c-card>

      <c-card title="Sample matching text" mt-3>
        <pre style="white-space: pre-wrap; word-break: break-all;">{{ sample }}</pre>
      </c-card>

      <c-card title="Regex Diagram" style="overflow-x: auto;" mt-3>
        <shadow-root ref="visualizerSVG">
&#xa0;
        </shadow-root>
      </c-card>
    </div>

    <!-- Right: Cheatsheet -->
    <div class="cheatsheet-panel" style="width: 360px; flex-shrink: 0; position: sticky; top: 16px; max-height: calc(100vh - 80px); overflow-y: auto;">
      <c-card>
        <div class="mb-3 text-base font-bold">
          Quick Reference
        </div>
        <div
          v-for="section in cheatsheet"
          :key="section.title"
          mb-4
        >
          <div class="mb-1 text-xs font-bold uppercase op-60">
            {{ section.title }}
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr
              v-for="row in section.rows"
              :key="row.expr"
              style="border-bottom: 1px solid rgba(255,255,255,0.05);"
            >
              <td style="padding: 3px 8px 3px 0; white-space: nowrap; width: 1%;">
                <code style="font-size: 0.72rem; color: #1ea54c; background: rgba(30,165,76,0.1); padding: 1px 4px; border-radius: 3px;">{{ row.expr }}</code>
              </td>
              <td style="padding: 3px 0; font-size: 0.72rem; opacity: 0.7;">
                {{ row.desc }}
              </td>
            </tr>
          </table>
        </div>
      </c-card>
    </div>
  </div>
</template>

<style scoped>
.regex-layout {
  container-type: inline-size;
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

.cheatsheet-panel::-webkit-scrollbar {
  width: 4px;
}
.cheatsheet-panel::-webkit-scrollbar-track {
  background: transparent;
}
.cheatsheet-panel::-webkit-scrollbar-thumb {
  background: #1ea54c55;
  border-radius: 4px;
}
.cheatsheet-panel::-webkit-scrollbar-thumb:hover {
  background: #1ea54c;
}
</style>
