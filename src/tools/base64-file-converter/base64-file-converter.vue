<script setup lang="ts">
import type { Ref } from 'vue';
import { useBase64 } from '@vueuse/core';
import { useCopy } from '@/composable/copy';
import { getExtensionFromMimeType, getMimeTypeFromBase64, previewImageFromBase64, useDownloadFileFromBase64Refs } from '@/composable/downloadBase64';
import { isValidBase64 } from '@/utils/base64';

const fileName = ref('file');
const fileExtension = ref('');
const base64Input = ref('');
const { download } = useDownloadFileFromBase64Refs({ source: base64Input, filename: fileName, extension: fileExtension });

const b64IsValid = computed(() =>
  base64Input.value === '' || isValidBase64(base64Input.value.trim()),
);

watch(base64Input, (newValue) => {
  const { mimeType } = getMimeTypeFromBase64({ base64String: newValue });
  if (mimeType) {
    fileExtension.value = getExtensionFromMimeType(mimeType) || fileExtension.value;
  }
});

function previewImage() {
  if (!b64IsValid.value) {
    return;
  }
  try {
    const image = previewImageFromBase64(base64Input.value);
    image.style.maxWidth = '100%';
    image.style.maxHeight = '400px';
    const container = document.getElementById('bf-preview');
    if (container) {
      container.innerHTML = '';
      container.appendChild(image);
    }
  }
  catch {}
}

function downloadFile() {
  if (!b64IsValid.value) {
    return;
  }
  try {
    download();
  }
  catch {}
}

// File to base64
const fileInput = ref() as Ref<File>;
const { base64: fileBase64 } = useBase64(fileInput);
const { copy: copyFileBase64, isJustCopied: copiedFile } = useCopy({ source: fileBase64, text: 'Base64 string copied to the clipboard' });

const nativeFileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const uploadedFileName = ref('');

function handleFile(file: File) {
  fileInput.value = file;
  uploadedFileName.value = file.name;
}

function onFileInputChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) {
    handleFile(f);
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    handleFile(f);
  }
}
</script>

<template>
  <div class="bf-layout">
    <!-- Base64 to file -->
    <div class="bf-panel kt-terminal">
      <div class="bf-panel-header kt-terminal-bar">
        <span class="bf-panel-title kt-terminal-bar-title">BASE64 TO FILE</span>
      </div>
      <div class="bf-body">
        <div class="bf-row">
          <div class="bf-field bf-field-grow">
            <span class="bf-label">FILE NAME</span>
            <input v-model="fileName" class="bf-input" type="text" placeholder="Download filename" spellcheck="false">
          </div>
          <div class="bf-field">
            <span class="bf-label">EXTENSION</span>
            <input v-model="fileExtension" class="bf-input" type="text" placeholder="ext" spellcheck="false">
          </div>
        </div>

        <div class="bf-field">
          <span class="bf-label">BASE64 STRING</span>
          <textarea
            v-model="base64Input"
            class="bf-textarea"
            :class="{ 'bf-textarea-error': !b64IsValid }"
            placeholder="Put your base64 file string here..."
            rows="6"
            spellcheck="false"
          />
          <span v-if="!b64IsValid" class="bf-error-msg">Invalid base64 string</span>
        </div>

        <div id="bf-preview" class="bf-preview-container" />

        <div class="bf-actions">
          <button
            class="bf-btn"
            :disabled="base64Input === '' || !b64IsValid"
            @click="previewImage()"
          >
            <icon-mdi-image-outline />
            Preview image
          </button>
          <button
            class="bf-btn bf-btn-accent"
            :disabled="base64Input === '' || !b64IsValid"
            @click="downloadFile()"
          >
            <icon-mdi-download />
            Download file
          </button>
        </div>
      </div>
    </div>

    <!-- File to base64 -->
    <div class="bf-panel kt-terminal">
      <div class="bf-panel-header kt-terminal-bar">
        <span class="bf-panel-title kt-terminal-bar-title">FILE TO BASE64</span>
      </div>
      <div class="bf-body">
        <!-- Drop zone -->
        <div
          class="bf-dropzone"
          :class="{ 'bf-dropzone-active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop($event)"
          @click="nativeFileInput?.click()"
        >
          <input
            ref="nativeFileInput"
            type="file"
            class="bf-file-input"
            @change="onFileInputChange($event)"
          >
          <icon-mdi-upload class="bf-drop-icon" />
          <span v-if="uploadedFileName" class="bf-drop-filename">{{ uploadedFileName }}</span>
          <span v-else class="bf-drop-hint">Drag and drop a file here, or click to select</span>
        </div>

        <div class="bf-field">
          <span class="bf-label">FILE IN BASE64</span>
          <textarea
            class="bf-textarea bf-textarea-output"
            :value="fileBase64"
            placeholder="File in base64 will be here"
            rows="6"
            readonly
            spellcheck="false"
          />
        </div>

        <div class="bf-actions">
          <button class="bf-btn bf-btn-accent" @click="copyFileBase64()">
            <icon-mdi-check v-if="copiedFile" />
            <icon-mdi-content-copy v-else />
            {{ copiedFile ? 'Copied!' : 'Copy base64' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.bf-layout {
  flex-wrap: wrap;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  flex: 1 1 100% !important;
  max-width: 100% !important;
  min-width: 0;
}

/* ── Panel ── */
.bf-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 300px;
  min-width: 0;
}

.bf-panel-header {
  padding: 8px 12px;
}

.bf-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1 1 300px;
}

/* ── Labels & fields ── */
.bf-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.bf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bf-field-grow { flex: 1; }

.bf-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

/* ── Inputs ── */
.bf-input {
  height: 32px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 0 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.bf-input:focus { border-color: rgba(30, 165, 76, 0.5); }
.bf-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.bf-textarea {
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}

.bf-textarea:focus { border-color: rgba(30, 165, 76, 0.5); }
.bf-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }
.bf-textarea-output { color: #1ea54c; cursor: default; resize: none; }
.bf-textarea-error { border-color: rgba(200, 50, 50, 0.5) !important; }

.bf-error-msg {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  color: #e05555;
}

/* ── Drop zone ── */
.bf-dropzone {
  border: 2px dashed rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

.bf-dropzone:hover { border-color: rgba(30, 165, 76, 0.6); background: rgba(30, 165, 76, 0.04); }
.bf-dropzone-active { border-color: #1ea54c; background: rgba(30, 165, 76, 0.08); }

.bf-file-input { display: none; }

.bf-drop-icon {
  font-size: 1.8rem;
  color: rgba(30, 165, 76, 0.4);
}

.bf-dropzone-active .bf-drop-icon { color: #1ea54c; }

.bf-drop-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

.bf-drop-filename {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
}

.bf-preview-container {
  display: flex;
  justify-content: center;
}

/* ── Buttons ── */
.bf-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 4px;
}

.bf-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.65);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.bf-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.bf-btn:not(:disabled):hover { background: rgba(30, 165, 76, 0.1); border-color: rgba(30, 165, 76, 0.5); color: #fff; }
.bf-btn-accent { border-color: rgba(30, 165, 76, 0.5); color: #1ea54c; }
.bf-btn-accent:not(:disabled):hover { background: rgba(30, 165, 76, 0.15); color: #4dd07a; }

/* ── Light mode ── */
html:not(.dark) .bf-label { color: rgba(0, 0, 0, 0.60); }

html:not(.dark) .bf-input {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.20);
  color: rgba(0, 0, 0, 0.85);
}

html:not(.dark) .bf-input::placeholder { color: rgba(0, 0, 0, 0.32); }
html:not(.dark) .bf-input:focus { border-color: rgba(13, 112, 51, 0.55); }

html:not(.dark) .bf-textarea {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.20);
  color: rgba(0, 0, 0, 0.85);
}

html:not(.dark) .bf-textarea::placeholder { color: rgba(0, 0, 0, 0.32); }
html:not(.dark) .bf-textarea:focus { border-color: rgba(13, 112, 51, 0.55); }
html:not(.dark) .bf-textarea-output { color: #0b5c28; }

html:not(.dark) .bf-dropzone {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(13, 112, 51, 0.35);
}

html:not(.dark) .bf-dropzone:hover {
  background: rgba(13, 112, 51, 0.08);
  border-color: rgba(13, 112, 51, 0.55);
}

html:not(.dark) .bf-drop-icon { color: rgba(13, 112, 51, 0.55); }
html:not(.dark) .bf-drop-hint { color: rgba(0, 0, 0, 0.50); }
html:not(.dark) .bf-drop-filename { color: #0b5c28; }

html:not(.dark) .bf-btn {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.22);
  color: rgba(0, 0, 0, 0.70);
}

html:not(.dark) .bf-btn:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.14);
  border-color: rgba(13, 112, 51, 0.50);
  color: rgba(0, 0, 0, 0.90);
}

html:not(.dark) .bf-btn-accent {
  border-color: rgba(13, 112, 51, 0.55);
  color: #083d1a;
}

html:not(.dark) .bf-btn-accent:not(:disabled):hover {
  background: rgba(13, 112, 51, 0.14);
  color: #052d12;
}
</style>
 