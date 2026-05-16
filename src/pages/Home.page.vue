<script setup lang="ts">
// @ts-expect-error tabler icons type export mismatch
import { IconDragDrop, IconHeart } from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { computed, ref } from 'vue';
import Draggable from 'vuedraggable';
import { config } from '@/config';
import { useToolStore } from '@/tools/tools.store';
import popularity from '@/data/tool-popularity.json';
import ColoredCard from '../components/ColoredCard.vue';
import ToolCard from '../components/ToolCard.vue';

const toolStore = useToolStore();

const homeTitle = 'Killer Tools - Handy online tools for developers and IT pros';
const homeDescription = 'A free, open-source collection of handy online tools for developers, sysadmins, and IT pros. Converters, generators, network utilities, and more. No ads, no tracking.';
const homeUrl = 'https://killertools.net/';
useHead({
  title: homeTitle,
  link: [
    { rel: 'canonical', href: homeUrl },
  ],
  meta: [
    { name: 'description', content: homeDescription },
    { property: 'og:title', content: homeTitle },
    { property: 'og:description', content: homeDescription },
    { property: 'og:url', content: homeUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: homeTitle },
    { name: 'twitter:description', content: homeDescription },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Killer Tools',
        'url': homeUrl,
        'description': homeDescription,
        'publisher': {
          '@type': 'Organization',
          'name': 'Killer Tools',
          'url': homeUrl,
        },
      }),
    },
  ],
});
const { t } = useI18n();

const favoriteTools = computed(() => toolStore.favoriteTools);

function onUpdateFavoriteTools() {
  toolStore.updateFavoriteTools(favoriteTools.value);
}

// ── Sort ──────────────────────────────────────────────────────────────────
type SortMode = 'popular' | 'az' | 'za';
const sortMode = ref<SortMode>('popular');

const popularityMap = popularity as Record<string, number>;

function pageviews(path: string): number {
  return popularityMap[path] ?? 0;
}

const sortedTools = computed(() => {
  const all = [...toolStore.tools];
  if (sortMode.value === 'az') {
    return all.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortMode.value === 'za') {
    return all.sort((a, b) => b.name.localeCompare(a.name));
  }
  // popular — sort by pageviews desc, then alpha for ties
  return all.sort((a, b) => {
    const diff = pageviews(b.path) - pageviews(a.path);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
});

</script>

<template>
  <div>
    <div class="grid-wrapper">
      <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <ColoredCard v-if="config.showBanner" :title="$t('home.follow.title')" :icon="IconHeart">
          {{ $t('home.follow.p1') }}
          <a
            href="https://github.com/SteveTheKiller"
            rel="noopener"
            target="_blank"
            :aria-label="$t('home.follow.githubRepository')"
          >GitHub</a>.
          {{ $t('home.follow.thankYou') }}
          <n-icon :component="IconHeart" />
        </ColoredCard>
      </div>

      <transition name="height">
        <div v-if="toolStore.favoriteTools.length > 0">
          <h3 class="mb-5px mt-25px text-neutral-400 font-500">
            {{ $t('home.categories.favoriteTools') }}
            <c-tooltip :tooltip="$t('home.categories.favoritesDndToolTip')">
              <n-icon :component="IconDragDrop" size="18" />
            </c-tooltip>
          </h3>
          <Draggable
            :list="favoriteTools"
            class="grid grid-cols-1 gap-12px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4"
            ghost-class="ghost-favorites-draggable"
            item-key="name"
            @end="onUpdateFavoriteTools"
          >
            <template #item="{ element: tool }">
              <ToolCard :tool="tool" />
            </template>
          </Draggable>
        </div>
      </transition>

      <div v-if="toolStore.newTools.length > 0">
        <h3 class="mb-5px mt-25px text-neutral-400 font-500">
          {{ t('home.categories.newestTools') }}
        </h3>
        <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToolCard v-for="tool in toolStore.newTools" :key="tool.name" :tool="tool" />
        </div>
      </div>

      <!-- All tools with sort controls -->
      <div class="mb-5px mt-25px" style="display: flex; align-items: center; gap: 12px;">
        <h3 class="text-neutral-400 font-500" style="margin: 0;">
          {{ $t('home.categories.allTools') }}
        </h3>
        <div class="home-sort-group">
          <button
            class="home-sort-btn"
            :class="{ 'home-sort-btn-active': sortMode === 'popular' }"
            type="button"
            @click="sortMode = 'popular'"
          >
            Popular
          </button>
          <button
            class="home-sort-btn"
            :class="{ 'home-sort-btn-active': sortMode === 'az' }"
            type="button"
            @click="sortMode = 'az'"
          >
            A – Z
          </button>
          <button
            class="home-sort-btn"
            :class="{ 'home-sort-btn-active': sortMode === 'za' }"
            type="button"
            @click="sortMode = 'za'"
          >
            Z – A
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <ToolCard v-for="tool in sortedTools" :key="tool.name" :tool="tool" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.height-enter-active,
.height-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.height-enter-from,
.height-leave-to {
  max-height: 42px;
  overflow: hidden;
  opacity: 0;
  margin-bottom: 0;
}

.ghost-favorites-draggable {
  opacity: 0.4;
  background-color: #ccc;
  border: 2px dashed #666;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
  animation: ghost-favorites-draggable-animation 0.2s ease-out;
}

@keyframes ghost-favorites-draggable-animation {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.4;
    transform: scale(1.0);
  }
}

.home-sort-group {
  display: inline-flex;
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 5px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
}

.home-sort-btn {
  padding: 3px 12px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.15);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: var(--n-text-color, rgba(128, 128, 128, 0.8));
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: rgba(30, 165, 76, 0.08);
    color: #1ea54c;
  }
}

.home-sort-btn-active {
  background: rgba(30, 165, 76, 0.12);
  color: #1ea54c;
}
</style>
