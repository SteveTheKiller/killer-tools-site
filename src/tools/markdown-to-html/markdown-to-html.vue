<script setup lang="ts">
import { computed, ref } from 'vue';
import markdownit from 'markdown-it';
import { useMessage } from 'naive-ui';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const message = useMessage();
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
    message?.success('HTML copied to clipboard!');
  }
  catch (err) {
    message?.error('Failed to copy text.');
  }
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;" class="w-full">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div class="min-w-0">
        <div class="mb-1 text-xs opacity-60">
          Your Markdown to convert:
        </div>
        <c-input-text
          v-model:value="inputMarkdown"
          multiline
          raw-text
          placeholder="Your Markdown content..."
          :rows="24"
          autofocus
        />
      </div>

      <div class="flex flex-col min-w-0">
        <div class="mb-1 flex items-center justify-between">
          <div class="text-xs opacity-60">
            Output HTML:
          </div>
          <n-button quaternary size="tiny" @click="copyToClipboard(outputHtml)">
            <template #icon>
              <span class="i-carbon-copy inline-block h-4 w-4" />
            </template>
            Copy HTML
          </n-button>
        </div>

        <div class="flex-1 min-h-[500px]">
          <TextareaCopyable
            :value="outputHtml"
            :word-wrap="true"
            language="html"
            class="h-full"
          />
        </div>
      </div>
    </div>

    <n-divider />

    <div class="mt-4 flex justify-center">
      <n-button type="primary" @click="printHtml">
        Print as PDF
      </n-button>
    </div>
  </div>
</template>
