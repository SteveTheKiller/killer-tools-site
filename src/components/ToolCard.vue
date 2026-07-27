<script setup lang="ts">
import type { Tool } from '@/tools/tools.types';
import FavoriteButton from './FavoriteButton.vue';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);

// Killer app entries carry their own brand icon + wordmark (same as the sidebar)
const APP_BRAND: Record<string, { icon: string, wm: string }> = {
  '/killer-pdf': { icon: '/brand/kp-icon.png', wm: 'killerpdf' },
  '/killer-shell': { icon: '/brand/ksh-icon.png', wm: 'killershell' },
  '/killer-scan': { icon: '/brand/ks-icon.png', wm: 'killerscan' },
  '/killer-notes': { icon: '/brand/kn-icon.png', wm: 'killernotes' },
};

const brand = computed(() => APP_BRAND[tool.value.path]);
</script>

<template>
  <router-link :to="tool.path" class="tc-link decoration-none outline-none">
    <div class="kt-terminal tc-card">
      <div class="kt-terminal-bar tc-bar">
        <div class="tc-bar-left">
          <template v-if="brand">
            <img class="tc-icon-img" :src="brand.icon" alt="">
            <img class="tc-wm tc-wm-dark" :src="`/brand/${brand.wm}-wordmark-dark.png`" :alt="tool.name">
            <img class="tc-wm tc-wm-light" :src="`/brand/${brand.wm}-wordmark-light.png`" :alt="tool.name">
          </template>
          <template v-else>
            <n-icon class="tc-icon" size="34" :component="tool.icon" />
            <span class="tc-title">{{ tool.name }}</span>
          </template>
        </div>
        <div class="tc-bar-right">
          <div v-if="tool.isNew" class="tc-new">
            {{ $t('toolCard.new') }}
          </div>
          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <div class="tc-body">
        <div class="tc-desc">
          {{ tool.description }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.tc-link {
  display: block;
  height: 100%;
}

/* Card surface comes from the global kt-terminal skin (panel + grain + accent
   top edge) - same recipe as the killer-scripts cards */
.tc-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}

.tc-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px 0 !important;
}

.tc-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tc-bar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.tc-icon {
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
}

/* Killer app cards: brand icon + wordmark sized to sit like the title */
.tc-icon-img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  flex-shrink: 0;
}

.tc-wm {
  height: 18px;
  width: auto;
  display: block;
}

.tc-wm-light {
  display: none;
}

html:not(.dark) .tc-wm-dark {
  display: none;
}

html:not(.dark) .tc-wm-light {
  display: block;
}

/* Card title: killer font, big and neutral - fixed white/near-black per
   family, deliberately NOT tied to the accent color (mirrors ks-acronym) */
.tc-title {
  font-size: 1.15rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.5px;
  line-height: 1.25;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

html:not(.dark) .tc-title {
  color: #1a1a1a;
  text-shadow: none;
}

.tc-new {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--kt-accent);
  color: #0a0a0a;
  white-space: nowrap;
}

.tc-body {
  padding: 8px 14px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tc-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
