<script setup lang="ts">
import type { UseValidationRule } from '@/composable/validation';
import JSON5 from 'json5';
import { withDefaultOnError } from '@/utils/defaults';
import { convertArrayToCsv } from './json-to-csv.service';

const { t } = useI18n();

function transformer(value: string) {
  return withDefaultOnError(() => {
    if (value === '') {
      return '';
    }
    return convertArrayToCsv({ array: JSON5.parse(value) });
  }, '');
}

const rules = computed<UseValidationRule<string>[]>(() => [
  {
    validator: (v: string) => v === '' || JSON5.parse(v),
    message: t('tools.json-to-csv.ui.invalidJson'),
  },
]);
</script>

<template>
  <format-transformer
    :input-label="t('tools.json-to-csv.ui.yourRawJson')"
    :input-placeholder="t('tools.json-to-csv.ui.pasteRawJsonPlaceholder')"
    :output-label="t('tools.json-to-csv.ui.csvOutputLabel')"
    :input-validation-rules="rules"
    :transformer="transformer"
  />
</template>
