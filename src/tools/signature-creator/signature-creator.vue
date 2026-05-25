<script setup lang="ts">
import { removeBackground } from '@imgly/background-removal';
import SignaturePad from 'signature_pad';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

type Mode = 'draw' | 'removebg';

const mode = ref<Mode>('draw');

// ── Draw mode ──────────────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
let signaturePad: SignaturePad | null = null;
const inkColor = ref('#000000');
const strokeWidth = ref(3);
const isEmpty = ref(true);

function resizeCanvas() {
  if (!canvasRef.value || !signaturePad) {
    return;
  }
  const canvas = canvasRef.value;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (w === 0 || h === 0) {
    return;
  }
  const data = signaturePad.toData();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(ratio, ratio);
  }
  signaturePad.clear();
  if (data.length > 0) {
    signaturePad.fromData(data);
  }
}

function initPad() {
  if (!canvasRef.value) {
    return;
  }
  const canvas = canvasRef.value;
  if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
    requestAnimationFrame(initPad);
    return;
  }
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(ratio, ratio);
  }

  signaturePad = new SignaturePad(canvas, {
    penColor: inkColor.value,
    minWidth: strokeWidth.value * 0.4,
    maxWidth: strokeWidth.value,
    backgroundColor: 'rgba(0,0,0,0)',
  });

  signaturePad.addEventListener('endStroke', () => {
    isEmpty.value = signaturePad?.isEmpty() ?? true;
  });
}

function clearPad() {
  signaturePad?.clear();
  isEmpty.value = true;
}

function undoPad() {
  const data = signaturePad?.toData();
  if (data && data.length > 0) {
    data.pop();
    signaturePad?.fromData(data);
    isEmpty.value = signaturePad?.isEmpty() ?? true;
  }
}

function downloadSignature() {
  if (!signaturePad || signaturePad.isEmpty()) {
    return;
  }
  const dataUrl = signaturePad.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'signature.png';
  a.click();
}

watch(inkColor, (val) => {
  if (signaturePad) {
    signaturePad.penColor = val;
  }
});

watch(strokeWidth, (val) => {
  if (signaturePad) {
    signaturePad.minWidth = val * 0.4;
    signaturePad.maxWidth = val;
  }
});

// Re-init the pad when switching back to draw mode so canvas is sized correctly
watch(mode, async (val) => {
  if (val === 'draw') {
    await nextTick();
    if (signaturePad) {
      resizeCanvas();
    }
    else {
      initPad();
    }
  }
});

// ── Remove BG mode ─────────────────────────────────────────────────
const uploadedImage = ref<string | null>(null);
const resultImage = ref<string | null>(null);
const processing = ref(false);
const processingStatus = ref('');
const uploadedFilename = ref('');
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    loadFile(file);
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    loadFile(file);
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function loadFile(file: File) {
  uploadedFilename.value = file.name;
  resultImage.value = null;
  processingStatus.value = '';
  const reader = new FileReader();
  reader.onload = e => (uploadedImage.value = e.target?.result as string);
  reader.readAsDataURL(file);
}

async function runRemoveBackground() {
  if (!uploadedImage.value) {
    return;
  }
  processing.value = true;
  processingStatus.value = 'Loading AI model...';

  try {
    const response = await fetch(uploadedImage.value);
    const blob = await response.blob();

    processingStatus.value = 'Removing background...';
    const resultBlob = await removeBackground(blob, {
      progress: (key: string, current: number, total: number) => {
        if (key.includes('inference') || key.includes('compute')) {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          processingStatus.value = `Processing... ${pct}%`;
        }
        else if (key.includes('fetch') || key.includes('download')) {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          processingStatus.value = `Downloading model... ${pct}%`;
        }
      },
    });

    if (resultImage.value) {
      URL.revokeObjectURL(resultImage.value);
    }
    resultImage.value = URL.createObjectURL(resultBlob);
    processingStatus.value = '';
  }
  catch (err) {
    console.error(err);
    processingStatus.value = 'Failed to remove background. Try a different image.';
  }
  finally {
    processing.value = false;
  }
}

function downloadResult() {
  if (!resultImage.value) {
    return;
  }
  const a = document.createElement('a');
  a.href = resultImage.value;
  const base = uploadedFilename.value.replace(/\.[^/.]+$/, '') || 'image';
  a.download = `${base}-no-bg.png`;
  a.click();
}

function resetUpload() {
  uploadedImage.value = null;
  resultImage.value = null;
  processingStatus.value = '';
  uploadedFilename.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  initPad();
  resizeObserver = new ResizeObserver(() => {
    if (mode.value === 'draw') {
      requestAnimationFrame(resizeCanvas);
    }
  });
  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  if (resultImage.value) {
    URL.revokeObjectURL(resultImage.value);
  }
});
</script>

<template>
  <div class="sig-layout">
    <div class="sig-columns">
      <!-- LEFT: controls -->
      <div class="sig-col sig-left">
        <div class="kt-terminal sig-panel">
          <!-- Tab bar -->
          <div class="kt-terminal-bar sig-bar">
            <button
              type="button"
              class="sig-tab"
              :class="{ 'sig-tab-active': mode === 'draw' }"
              @click="mode = 'draw'"
            >
              Draw Signature
            </button>
            <button
              type="button"
              class="sig-tab"
              :class="{ 'sig-tab-active': mode === 'removebg' }"
              @click="mode = 'removebg'"
            >
              Remove Background
            </button>
          </div>

          <div class="sig-body">
            <!-- ── Draw mode controls ── -->
            <template v-if="mode === 'draw'">
              <div class="sig-section-label">
                Ink color
              </div>
              <n-color-picker v-model:value="inkColor" :modes="['hex']" />

              <div class="sig-section-label">
                Stroke weight
              </div>
              <div class="sig-pill-row">
                <button
                  v-for="w in [1, 2, 3, 5, 8]"
                  :key="w"
                  type="button"
                  class="sig-pill"
                  :class="{ 'sig-pill-active': strokeWidth === w }"
                  @click="strokeWidth = w"
                >
                  {{ w }}px
                </button>
              </div>

              <div class="sig-section-label">
                Actions
              </div>
              <div class="sig-pill-row">
                <button type="button" class="sig-pill" @click="undoPad">
                  ↩ Undo
                </button>
                <button type="button" class="sig-pill" @click="clearPad">
                  ✕ Clear
                </button>
              </div>

              <button
                type="button"
                class="sig-pill sig-pill-active sig-download-btn"
                :disabled="isEmpty"
                @click="downloadSignature"
              >
                ↓ Download transparent PNG
              </button>
            </template>

            <!-- ── Remove BG mode controls ── -->
            <template v-if="mode === 'removebg'">
              <template v-if="!uploadedImage">
                <div class="sig-section-label">
                  Upload image
                </div>
                <div
                  class="sig-dropzone"
                  :class="{ 'sig-dropzone-over': isDragOver }"
                  @dragover="onDragOver"
                  @dragleave="isDragOver = false"
                  @drop="onDrop"
                  @click="fileInputRef?.click()"
                >
                  <span class="sig-dropzone-icon">⬆</span>
                  <span class="sig-dropzone-text">Drop an image here or click to browse</span>
                  <span class="sig-dropzone-hint">PNG, JPG, WEBP</span>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="sig-file-hidden"
                    @change="onFileSelect"
                  >
                </div>
              </template>

              <template v-else>
                <div class="sig-section-label">
                  Image loaded
                </div>
                <div class="sig-filename">
                  {{ uploadedFilename }}
                </div>

                <div class="sig-pill-row" style="margin-top: 10px;">
                  <button type="button" class="sig-pill" @click="resetUpload">
                    ✕ Remove
                  </button>
                </div>

                <button
                  type="button"
                  class="sig-pill sig-pill-active sig-download-btn"
                  style="margin-top: 12px;"
                  :disabled="processing"
                  @click="runRemoveBackground"
                >
                  {{ processing ? processingStatus : '⚡ Remove background' }}
                </button>

                <div v-if="processingStatus && !processing" class="sig-status-msg">
                  {{ processingStatus }}
                </div>

                <template v-if="resultImage">
                  <div class="sig-section-label" style="margin-top: 14px;">
                    Export
                  </div>
                  <button
                    type="button"
                    class="sig-pill sig-pill-active sig-download-btn"
                    @click="downloadResult"
                  >
                    ↓ Download PNG (no background)
                  </button>
                </template>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- RIGHT: preview -->
      <div class="sig-col sig-right">
        <!-- Draw canvas -->
        <div v-show="mode === 'draw'" class="sig-canvas-frame">
          <canvas ref="canvasRef" class="sig-canvas" />
        </div>

        <!-- Remove BG preview -->
        <template v-if="mode === 'removebg'">
          <div v-if="!uploadedImage" class="sig-canvas-frame sig-canvas-frame-empty">
            <span class="sig-canvas-hint">Upload an image to get started</span>
          </div>
          <template v-else>
            <div v-if="!resultImage" class="sig-preview-wrap">
              <div class="sig-preview-label">
                Original
              </div>
              <img :src="uploadedImage" class="sig-preview-img" alt="original">
            </div>
            <div v-else class="sig-preview-wrap">
              <div class="sig-preview-label">
                Result
              </div>
              <div class="sig-result-frame">
                <img :src="resultImage" class="sig-preview-img" alt="result with background removed">
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.sig-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 900px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  container-type: inline-size;
}

.sig-columns {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  height: 100%;
}

.sig-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sig-left {
  flex: 0 0 300px;
  max-width: 340px;
}

.sig-right {
  flex: 1 1 0;
  align-items: stretch;
}

@container (max-width: 860px) {
  .sig-columns {
    flex-direction: column;
  }
  .sig-left {
    flex: 0 0 auto;
    max-width: none;
    width: 100%;
  }
  .sig-right {
    flex: 0 0 auto;
    width: 100%;
    align-items: stretch;
  }
  .sig-canvas-frame {
    min-height: 260px;
    height: 50vw;
    max-height: 420px;
  }
}

/* ── Terminal card ── */
.kt-terminal { background: #121212 !important; }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.sig-bar {
  padding: 0 !important;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 32px;
}

.sig-bar::before { display: none !important; }

.sig-tab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  padding: 0 12px;
  border: none;
  border-bottom: 2px solid transparent;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: rgba(255, 255, 255, 0.28);
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
  white-space: nowrap;
}

.sig-tab:last-child { border-right: none; }

.sig-tab::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: background 0.12s;
}

.sig-tab:hover {
  color: rgba(30, 165, 76, 0.8);
  background: rgba(30, 165, 76, 0.06);
}

.sig-tab:hover::before { background: rgba(30, 165, 76, 0.5); }

.sig-tab-active {
  color: #1ea54c !important;
  border-bottom-color: #1ea54c !important;
  background: rgba(30, 165, 76, 0.08) !important;
}

.sig-tab-active::before { background: #1ea54c !important; }

.sig-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
}

/* ── Labels / pills ── */
.sig-section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  margin: 10px 0 6px;
  font-weight: 500;
}

.sig-body .sig-section-label:first-child { margin-top: 0; }

.sig-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 2px;
}

.sig-pill {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 3px 11px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.sig-pill:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.sig-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

.sig-pill:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sig-download-btn {
  width: 100%;
  border-radius: 6px !important;
  padding: 7px 16px !important;
  font-size: 0.82rem !important;
  margin-top: 14px;
  text-align: center;
}

/* ── Drop zone ── */
.sig-dropzone {
  border: 1px dashed rgba(30, 165, 76, 0.4);
  border-radius: 8px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  background: rgba(30, 165, 76, 0.04);
  position: relative;
}

.sig-dropzone:hover,
.sig-dropzone-over {
  background: rgba(30, 165, 76, 0.08);
  border-color: rgba(30, 165, 76, 0.7);
}

.sig-dropzone-icon {
  font-size: 1.6rem;
  color: rgba(30, 165, 76, 0.6);
}

.sig-dropzone-text {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.sig-dropzone-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.sig-file-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.sig-filename {
  font-size: 0.78rem;
  color: rgba(30, 165, 76, 0.8);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  word-break: break-all;
}

.sig-status-msg {
  font-size: 0.75rem;
  color: rgba(255, 100, 100, 0.8);
  margin-top: 8px;
}

/* ── Canvas / preview frame ── */
.sig-canvas-frame {
  background:
    linear-gradient(90deg,
      transparent 109px,
      rgba(210, 60, 60, 0.5) 109px,
      rgba(210, 60, 60, 0.5) 111px,
      transparent 111px
    ),
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 28px,
      rgba(100, 160, 230, 0.55) 28px,
      rgba(100, 160, 230, 0.55) 29px
    ),
    #f9f9f8;
  border: 1px solid rgba(30, 165, 76, 0.45);
  border-radius: 2px;
  box-shadow:
    0 0 0 1px rgba(30, 165, 76, 0.08),
    0 2px 12px rgba(0, 0, 0, 0.18),
    0 0 32px rgba(30, 165, 76, 0.18),
    inset 0 0 48px rgba(30, 165, 76, 0.05);
  width: 100%;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 1 1 auto;
}

.sig-canvas-frame-empty {
  border-style: dashed;
}

.sig-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  touch-action: none;
}

/* ── Image previews ── */
.sig-preview-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sig-preview-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  font-weight: 500;
}

.sig-preview-img {
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Checkerboard background to show transparency */
.sig-result-frame {
  border-radius: 8px;
  overflow: hidden;
  background-image:
    linear-gradient(45deg, #3a3a3a 25%, transparent 25%),
    linear-gradient(-45deg, #3a3a3a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #3a3a3a 75%),
    linear-gradient(-45deg, transparent 75%, #3a3a3a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #2a2a2a;
}
</style>
