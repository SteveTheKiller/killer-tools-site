<script setup lang="ts">
import { Check, Copy, Photo } from '@vicons/tabler';

const PROXY = 'https://gif-proxy.cst-498.workers.dev';

interface GifResult {
  id: string
  title: string
  previewUrl: string
  fullUrl: string
}

const query = ref('');
const loading = ref(false);
const error = ref('');
const results = ref<GifResult[]>([]);
const copiedId = ref<string | null>(null);
const hoveredId = ref<string | null>(null);
const searched = ref(false);

async function search() {
  const q = query.value.trim();
  if (!q) {
    return;
  }
  loading.value = true;
  error.value = '';
  results.value = [];
  searched.value = false;
  try {
    const res = await fetch(`${PROXY}?q=${encodeURIComponent(q)}&limit=36`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }
    const data = await res.json();
    results.value = (data.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title || 'GIF',
      previewUrl: r.images?.fixed_height_small?.url ?? r.images?.fixed_height?.url,
      fullUrl: r.images?.original?.url,
    }));
    searched.value = true;
  }
  catch (e: any) {
    error.value = e.message ?? 'Failed to fetch GIFs.';
  }
  finally {
    loading.value = false;
  }
}

async function copyGif(gif: GifResult) {
  await navigator.clipboard.writeText(gif.fullUrl);
  copiedId.value = gif.id;
  setTimeout(() => {
    copiedId.value = null;
  }, 1800);
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div mb-4 flex flex-wrap items-center gap-3>
      <c-input-text
        v-model:value="query"
        placeholder="Search GIFs (e.g. facepalm, nice work, this is fine)"
        style="flex: 1 1 260px; min-width: 0;"
        raw-text
        @keyup.enter="search"
      >
        <template #prefix>
          <n-icon :component="Photo" mr-6px op-60 />
        </template>
      </c-input-text>

      <c-button :disabled="loading || !query.trim()" style="flex-shrink: 0;" @click="search">
        {{ loading ? 'Searching...' : 'Search' }}
      </c-button>
    </div>

    <n-alert v-if="error" type="error" closable mb-4 @close="error = ''">
      {{ error }}
    </n-alert>

    <div v-if="searched && results.length === 0 && !loading" py-10 text-center op-50>
      No GIFs found for "{{ query }}".
    </div>

    <div v-if="loading" class="gif-grid">
      <div v-for="n in 12" :key="n" class="gif-shimmer" />
    </div>

    <div v-else-if="results.length > 0" class="gif-grid">
      <div
        v-for="gif in results"
        :key="gif.id"
        class="gif-card"
        :title="gif.title"
        @mouseenter="hoveredId = gif.id"
        @mouseleave="hoveredId = null"
        @click="copyGif(gif)"
      >
        <img
          :src="hoveredId === gif.id ? gif.fullUrl : gif.previewUrl"
          :alt="gif.title"
          class="gif-img"
          loading="lazy"
        >
        <div v-if="copiedId === gif.id" class="gif-overlay-copied">
          <n-icon :component="Check" size="26" />
          <span>Copied!</span>
        </div>
        <div v-else-if="hoveredId === gif.id" class="gif-overlay-hover">
          <n-icon :component="Copy" size="18" />
          <span>Copy URL</span>
        </div>
      </div>
    </div>

    <div v-if="results.length > 0" mt-3 style="font-size: 0.75rem;" op-40>
      {{ results.length }} results — click to copy URL — paste in Teams, Telegram, Slack
    </div>
  </div>
</template>

<style scoped>
.gif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.gif-card {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  aspect-ratio: 1 / 1;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.gif-card:hover {
  transform: scale(1.04);
  box-shadow: 0 0 0 2px var(--primary-color, #18a058);
}

.gif-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gif-overlay-copied,
.gif-overlay-hover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  pointer-events: none;
}

.gif-overlay-copied {
  background: rgba(0, 0, 0, 0.6);
  color: #4ade80;
}

.gif-overlay-hover {
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
}

.gif-shimmer {
  border-radius: 6px;
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
