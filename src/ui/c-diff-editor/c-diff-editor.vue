<script setup lang="ts">
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{ options?: monaco.editor.IDiffEditorOptions }>(), { options: () => ({}) });
const { options } = toRefs(props);

window.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

const wrapperRef = ref<HTMLElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;

const originalText = ref('original text');
const modifiedText = ref('modified text');
const isNarrow = ref(false);

monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: { 'editor.background': '#00000000' },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: { 'editor.background': '#00000000' },
});

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => options.value,
  opts => editor?.updateOptions(opts),
  { immediate: true, deep: true },
);

// Watch the WRAPPER (always visible) — not the Monaco div (hidden when narrow)
useResizeObserver(wrapperRef, (entries) => {
  const w = entries[0]?.contentRect?.width ?? 0;
  if (w === 0) {
    return;
  }

  const narrow = w < 500;
  if (narrow !== isNarrow.value) {
    if (narrow && editor) {
      originalText.value = editor.getOriginalEditor().getValue();
      modifiedText.value = editor.getModifiedEditor().getValue();
    }
    isNarrow.value = narrow;

    if (!narrow && editor) {
      nextTick(() => {
        editor?.getOriginalEditor().setValue(originalText.value);
        editor?.getModifiedEditor().setValue(modifiedText.value);
        editor?.layout();
      });
    }
  }
  else if (!narrow) {
    editor?.layout();
  }
});

onMounted(() => {
  if (!editorContainer.value) {
    return;
  }

  editor = monaco.editor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    renderSideBySide: true,
    minimap: { enabled: false },
  });

  editor.setModel({
    original: monaco.editor.createModel(originalText.value, 'txt'),
    modified: monaco.editor.createModel(modifiedText.value, 'txt'),
  });
});
</script>

<template>
  <div ref="wrapperRef" class="cd-wrapper">
    <!-- Narrow: two stacked textareas -->
    <div v-if="isNarrow" class="cd-narrow">
      <div class="cd-pane kt-terminal">
        <div class="cd-pane-label kt-terminal-bar">
          ORIGINAL
        </div>
        <textarea
          v-model="originalText"
          class="cd-textarea"
          rows="10"
          spellcheck="false"
          placeholder="Original text..."
        />
      </div>
      <div class="cd-pane kt-terminal">
        <div class="cd-pane-label kt-terminal-bar">
          MODIFIED
        </div>
        <textarea
          v-model="modifiedText"
          class="cd-textarea"
          rows="10"
          spellcheck="false"
          placeholder="Modified text..."
        />
      </div>
    </div>

    <!-- Wide: Monaco diff editor -->
    <div v-show="!isNarrow" ref="editorContainer" class="cd-monaco" />
  </div>
</template>

<style scoped>
.cd-wrapper {
  width: 100%;
}

.cd-monaco {
  height: 600px;
  width: 100%;
}

.cd-narrow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.cd-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* kt-terminal-bar handles bg/border/dot — just set font/size */
.cd-pane-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.cd-textarea {
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  padding: 10px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.80);
  outline: none;
  resize: vertical;
  line-height: 1.6;
}

.cd-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

/* Light mode */
html:not(.dark) .cd-textarea { color: rgba(0, 0, 0, 0.80); }
html:not(.dark) .cd-textarea::placeholder { color: rgba(0, 0, 0, 0.30); }
</style>
