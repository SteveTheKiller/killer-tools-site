<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';

import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import { storeToRefs } from 'pinia';

import MenuLayout from '../components/MenuLayout.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <div class="sider-content">
        <RouterLink to="/" class="sider-logo">
          <img src="/kt-logo.png" alt="killer-tools">
        </RouterLink>

        <div v-if="styleStore.isSmallScreen" flex flex-col items-center>
          <locale-selector w="90%" />
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <c-link style="display: inline; color: #1ea54c" target="_blank" rel="noopener" href="https://thekiller.net">Steve the Killer</c-link> · © {{ new Date().getFullYear() }}
        </div>
      </div>
    </template>

    <template #content>
      <div flex items-center justify-center gap-2>
        <c-button
          circle
          variant="text"
          :aria-label="$t('home.toggleMenu')"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="Menu2" />
        </c-button>

        <c-tooltip :tooltip="$t('home.home')" position="bottom">
          <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
            <NIcon size="25" :component="Home2" />
          </c-button>
        </c-tooltip>

        <c-tooltip :tooltip="$t('home.uiLib')" position="bottom">
          <c-button v-if="config.app.env === 'development'" to="/c-lib" circle variant="text" :aria-label="$t('home.uiLib')">
            <icon-mdi:brush-variant text-20px />
          </c-button>
        </c-tooltip>

        <command-palette />

        <locale-selector v-if="!styleStore.isSmallScreen" />
      </div>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 160px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  z-index: 30;  /* was 10 */
  overflow: hidden;

  .gradient {
    margin-top: -65px;
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 16px;
    color: #fff;

    .title {
      font-size: 25px;
      font-weight: 600;
    }

    .divider {
      width: 50px;
      height: 2px;
      border-radius: 4px;
      background-color: v-bind('themeVars.primaryColor');
      margin: 0 auto 5px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
}
</style>
