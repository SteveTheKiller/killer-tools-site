<script setup lang="ts">
import { useHead } from '@vueuse/head';

const aboutTitle = 'About - Killer Tools';
const aboutDescription = 'About Killer Tools: a free, open-source collection of handy online tools for developers, sysadmins, and IT pros.';
const aboutUrl = 'https://killertools.net/about';
useHead({
  title: aboutTitle,
  link: [
    { rel: 'canonical', href: aboutUrl },
  ],
  meta: [
    { name: 'description', content: aboutDescription },
    { property: 'og:title', content: aboutTitle },
    { property: 'og:description', content: aboutDescription },
    { property: 'og:url', content: aboutUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: aboutTitle },
    { name: 'twitter:description', content: aboutDescription },
  ],
});
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px />
</template>
