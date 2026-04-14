<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const route = useRoute();

const head = computed<HeadObject>(() => {
  const title = `${route.meta.name} - Killer Tools`;
  const description = (route.meta?.description as string) ?? '';
  const url = `https://killertools.net${route.path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': route.meta.name,
    'description': description,
    'url': url,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Any',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Killer Tools',
      'url': 'https://killertools.net',
    },
  };
  return {
    title,
    link: [
      { rel: 'canonical', href: url },
    ],
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: ((route.meta.keywords ?? []) as string[]).join(',') },
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      // Twitter
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd),
      },
    ],
  };
});
useHead(head);
const { t } = useI18n();

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''));
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name)));
const toolDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description)));
const isFullscreen = computed<boolean>(() => !!route.meta.fullscreen);
const headerLink = computed<{ label: string; href: string } | undefined>(
  () => route.meta.headerLink as { label: string; href: string } | undefined,
);
</script>

<template>
  <BaseLayout>
    <div :class="isFullscreen ? 'tool-wrapper-fullscreen' : 'tool-wrapper'">
      <div v-if="isFullscreen" class="tool-header-compact">
        <div class="tool-header-compact-left">
          <span class="tool-title-compact">{{ toolTitle }}</span>
          <span class="tool-desc-compact">{{ toolDescription }}</span>
        </div>
        <div class="tool-header-compact-right">
          <a
            v-if="headerLink"
            :href="headerLink.href"
            target="_blank"
            class="tool-header-link"
          >{{ headerLink.label }}</a>
          <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
        </div>
      </div>
      <div v-else class="tool-layout">
        <div class="tool-header">
          <div flex flex-nowrap items-center justify-between>
            <n-h1>
              {{ toolTitle }}
            </n-h1>
            <div>
              <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
            </div>
          </div>
          <div class="separator" />
          <div class="description">
            {{ toolDescription }}
          </div>
        </div>
      </div>
      <div :class="isFullscreen ? 'tool-content tool-content-fullscreen' : 'tool-content'">
        <slot />
      </div>
    </div>
  </BaseLayout>
</template>

<style lang="less" scoped>
.tool-header-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 12px;
}

.tool-header-compact-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tool-title-compact {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tool-header-compact-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-header-link {
  font-size: 0.8rem;
  opacity: 0.5;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

.tool-desc-compact {
  font-size: 0.75rem;
  opacity: 0.45;
}

.tool-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;

  ::v-deep(& > *) {
    flex: 0 1 600px;
  }
}

.tool-content-fullscreen {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 16px;

  ::v-deep(& > *) {
    flex: 0 1 600px;
  }
}

.tool-layout {
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;

  .tool-header {
    padding: 40px 0;
    width: 100%;

    .n-h1 {
      opacity: 0.9;
      font-size: 40px;
      font-weight: 400;
      margin: 0;
      line-height: 1;
    }

    .separator {
      width: 200px;
      height: 2px;
      background: rgb(161, 161, 161);
      opacity: 0.2;

      margin: 10px 0;
    }

    .description {
      margin: 0;

      opacity: 0.7;
    }
  }
}
</style>
