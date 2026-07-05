<script setup lang="ts">
import type { FormatOptionsWithLanguage } from 'sql-formatter';
import { format as formatSQL } from 'sql-formatter';

const inputElement = ref<HTMLElement>();
const config = reactive<FormatOptionsWithLanguage>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
});

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;');
const prettySQL = computed(() => formatSQL(rawSQL.value, config));

const dialectOptions = [
  { label: 'GCP BigQuery', value: 'bigquery' },
  { label: 'IBM DB2', value: 'db2' },
  { label: 'Apache Hive', value: 'hive' },
  { label: 'MariaDB', value: 'mariadb' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Couchbase N1QL', value: 'n1ql' },
  { label: 'Oracle PL/SQL', value: 'plsql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Amazon Redshift', value: 'redshift' },
  { label: 'Spark', value: 'spark' },
  { label: 'Standard SQL', value: 'sql' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'SQL Server T-SQL', value: 'tsql' },
];
const keywordOptions = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: 'Preserve', value: 'preserve' },
];
const indentOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Tabular left', value: 'tabularLeft' },
  { label: 'Tabular right', value: 'tabularRight' },
];

const dialectOpen = ref(false);
const keywordOpen = ref(false);
const indentOpen = ref(false);

function closeOnBlur(openRef: Ref<boolean>) {
  return (e: FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest?.('.sq-dropdown')) {
      openRef.value = false;
    }
  };
}

const onDialectBlur = closeOnBlur(dialectOpen);
const onKeywordBlur = closeOnBlur(keywordOpen);
const onIndentBlur = closeOnBlur(indentOpen);

const dialectLabel = computed(() => dialectOptions.find(o => o.value === config.language)?.label ?? config.language);
const keywordLabel = computed(() => keywordOptions.find(o => o.value === config.keywordCase)?.label ?? config.keywordCase);
const indentLabel = computed(() => indentOptions.find(o => o.value === config.indentStyle)?.label ?? config.indentStyle);
</script>

<template>
  <!-- single element root: multi-root pages break the route <transition> -->
  <div style="display: contents">
  <div class="sq-controls">
    <!-- Dialect -->
    <div class="sq-field">
      <span class="sq-sublabel">DIALECT</span>
      <div class="sq-dropdown" tabindex="0" @blur="onDialectBlur($event)">
        <button type="button" class="sq-dropdown-trigger" @click="dialectOpen = !dialectOpen">
          <span>{{ dialectLabel }}</span>
          <icon-mdi-chevron-down class="sq-chevron" :class="{ 'sq-chevron-open': dialectOpen }" />
        </button>
        <div v-if="dialectOpen" class="sq-dropdown-menu">
          <button
            v-for="opt in dialectOptions" :key="opt.value" type="button"
            class="sq-dropdown-item" :class="{ 'sq-dropdown-item-active': opt.value === config.language }"
            @click="config.language = opt.value as any; dialectOpen = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Keyword case -->
    <div class="sq-field">
      <span class="sq-sublabel">KEYWORD CASE</span>
      <div class="sq-dropdown" tabindex="0" @blur="onKeywordBlur($event)">
        <button type="button" class="sq-dropdown-trigger" @click="keywordOpen = !keywordOpen">
          <span>{{ keywordLabel }}</span>
          <icon-mdi-chevron-down class="sq-chevron" :class="{ 'sq-chevron-open': keywordOpen }" />
        </button>
        <div v-if="keywordOpen" class="sq-dropdown-menu">
          <button
            v-for="opt in keywordOptions" :key="opt.value" type="button"
            class="sq-dropdown-item" :class="{ 'sq-dropdown-item-active': opt.value === config.keywordCase }"
            @click="config.keywordCase = opt.value as any; keywordOpen = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Indent style -->
    <div class="sq-field">
      <span class="sq-sublabel">INDENT STYLE</span>
      <div class="sq-dropdown" tabindex="0" @blur="onIndentBlur($event)">
        <button type="button" class="sq-dropdown-trigger" @click="indentOpen = !indentOpen">
          <span>{{ indentLabel }}</span>
          <icon-mdi-chevron-down class="sq-chevron" :class="{ 'sq-chevron-open': indentOpen }" />
        </button>
        <div v-if="indentOpen" class="sq-dropdown-menu">
          <button
            v-for="opt in indentOptions" :key="opt.value" type="button"
            class="sq-dropdown-item" :class="{ 'sq-dropdown-item-active': opt.value === config.indentStyle }"
            @click="config.indentStyle = opt.value as any; indentOpen = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div style="flex: 1 1 300px; min-width: 0;">
    <div class="kt-section-label">
      Your SQL query
    </div>
    <c-input-text
      ref="inputElement"
      v-model:value="rawSQL"
      placeholder="Put your SQL query here..."
      rows="20"
      multiline
      autofocus
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </div>
  <div style="flex: 1 1 300px; min-width: 0;">
    <div class="kt-section-label">
      Prettified version of your query
    </div>
    <TextareaCopyable :value="prettySQL" language="sql" :follow-height-of="inputElement" />
  </div>
  </div>
</template>

<style scoped>
.sq-controls {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.sq-field { display: flex; flex-direction: column; gap: 5px; }
.sq-sublabel {
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
.sq-dropdown { position: relative; outline: none; }
.sq-dropdown-trigger {
  display: flex; align-items: center; gap: 8px; min-width: 160px;
  background: #121212; border: 1px solid rgba(var(--kt-accent-rgb), 0.2); border-radius: 5px;
  padding: 7px 10px; font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem; color: rgba(255,255,255,0.75); cursor: pointer;
  transition: border-color 0.15s; text-align: left;
}
.sq-dropdown-trigger:hover, .sq-dropdown:focus-within .sq-dropdown-trigger {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}
.sq-chevron { margin-left: auto; color: rgba(var(--kt-accent-rgb), 0.5); transition: transform 0.15s; flex-shrink: 0; }
.sq-chevron-open { transform: rotate(180deg); }
.sq-dropdown-menu {
  position: absolute; top: calc(100% + 4px); left: 0; min-width: 100%;
  background: rgba(10,10,10,0.97); border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 6px; overflow: hidden; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}
.sq-dropdown-item {
  display: block; width: 100%; padding: 7px 14px; background: transparent;
  border: none; border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.06); text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem; color: rgba(255,255,255,0.55); cursor: pointer; transition: background 0.1s, color 0.1s;
}
.sq-dropdown-item:last-child { border-bottom: none; }
.sq-dropdown-item:hover { background: rgba(var(--kt-accent-rgb), 0.1); color: #fff; }
.sq-dropdown-item-active { color: var(--kt-accent); background: rgba(var(--kt-accent-rgb), 0.08); }
</style>
