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

const inputDate = ref('');

const toDate: ToDateMapper = date => new Date(date);

const formats: DateFormat[] = [
  {
    name: 'JS locale date string',
    fromDate: date => date.toString(),
    toDate,
    formatMatcher: () => false,
  },
  {
    name: 'ISO 8601',
    fromDate: formatISO,
    toDate: parseISO,
    formatMatcher: date => isISO8601DateTimeString(date),
  },
  {
    name: 'ISO 9075',
    fromDate: formatISO9075,
    toDate: parseISO,
    formatMatcher: date => isISO9075DateString(date),
  },
  {
    name: 'RFC 3339',
    fromDate: formatRFC3339,
    toDate,
    formatMatcher: date => isRFC3339DateString(date),
  },
  {
    name: 'RFC 7231',
    fromDate: formatRFC7231,
    toDate,
    formatMatcher: date => isRFC7231DateString(date),
  },
  {
    name: 'Unix timestamp',
    fromDate: date => String(getUnixTime(date)),
    toDate: sec => fromUnixTime(+sec),
    formatMatcher: date => isUnixTimestamp(date),
  },
  {
    name: 'Timestamp',
    fromDate: date => String(getTime(date)),
    toDate: ms => new Date(+ms),
    formatMatcher: date => isTimestamp(date),
  },
  {
    name: 'UTC format',
    fromDate: date => date.toUTCString(),
    toDate,
    formatMatcher: date => isUTCDateString(date),
  },
  {
    name: 'Mongo ObjectID',
    fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
    toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
    formatMatcher: date => isMongoObjectId(date),
  },
  {
    name: 'Excel date/time',
    fromDate: date => dateToExcelFormat(date),
    toDate: excelFormatToDate,
    formatMatcher: isExcelFormat,
  },
];

const formatIndex = ref(6);
const now = useNow();
const isLive = computed(() => !inputDate.value);

const normalizedDate = computed(() => {
  if (!inputDate.value) return now.value;
  const { toDate } = formats[formatIndex.value];
  try {
    return toDate(inputDate.value);
  }
  catch {
    return undefined;
  }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) formatIndex.value = matchingIndex;
}

const validation = useValidation({
  source: inputDate,
  watch: [formatIndex],
  rules: [
    {
      message: 'This date is invalid for this format',
      validator: value =>
        withDefaultOnError(() => {
          if (value === '') return true;
          const maybeDate = formats[formatIndex.value].toDate(value);
          return isDate(maybeDate) && isValid(maybeDate);
        }, false),
    },
  ],
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
  setTimeout(() => {
    if (copiedLabel.value === name) copiedLabel.value = null;
  }, 2000);
}
</script>

<template>
  <div class="dt-tool">
    <c-card>
      <div class="dt-section-label">
        Input
      </div>
      <div class="dt-input-row">
        <c-input-text
          v-model:value="inputDate"
          autofocus
          placeholder="Paste a date string or leave empty for live clock..."
          clearable
          test-id="date-time-converter-input"
          :validation="validation"
          font-mono
          @update:value="onDateInputChanged"
        />
        <c-select
          v-model:value="formatIndex"
          class="dt-format-select"
          :options="formats.map(({ name }, i) => ({ label: name, value: i }))"
          data-test-id="date-time-converter-format-select"
        />
      </div>

      <n-divider />

      <div class="dt-output-header">
        <div class="dt-section-label">
          Output
        </div>
        <div v-if="isLive" class="dt-live-badge">
          <span class="dt-live-dot" />
          LIVE
        </div>
      </div>

      <div class="dt-grid">
        <div
          v-for="({ name, fromDate }, i) in formats"
          :key="name"
          class="dt-row"
          :class="{ 'dt-row--active': i === formatIndex }"
        >
          <span class="dt-prompt">&gt;_</span>
          <span class="dt-label">{{ name }}</span>
          <code class="dt-value">{{ formatDateUsingFormatter(fromDate, normalizedDate) }}</code>
          <button
            type="button"
            class="dt-copy"
            :disabled="!formatDateUsingFormatter(fromDate, normalizedDate)"
            :title="copiedLabel === name ? 'Copied!' : 'Copy'"
            @click="copyValue(name, formatDateUsingFormatter(fromDate, normalizedDate))"
          >
            <span v-if="copiedLabel === name" class="dt-copy-check">✓</span>
            <icon-mdi-content-copy v-else />
          </button>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped>
.dt-tool {
  flex: 1 1 700px;
  max-width: 1200px;
  container-type: inline-size;
}

.dt-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.dt-input-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.dt-format-select {
  flex: 0 0 180px;
}

.dt-output-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.dt-output-header .dt-section-label {
  margin-bottom: 0;
}

.dt-live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #1ea54c;
}

.dt-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1ea54c;
  animation: dt-pulse 1.2s ease-in-out infinite;
}

@keyframes dt-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.dt-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dt-row {
  display: grid;
  grid-template-columns: auto 185px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.dt-row:hover {
  border-color: rgba(30, 165, 76, 0.5);
  background: rgba(0, 0, 0, 0.7);
}

.dt-row--active {
  border-color: rgba(30, 165, 76, 0.5);
}

.dt-prompt {
  color: rgba(30, 165, 76, 0.55);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  line-height: 1.5;
}

.dt-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.5;
  white-space: nowrap;
}


.dt-value {
  color: #1ea54c;
  font-size: 0.82rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 0;
}

.dt-copy {
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

.dt-copy:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.7);
  color: #1ea54c;
}

.dt-copy:disabled {
  opacity: 0.3;
  cursor: default;
}

.dt-copy-check {
  color: #1ea54c;
  font-weight: 700;
}

@container (max-width: 580px) {
  .dt-input-row {
    flex-direction: column;
    gap: 8px;
  }

  .dt-format-select {
    flex: 0 0 auto;
    width: 100%;
  }

  .dt-row {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 7px 10px;
  }

  .dt-prompt {
    display: none;
  }

  .dt-label {
    font-size: 0.7rem;
  }

  .dt-value {
    font-size: 0.76rem;
  }
}
</style>
