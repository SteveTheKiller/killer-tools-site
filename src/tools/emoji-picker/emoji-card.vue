<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';
import { useCopy } from '@/composable/copy';

const props = (defineProps<{ emojiInfo: EmojiInfo }>());
const { emojiInfo } = toRefs(props);

const { copy } = useCopy();
</script>

<template>
  <div class="ec-card" @click="copy(emojiInfo.emoji, { notificationMessage: `Emoji ${emojiInfo.emoji} copied to the clipboard` })">
    <div class="ec-emoji">
      {{ emojiInfo.emoji }}
    </div>

    <div class="ec-info">
      <div class="ec-title">
        {{ emojiInfo.title }}
      </div>
      <div class="ec-meta">
        <span class="ec-code" @click.stop="copy(emojiInfo.codePoints, { notificationMessage: `Code points '${emojiInfo.codePoints}' copied to the clipboard` })">
          {{ emojiInfo.codePoints }}
        </span>
        <span class="ec-code ec-unicode" @click.stop="copy(emojiInfo.unicode, { notificationMessage: `Unicode '${emojiInfo.unicode}' copied to the clipboard` })">
          {{ emojiInfo.unicode }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ec-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.1);
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.1s, border-color 0.12s;
  min-width: 0;
}

.ec-card:hover {
  background: rgba(var(--kt-accent-rgb), 0.08);
  border-color: rgba(var(--kt-accent-rgb), 0.4);
}

.ec-emoji {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}

.ec-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ec-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ec-meta {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  min-width: 0;
}

.ec-code {
  font-size: 0.68rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.1s;
}

.ec-code:hover {
  color: var(--kt-accent);
}

.ec-unicode {
  min-width: 0;
}

/* Light mode */
html:not(.dark) .ec-card {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
}

html:not(.dark) .ec-card:hover {
  background: rgba(13, 112, 51, 0.08);
  border-color: rgba(13, 112, 51, 0.35);
}

html:not(.dark) .ec-title {
  color: rgba(0, 0, 0, 0.82);
}

html:not(.dark) .ec-code {
  color: rgba(0, 0, 0, 0.58);
}

html:not(.dark) .ec-code:hover {
  color: #0d7033;
}
</style>
