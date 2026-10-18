<script setup lang="ts">
import type { QrCode } from './reader.types';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();
const message = useMessage();
const style = useStyleStore();
const canvas = ref<HTMLCanvasElement>();
const codes = ref<QrCode[]>([]);
const status = ref<'idle' | 'reading' | 'done' | 'error'>('idle');
const pending = ref<QrCode>();
let worker: Worker | undefined;
let bitmap: ImageBitmap | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;

watch([() => style.ktTheme, () => style.ktAccent], () => requestAnimationFrame(draw), { flush: 'post' });

function draw() {
  if (!canvas.value || !bitmap) {
    return;
  }
  const context = canvas.value.getContext('2d');
  if (!context) {
    return;
  }
  context.drawImage(bitmap, 0, 0);
  context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--kt-accent').trim() || '#0affe7';
  context.lineWidth = Math.max(1, bitmap.width / 700);
  for (const code of codes.value) {
    context.beginPath();
    code.corners.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.closePath();
    context.stroke();
  }
}

function stop() {
  worker?.terminate();
  worker = undefined;
  clearTimeout(timer);
}

async function read(file: File) {
  const current = ++generation;
  stop();
  bitmap?.close();
  bitmap = undefined;
  codes.value = [];
  pending.value = undefined;
  status.value = 'reading';
  try {
    if (!/^image\/(?:png|jpeg|webp|bmp|x-ms-bmp|gif)$/.test(file.type) || file.size > 40_000_000) {
      throw new Error('Unsupported image.');
    }
    const image = await createImageBitmap(file);
    if (current !== generation) {
      image.close();
      return;
    }
    bitmap = image;
    if (image.width * image.height > 16_000_000 || !canvas.value) {
      throw new Error('Image is too large.');
    }
    canvas.value.width = image.width;
    canvas.value.height = image.height;
    draw();
    const pixels = canvas.value.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, image.width, image.height).data;
    const gray = new Uint8Array(image.width * image.height);
    for (let i = 0; i < gray.length; i++) {
      const at = i * 4;
      const luma = (77 * pixels[at] + 150 * pixels[at + 1] + 29 * pixels[at + 2]) >> 8;
      gray[i] = Math.round((luma * pixels[at + 3] + 255 * (255 - pixels[at + 3])) / 255);
    }
    worker = new Worker(new URL('./reader.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }: MessageEvent<{ codes?: QrCode[], error?: boolean }>) => {
      if (current !== generation) {
        return;
      }
      clearTimeout(timer);
      codes.value = data.codes ?? [];
      status.value = data.error ? 'error' : 'done';
      draw();
    };
    worker.onerror = () => {
      if (current === generation) {
        stop();
        status.value = 'error';
      }
    };
    timer = setTimeout(() => {
      stop();
      status.value = 'error';
    }, 60000);
    worker.postMessage({
      gray: gray.buffer,
      width: image.width,
      height: image.height,
      runtimeBase: new URL(`${import.meta.env.BASE_URL}qr-reader-runtime/`, location.origin).href,
    }, [gray.buffer]);
  }
  catch {
    if (current === generation) {
      status.value = 'error';
    }
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success(t('tools.qrcode-reader.copied'));
  }
  catch {
    message.error(t('tools.qrcode-reader.copyFailed'));
  }
}

function open(code: QrCode, confirmed = false) {
  if (!code.link.url || !['Allowed', 'Warning'].includes(code.link.disposition)) {
    return;
  }
  if (code.link.disposition === 'Warning' && !confirmed) {
    pending.value = code;
    return;
  }
  const url = new URL(code.link.url);
  if (url.protocol === 'https:' || url.protocol === 'http:') {
    window.open(url.href, '_blank', 'noopener,noreferrer');
  }
  pending.value = undefined;
}

onBeforeUnmount(() => {
  generation++;
  stop();
  bitmap?.close();
});
</script>

<template>
  <div class="qr-reader">
    <p>{{ t('tools.qrcode-reader.privacy') }}</p>
    <c-file-upload :title="t('tools.qrcode-reader.pick')" accept="image/png,image/jpeg,image/webp,image/bmp,image/gif" @file-upload="read" />
    <p v-if="status === 'reading'" role="status">
      {{ t('tools.qrcode-reader.reading') }}
    </p>
    <p v-if="status === 'error'" role="alert">
      {{ t('tools.qrcode-reader.error') }}
    </p>
    <p v-if="status === 'done' && !codes.length" role="status">
      {{ t('tools.qrcode-reader.none') }}
    </p>
    <canvas v-show="status === 'done' && codes.length" ref="canvas" class="qr-image" :aria-label="t('tools.qrcode-reader.preview')" />
    <c-card v-for="(code, index) in codes" :key="index" class="qr-result">
      <strong>QR {{ index + 1 }}</strong>
      <pre data-test-id="qr-payload">{{ code.text }}</pre>
      <ul v-if="code.link.warnings.length" class="qr-warnings">
        <li v-for="warning in code.link.warnings" :key="warning">
          {{ t(`tools.qrcode-reader.warnings.${warning}`) }}
        </li>
      </ul>
      <div class="qr-actions">
        <n-button @click="copy(code.text)">
          {{ t('tools.qrcode-reader.copy') }}
        </n-button>
        <n-button v-if="code.wifiPassword" @click="copy(code.wifiPassword)">
          {{ t('tools.qrcode-reader.copyPassword') }}
        </n-button>
        <n-button v-if="['Allowed', 'Warning'].includes(code.link.disposition)" data-test-id="qr-open" @click="open(code)">
          {{ t('tools.qrcode-reader.open') }}
        </n-button>
      </div>
    </c-card>
    <n-modal :show="!!pending" preset="dialog" :title="t('tools.qrcode-reader.confirmTitle')" @update:show="pending = undefined">
      <ul>
        <li v-for="warning in pending?.link.warnings" :key="warning">
          {{ t(`tools.qrcode-reader.warnings.${warning}`) }}
        </li>
      </ul>
      <p class="qr-destination">
        {{ pending?.link.url }}
      </p>
      <div class="qr-actions">
        <n-button @click="pending = undefined">
          {{ t('tools.qrcode-reader.cancel') }}
        </n-button>
        <n-button @click="pending && open(pending, true)">
          {{ t('tools.qrcode-reader.open') }}
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.qr-reader { width: 100%; max-width: 900px; margin: 0 auto; }
.qr-image { display: block; max-width: 100%; max-height: 560px; width: auto; height: auto; margin: 20px auto; }
.qr-result { margin-top: 16px; }
.qr-result pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }
.qr-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.qr-warnings { padding-left: 20px; }
.qr-destination { overflow-wrap: anywhere; }
</style>
