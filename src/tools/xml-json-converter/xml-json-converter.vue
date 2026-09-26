<script setup lang="ts">
import JSON5 from 'json5';
import convert from 'xml-js';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const xmlValue = ref('<a x="1.234" y="It\'s"/>');
const jsonValue = ref('');
const xmlError = ref('');
const jsonError = ref('');
const updating = ref(false);

// Init JSON from default XML
jsonValue.value = withDefaultOnError(
  () => JSON.stringify(convert.xml2js(xmlValue.value, { compact: true }), null, 2),
  '',
);

watch(xmlValue, (val) => {
  if (updating.value) {
    return;
  }
  updating.value = true;
  xmlError.value = '';
  const result = withDefaultOnError(() => {
    const parsed = convert.xml2js(val, { compact: true });
    return JSON.stringify(parsed, null, 2);
  }, null);
  if (result !== null) {
    jsonValue.value = result;
    jsonError.value = '';
  }
  else {
    xmlError.value = t('tools.xml-json-converter.ui.invalidXml');
  }
  updating.value = false;
});

watch(jsonValue, (val) => {
  if (updating.value) {
    return;
  }
  updating.value = true;
  jsonError.value = '';
  const result = withDefaultOnError(() => {
    const parsed = JSON5.parse(val);
    return convert.js2xml(parsed, { compact: true, spaces: 2 });
  }, null);
  if (result !== null) {
    xmlValue.value = result;
    xmlError.value = '';
  }
  else {
    jsonError.value = t('tools.xml-json-converter.ui.invalidJson');
  }
  updating.value = false;
});
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;" class="w-full">
    <div class="grid grid-cols-1 gap-12px md:grid-cols-2">
      <div>
        <div class="mb-1 text-xs op-60">
          {{ t('tools.xml-json-converter.ui.xmlLabel') }}
        </div>
        <c-input-text
          v-model:value="xmlValue"
          multiline
          :rows="24"
          autofocus
          :placeholder="t('tools.xml-json-converter.ui.xmlPlaceholder')"
          raw-text
          font-mono
        />
        <div v-if="xmlError" class="mt-1 text-xs" style="color: var(--error-color, #e03131);">
          {{ xmlError }}
        </div>
      </div>

      <div>
        <div class="mb-1 text-xs op-60">
          {{ t('tools.xml-json-converter.ui.jsonLabel') }}
        </div>
        <c-input-text
          v-model:value="jsonValue"
          multiline
          :rows="24"
          :placeholder="t('tools.xml-json-converter.ui.jsonPlaceholder')"
          raw-text
          font-mono
        />
        <div v-if="jsonError" class="mt-1 text-xs" style="color: var(--error-color, #e03131);">
          {{ jsonError }}
        </div>
      </div>
    </div>
  </div>
</template>
