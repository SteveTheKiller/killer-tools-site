<script setup lang="ts">
import DomPurify from 'dompurify';
import { marked } from 'marked';

const props = withDefaults(defineProps<{ markdown?: string }>(), { markdown: '' });
const { markdown } = toRefs(props);

const html = computed(() => {
  const raw = marked.parse(markdown.value) as string;
  // Inject classes + target on all links without fighting marked's renderer types
  const linked = raw.replace(
    /<a href="/g,
    '<a class="text-primary transition decoration-none hover:underline" target="_blank" rel="noopener" href="',
  );
  return DomPurify.sanitize(linked, { ADD_ATTR: ['target'] });
});
</script>

<template>
  <div v-html="html" />
</template>
