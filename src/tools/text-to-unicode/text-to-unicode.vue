<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

const { t } = useI18n();

const inputText = ref('');
const unicodeFromText = computed(() => inputText.value.trim() === '' ? '' : convertTextToUnicode(inputText.value));
const { copy: copyUnicode } = useCopy({ source: unicodeFromText });

const inputUnicode = ref('');
const textFromUnicode = computed(() => inputUnicode.value.trim() === '' ? '' : convertUnicodeToText(inputUnicode.value));
const { copy: copyText } = useCopy({ source: textFromUnicode });
</script>

<template>
  <!-- single element root: multi-root pages break the route <transition> -->
  <div style="display: contents">
    <c-card :title="t('tools.text-to-unicode.ui.textToUnicodeTitle')">
      <c-input-text v-model:value="inputText" multiline placeholder="e.g. 'Hello Avengers'" :label="t('tools.text-to-unicode.ui.enterTextLabel')" autosize autofocus raw-text test-id="text-to-unicode-input" />
      <c-input-text v-model:value="unicodeFromText" :label="t('tools.text-to-unicode.ui.unicodeFromTextLabel')" multiline raw-text readonly mt-2 :placeholder="t('tools.text-to-unicode.ui.unicodeOutputPlaceholder')" test-id="text-to-unicode-output" />
      <div mt-2 flex justify-center>
        <c-button :disabled="!unicodeFromText" @click="copyUnicode()">
          {{ t('tools.text-to-unicode.ui.copyUnicode') }}
        </c-button>
      </div>
    </c-card>

    <c-card :title="t('tools.text-to-unicode.ui.unicodeToTextTitle')">
      <c-input-text v-model:value="inputUnicode" multiline :placeholder="t('tools.text-to-unicode.ui.inputUnicodePlaceholder')" :label="t('tools.text-to-unicode.ui.enterUnicodeLabel')" autosize raw-text test-id="unicode-to-text-input" />
      <c-input-text v-model:value="textFromUnicode" :label="t('tools.text-to-unicode.ui.textFromUnicodeLabel')" multiline raw-text readonly mt-2 :placeholder="t('tools.text-to-unicode.ui.textOutputPlaceholder')" test-id="unicode-to-text-output" />
      <div mt-2 flex justify-center>
        <c-button :disabled="!textFromUnicode" @click="copyText()">
          {{ t('tools.text-to-unicode.ui.copyText') }}
        </c-button>
      </div>
    </c-card>
  </div>
</template>
