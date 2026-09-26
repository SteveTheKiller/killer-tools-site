<script setup lang="ts">
import type { UseValidationRule } from '@/composable/validation';
import JSON5 from 'json5';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const defaultValue = '{\n\t"hello": [\n\t\t"world"\n\t]\n}';
const transformer = (value: string) => withDefaultOnError(() => JSON.stringify(JSON5.parse(value), null, 0), '');

const rules = computed<UseValidationRule<string>[]>(() => [
  {
    validator: (v: string) => v === '' || JSON5.parse(v),
    message: t('tools.json-minify.ui.invalidJson'),
  },
]);
</script>

<template>
  <format-transformer
    :input-label="t('tools.json-minify.ui.inputLabel')"
    :input-default="defaultValue"
    :input-placeholder="t('tools.json-minify.ui.inputPlaceholder')"
    :output-label="t('tools.json-minify.ui.outputLabel')"
    output-language="json"
    :input-validation-rules="rules"
    :transformer="transformer"
  />
</template>
