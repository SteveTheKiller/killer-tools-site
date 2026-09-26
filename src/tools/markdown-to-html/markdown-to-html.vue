<script setup lang="ts">
import markdownit from 'markdown-it';
import { useMessage } from 'naive-ui';
import { computed, ref } from 'vue';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const message = useMessage();
const { t } = useI18n();
const inputMarkdown = ref('');

const outputHtml = computed(() => {
  const md = markdownit();
  return md.render(inputMarkdown.value);
});

function printHtml() {
  const w = window.open();
  if (w === null) {
    return;
  }
  w.document.body.innerHTML = outputHtml.value;
  w.print();
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message?.success(t('tools.markdown-to-html.ui.copiedSuccess'));
  }
  catch {
    message?.error(t('tools.markdown-to-html.ui.copyFailed'));
  }
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;" class="w-full">
    <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <div class="min-w-0">
        <div class="mb-1 text-xs opacity-60">
          {{ t('tools.markdown-to-html.ui.inputLabel') }}
        </div>
        <c-input-text
          v-model:value="inputMarkdown"
          multiline
          raw-text
          :placeholder="t('tools.markdown-to-html.ui.inputPlaceholder')"
          :rows="24"
          autofocus
        />
      </div>

      <div class="min-w-0 flex flex-col">
        <div class="mb-1 flex items-center justify-between">
          <div class="text-xs opacity-60">
            {{ t('tools.markdown-to-html.ui.outputLabel') }}
          </div>
          <button type="button" class="kt-pill" @click="copyToClipboard(outputHtml)">
            <span class="i-carbon-copy mr-1 inline-block h-3 w-3" />
            {{ t('tools.markdown-to-html.ui.copyHtmlButton') }}
          </button>
        </div>

        <div class="min-h-[500px] flex-1">
          <TextareaCopyable
            :value="outputHtml"
            :word-wrap="true"
            language="html"
            class="h-full"
          />
        </div>
      </div>
    </div>

    <div class="kt-divider" />

    <div class="mt-4 flex justify-center">
      <button type="button" class="kt-pill kt-pill-active" @click="printHtml">
        {{ t('tools.markdown-to-html.ui.printAsPdfButton') }}
      </button>
    </div>
  </div>
</template>
