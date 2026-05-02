<script setup lang="ts">
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
} from 'date-fns';
import type { DateFormat, ToDateMapper } from './date-time-converter.types';
import {
  dateToExcelFormat,
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isMongoObjectId,
  isRFC3339DateString,
  isRFC7231DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './date-time-converter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { onClickOutside } from '@vueuse/core';

const inputDate = ref('');
const toDate: ToDateMapper = date => new Date(date);

const formats: DateFormat[] = [
  { name: 'JS locale date string', fromDate: date => date.toString(), toDate, formatMatcher: () => false },
  { name: 'ISO 8601', fromDate: formatISO, toDate: parseISO, formatMatcher: date => isISO8601DateTimeString(date) },
  { name: 'ISO 9075', fromDate: formatISO9075, toDate: parseISO, formatMatcher: date => isISO9075DateString(date) },
  { name: 'RFC 3339', fromDate: formatRFC3339, toDate, formatMatcher: date => isRFC3339DateString(date) },
  { name: 'RFC 7231', fromDate: formatRFC7231, toDate, formatMatcher: date => isRFC7231DateString(date) },
  { name: 'Unix timestamp', fromDate: date => String(getUnixTime(date)), toDate: sec => fromUnixTime(+sec), formatMatcher: date => isUnixTimestamp(date) },
  { name: 'Timestamp', fromDate: date => String(getTime(date)), toDate: ms => new Date(+ms), formatMatcher: date => isTimestamp(date) },
  { name: 'UTC format', fromDate: date => date.toUTCString(), toDate, formatMatcher: date => isUTCDateString(date) },
  { name: 'Mongo ObjectID', fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`, toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000), formatMatcher: date => isMongoObjectId(date) },
  { name: 'Excel date/time', fromDate: date => dateToExcelFormat(date), toDate: excelFormatToDate, formatMatcher: isExcelFormat },
];

const formatIndex = ref(6);
const now = useNow();
const isLive = computed(() => !inputDate.value);

const normalizedDate = computed(() => {
  if (!inputDate.value) return now.value;
  try { return formats[formatIndex.value].toDate(inputDate.value); }
  catch { return undefined; }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) formatIndex.value = matchingIndex;
}

const validation = useValidation({
  source: inputDate,
  watch: [formatIndex],
  rules: [{
    message: 'This date is invalid for this format',
    validator: value => withDefaultOnError(() => {
      if (value === '') return true;
      const maybeDate = formats[formatIndex.value].toDate(value);
      return isDate(maybeDate) && isValid(maybeDate);
    }, false),
  }],
});

function formatDateUsingFormatter(formatter: (date: Date) => string, date?: Date) {
  if (!date || !validation.isValid) return '';
  return withDefaultOnError(() => formatter(date), '');
}

const copiedLabel = ref<string | null>(null);
async function copyValue(name: string, value: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  copiedLabel.value = name;
  setTimeout(() => { if (copiedLabel.value === name) copiedLabel.value = null; }, 2000);
}

// Format dropdown
const fmtMenuOpen = ref(false);
const fmtMenuRef = ref<HTMLElement | null>(null);
onClickOutside(fmtMenuRef, () => { fmtMenuOpen.value = false; });
</script>

<template>
  <div class="dt-tool">
    <div class="dt-terminal">

      <!-- Input area -->
      <div class="dt-input-area">
        <div class="dt-input-row">
          <div class="dt-input-field">
            <label class="dt-field-label">Input</label>
            <input
              v-model="inputDate"
              class="dt-input"
              placeholder="Paste a date string or leave empty for live clock..."
              spellcheck="false"
              autofocus
              :class="{ 'dt-input-error': inputDate && !validation.isValid }"
              @input="onDateInputChanged(($event.target as HTMLInputElement).value)"
            >
          </div>
          <div ref="fmtMenuRef" class="dt-format-wrap">
            <label class="dt-field-label">Format</label>
            <button
              type="button"
              class="dt-fmt-btn"
              :class="{ 'dt-fmt-btn-open': fmtMenuOpen }"
              @click="fmtMenuOpen = !fmtMenuOpen"
            >
              <span class="dt-fmt-label">{{ formats[formatIndex].name }}</span>
              <span class="dt-fmt-caret">{{ fmtMenuOpen ? '▴' : '▾' }}</span>
            </button>
            <div v-if="fmtMenuOpen" class="dt-fmt-menu">
              <button
                v-for="(fmt, i) in formats"
                :key="fmt.name"
                type="button"
                class="dt-fmt-option"
                :class="{ 'dt-fmt-option-active': formatIndex === i }"
                @click="formatIndex = i; fmtMenuOpen = false"
              >
                {{ fmt.name }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="inputDate && !validation.isValid" class="dt-error">Invalid date for this format</div>
      </div>

      <!-- Output header -->
      <div class="dt-section-header">
        <span>OUTPUT</span>
        <span v-if="isLive" class="dt-live">
          <span class="dt-live-dot" /> LIVE
        </span>
      </div>

      <!-- Output rows -->
      <div
        v-for="({ name, fromDate }, i) in formats"
        :key="name"
        class="dt-row"
        @click="copyValue(name, formatDateUsingFormatter(fromDate, normalizedDate))"
      >
        <span class="dt-prompt">&gt;_</span>
        <span class="dt-label">{{ name }}</span>
        <code class="dt-value">{{ formatDateUsingFormatter(fromDate, normalizedDate) }}</code>
        <span class="dt-copy" :class="{ 'dt-copy-done': copiedLabel === name }">
          <span v-if="copiedLabel === name">✓</span>
          <icon-mdi-content-copy v-else-if="formatDateUsingFormatter(fromDate, normalizedDate)" />
        </span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dt-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.dt-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Input area ── */
.dt-input-area {
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dt-input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.dt-input-field {
  flex: 1 1 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

.dt-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  box-sizing: border-box;
}

.dt-input::placeholder { color: rgba(255, 255, 255, 0.2); }
.dt-input-error { color: #e05555; }

.dt-error {
  font-size: 0.7rem;
  color: #e05555;
}

/* ── Format dropdown ── */
.dt-format-wrap {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.dt-fmt-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  cursor: pointer;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.12s;
  white-space: nowrap;
}

.dt-fmt-btn:hover,
.dt-fmt-btn-open { color: #1ea54c; }

.dt-fmt-label { flex: 1; }
.dt-fmt-caret { font-size: 0.7rem; color: rgba(30, 165, 76, 0.65); }

.dt-fmt-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 220px;
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.5);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 50;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.dt-fmt-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  white-space: nowrap;
}

.dt-fmt-option:hover { background: rgba(30, 165, 76, 0.1); color: #1ea54c; }
.dt-fmt-option-active { background: rgba(30, 165, 76, 0.15); border-color: rgba(30, 165, 76, 0.55); color: #1ea54c; }

/* ── Section header ── */
.dt-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dt-live {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1ea54c;
  font-size: 0.65rem;
}

.dt-live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #1ea54c;
  animation: dt-pulse 1.2s ease-in-out infinite;
}

@keyframes dt-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

/* ── Output rows ── */
.dt-row {
  display: grid;
  grid-template-columns: auto 185px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
}

.dt-row:last-child { border-bottom: none; }
.dt-row:hover { background: rgba(30, 165, 76, 0.05); }

.dt-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  line-height: 1.6;
}

.dt-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  line-height: 1.6;
  white-space: nowrap;
}

.dt-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.dt-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
  padding-top: 2px;
}

.dt-row:hover .dt-copy { color: rgba(30, 165, 76, 0.8); }
.dt-copy-done { color: #1ea54c !important; }

@container (max-width: 580px) {
  .dt-input-row { flex-direction: column; gap: 8px; }
  .dt-format-wrap { width: 100%; }
  .dt-row { grid-template-columns: auto 1fr auto; gap: 8px; }
  .dt-prompt { display: none; }
  .dt-label { font-size: 0.7rem; }
}
</style>
