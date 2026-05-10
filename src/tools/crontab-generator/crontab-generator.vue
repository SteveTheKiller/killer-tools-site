<script setup lang="ts">
import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';
import { useStyleStore } from '@/stores/style.store';

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const symbols = [
  { symbol: '*', meaning: 'Any value', example: '* * * *', equivalent: 'Every minute' },
  { symbol: '-', meaning: 'Range of values', example: '1-10 * * *', equivalent: 'Minutes 1 through 10' },
  { symbol: ',', meaning: 'List of values', example: '1,10 * * *', equivalent: 'At minutes 1 and 10' },
  { symbol: '/', meaning: 'Step values', example: '*/10 * * *', equivalent: 'Every 10 minutes' },
];

const aliases = [
  { alias: '@yearly / @annually', equivalent: '0 0 1 1 *', meaning: 'Once a year (Jan 1, midnight)' },
  { alias: '@monthly', equivalent: '0 0 1 * *', meaning: 'First of each month, midnight' },
  { alias: '@weekly', equivalent: '0 0 * * 0', meaning: 'Sunday, midnight' },
  { alias: '@daily / @midnight', equivalent: '0 0 * * *', meaning: 'Every day at midnight' },
  { alias: '@hourly', equivalent: '0 * * * *', meaning: 'Every hour, on the hour' },
  { alias: '@reboot', equivalent: '(on startup)', meaning: 'Run once at startup' },
];

// Mobile-friendly combined list (used when small screen)
const helpers = [
  ...symbols,
  ...aliases.map(a => ({
    symbol: a.alias,
    meaning: a.meaning,
    example: a.alias.split(' / ')[0],
    equivalent: a.equivalent,
  })),
];

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, cronstrueConfig);
  }
  return ' ';
});

const cronValidationRules = [
  {
    validator: (value: string) => isCronValid(value),
    message: 'This cron is invalid',
  },
];
</script>

<template>
  <c-card>
    <div mx-auto max-w-sm>
      <c-input-text
        v-model:value="cron"
        size="large"
        placeholder="* * * * *"
        :validation-rules="cronValidationRules"
        autofocus
        mb-3
      />
    </div>

    <div class="cron-terminal">
      <span class="cron-prompt">&gt;_</span>
      <span class="cron-output">{{ cronString || '...' }}</span>
    </div>

    <div class="kt-divider" />

    <div class="toggle-row">
      <button
        type="button"
        class="toggle-pill"
        :class="{ 'toggle-pill-active': cronstrueConfig.use24HourTimeFormat }"
        @click="cronstrueConfig.use24HourTimeFormat = !cronstrueConfig.use24HourTimeFormat"
      >
        <span class="toggle-dot" />24-hour time
      </button>
      <button
        type="button"
        class="toggle-pill"
        :class="{ 'toggle-pill-active': cronstrueConfig.dayOfWeekStartIndexZero }"
        @click="cronstrueConfig.dayOfWeekStartIndexZero = !cronstrueConfig.dayOfWeekStartIndexZero"
      >
        <span class="toggle-dot" />Days start at 0
      </button>
    </div>
  </c-card>

  <c-card>
    <div v-if="styleStore.isSmallScreen">
      <pre class="field-diagram">
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

      <c-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" mb-3 important:border-none>
        <div>Symbol: <strong>{{ symbol }}</strong></div>
        <div>Meaning: <strong>{{ meaning }}</strong></div>
        <div>Example: <strong><code>{{ example }}</code></strong></div>
        <div>Equivalent: <strong>{{ equivalent }}</strong></div>
      </c-card>
    </div>

    <div v-else class="cheatsheet">
      <pre class="field-diagram">
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

      <div class="cheatsheet-cols">
        <div class="cheatsheet-section">
          <div class="section-label">
            Symbols
          </div>
          <table class="ref-table">
            <tr v-for="row in symbols" :key="row.symbol">
              <td class="ref-symbol">
                <code>{{ row.symbol }}</code>
              </td>
              <td class="ref-meaning">
                {{ row.meaning }}
              </td>
              <td class="ref-example">
                <code>{{ row.example }}</code>
              </td>
            </tr>
          </table>
        </div>

        <div class="cheatsheet-section">
          <div class="section-label">
            @ Aliases
          </div>
          <table class="ref-table">
            <tr v-for="row in aliases" :key="row.alias">
              <td class="ref-alias">
                <code>{{ row.alias }}</code>
              </td>
              <td class="ref-equivalent">
                <code>{{ row.equivalent }}</code>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </c-card>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

/* ── Terminal-style cron output ────────────────────────────────────── */
.cron-terminal {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.35);
  border-radius: 8px;
  padding: 14px 18px;
  margin: 5px 0 15px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.cron-prompt {
  color: #1ea54c;
  font-weight: 600;
  font-size: 1.1rem;
  user-select: none;
  line-height: 1.4;
}

.cron-output {
  color: #1ea54c;
  font-size: 1.05rem;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

/* ── Toggle pills ──────────────────────────────────────────────────── */
.toggle-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: inherit;
  padding: 6px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.toggle-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.toggle-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

.toggle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.12s, box-shadow 0.12s;
}

.toggle-pill-active .toggle-dot {
  background: #1ea54c;
  box-shadow: 0 0 8px rgba(30, 165, 76, 0.6);
}

.field-diagram {
  overflow: auto;
  padding: 10px 0;
  margin: 0 0 14px;
  font-size: 0.78rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.75);
}

/* ── Compact reference cheatsheet ──────────────────────────────────── */
.cheatsheet {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.cheatsheet-cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

.ref-table {
  width: 100%;
  border-collapse: collapse;
}

.ref-table tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ref-table td {
  padding: 4px 8px 4px 0;
  font-size: 0.76rem;
  vertical-align: top;
}

.ref-symbol {
  width: 1%;
  white-space: nowrap;
}

.ref-symbol code {
  color: #1ea54c;
  background: rgba(30, 165, 76, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.ref-meaning {
  color: rgba(255, 255, 255, 0.75);
}

.ref-example {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

.ref-example code {
  color: rgba(30, 165, 76, 0.75);
  background: transparent !important;
  font-size: 0.74rem;
}

.ref-alias {
  white-space: nowrap;
}

.ref-alias code {
  color: #1ea54c;
  background: rgba(30, 165, 76, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.76rem;
}

.ref-equivalent {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

.ref-equivalent code {
  color: rgba(30, 165, 76, 0.75);
  background: transparent !important;
  font-size: 0.78rem;
}

/* ── Light mode ── */
html:not(.dark) .cron-terminal {
  background: var(--kt-term-bg, #e8e8e8) !important;
  border-color: rgba(13, 112, 51, 0.30);
}

html:not(.dark) .toggle-pill {
  border-color: rgba(0, 0, 0, 0.15);
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.60);
}

html:not(.dark) .toggle-pill:hover {
  background: rgba(13, 112, 51, 0.10);
  border-color: rgba(13, 112, 51, 0.40);
  color: #0d7033;
}

html:not(.dark) .toggle-pill-active {
  background: rgba(13, 112, 51, 0.15) !important;
  border-color: #0d7033 !important;
  color: #0b5c28 !important;
}

html:not(.dark) .toggle-dot { background: rgba(0, 0, 0, 0.20); }
html:not(.dark) .toggle-pill-active .toggle-dot { background: #0d7033; box-shadow: 0 0 8px rgba(13, 112, 51, 0.5); }

html:not(.dark) .field-diagram { color: rgba(0, 0, 0, 0.75); }

html:not(.dark) .section-label { color: rgba(0, 0, 0, 0.50); }

html:not(.dark) .ref-table tr { border-bottom-color: rgba(0, 0, 0, 0.08); }

html:not(.dark) .ref-meaning { color: rgba(0, 0, 0, 0.75); }

html:not(.dark) .ref-symbol code { background: rgba(13, 112, 51, 0.12); }
html:not(.dark) .ref-alias code { background: rgba(13, 112, 51, 0.12); }
</style>
