<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';

const props = withDefaults(defineProps<{ emojiInfos?: EmojiInfo[] }>(), { emojiInfos: () => [] });
const { emojiInfos } = toRefs(props);
</script>

<template>
  <div grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 class="2xl:grid-cols-4">
    <emoji-card v-for="emojiInfo in emojiInfos" :key="emojiInfo.name" :emoji-info="emojiInfo" flex items-center gap-3 />
  </div>
</template>
