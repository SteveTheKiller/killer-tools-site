<script setup lang="ts">
import markdownit from 'markdown-it';
import { useMessage } from 'naive-ui';
import { computed, ref } from 'vue';
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
  catch {
    message?.error('Failed to copy text.');
  }
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;" class="w-full">
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

      <div class="min-w-0 flex flex-col">
        <div class="mb-1 flex items-center justify-between">
          <div class="text-xs opacity-60">
            Output HTML:
          </div>
          <button type="button" class="kt-pill" @click="copyToClipboard(outputHtml)">
            <span class="i-carbon-copy mr-1 inline-block h-3 w-3" />
            Copy HTML
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
        Print as PDF
      </button>
    </div>
  </div>
</template>
