<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

const props = defineProps<{ editor: Editor }>();
const { editor } = toRefs(props);

const e = () => editor.value;
</script>

<template>
  <div class="mb-bar">
    <button class="mb-btn" :class="{ active: e().isActive('bold') }" title="Bold" @click="e().chain().focus().toggleBold().run()">
      <icon-mdi-format-bold />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('italic') }" title="Italic" @click="e().chain().focus().toggleItalic().run()">
      <icon-mdi-format-italic />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('strike') }" title="Strike" @click="e().chain().focus().toggleStrike().run()">
      <icon-mdi-format-strikethrough />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('code') }" title="Inline code" @click="e().chain().focus().toggleCode().run()">
      <icon-mdi-code-tags />
    </button>

    <span class="mb-sep" />

    <button class="mb-btn" :class="{ active: e().isActive('heading', { level: 1 }) }" title="Heading 1" @click="e().chain().focus().toggleHeading({ level: 1 }).run()">
      <icon-mdi-format-header-1 />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('heading', { level: 2 }) }" title="Heading 2" @click="e().chain().focus().toggleHeading({ level: 2 }).run()">
      <icon-mdi-format-header-2 />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('heading', { level: 3 }) }" title="Heading 3" @click="e().chain().focus().toggleHeading({ level: 3 }).run()">
      <icon-mdi-format-header-3 />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('heading', { level: 4 }) }" title="Heading 4" @click="e().chain().focus().toggleHeading({ level: 4 }).run()">
      <icon-mdi-format-header-4 />
    </button>

    <span class="mb-sep" />

    <button class="mb-btn" :class="{ active: e().isActive('bulletList') }" title="Bullet list" @click="e().chain().focus().toggleBulletList().run()">
      <icon-mdi-format-list-bulleted />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('orderedList') }" title="Ordered list" @click="e().chain().focus().toggleOrderedList().run()">
      <icon-mdi-format-list-numbered />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('codeBlock') }" title="Code block" @click="e().chain().focus().toggleCodeBlock().run()">
      <icon-mdi-code-braces />
    </button>
    <button class="mb-btn" :class="{ active: e().isActive('blockquote') }" title="Blockquote" @click="e().chain().focus().toggleBlockquote().run()">
      <icon-mdi-format-quote-close />
    </button>

    <span class="mb-sep" />

    <button class="mb-btn" title="Hard break" @click="e().chain().focus().setHardBreak().run()">
      <icon-mdi-keyboard-return />
    </button>
    <button class="mb-btn" title="Clear format" @click="e().chain().focus().clearNodes().unsetAllMarks().run()">
      <icon-mdi-format-clear />
    </button>

    <span class="mb-sep" />

    <button class="mb-btn" title="Undo" @click="e().chain().focus().undo().run()">
      <icon-mdi-undo />
    </button>
    <button class="mb-btn" title="Redo" @click="e().chain().focus().redo().run()">
      <icon-mdi-redo />
    </button>
  </div>
</template>

<style scoped>
.mb-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px;
}

.mb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  font-size: 18px;
  transition: background 0.12s, color 0.12s;
}

.mb-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.12);
  color: var(--kt-accent);
}

.mb-btn.active {
  background: rgba(var(--kt-accent-rgb), 0.18);
  color: var(--kt-accent);
}

.mb-btn svg {
  width: 1em;
  height: 1em;
  display: block;
}

.mb-sep {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
}
</style>
