<script lang="ts" setup>
import type { ToolCategory } from '@/tools/tools.types';
import { Home2, Menu2 } from '@vicons/tabler';
import { NIcon, useThemeVars } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import NavbarButtons from '@/components/NavbarButtons.vue';
import ThemeDots from '@/components/ThemeDots.vue';
import { config } from '@/config';
import { useStyleStore } from '@/stores/style.store';
import { useToolStore } from '@/tools/tools.store';
import MenuLayout from '../components/MenuLayout.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();

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
        <RouterLink to="/" class="sider-logo" aria-label="KillerTools home">
          <!-- Live wordmark: real text in the family font, so "Tools" follows
               the active theme + accent with zero baked-asset duplication -->
          <span class="wm"><span class="wm-killer">Killer</span><span class="wm-tools">Tools</span></span>
        </RouterLink>

        <CollapsibleToolMenu :tools-by-category="tools" />
      </div>
    </template>

    <!-- Frame system (Grunge): the titlebar is chrome that lives in MenuLayout's
         fixed shell - present on every page, sidebar-toned, with the content pane
         recessed and scrolling beneath it, exactly like the app windows. -->
    <template #titlebar>
      <div flex items-center gap-2>
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

        <!-- Search stays a comfortable width instead of swallowing the whole bar;
             the spacer pushes the nav buttons to the right edge. -->
        <div class="palette-wrap">
          <command-palette />
        </div>
        <div flex-1 />

        <ThemeDots />
        <NavbarButtons />
      </div>
    </template>

    <template #content>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
/* Titlebar shell (position, chrome color, grain) lives in MenuLayout.vue;
   this only shapes the row's contents. */
.palette-wrap {
  flex: 1 1 auto;
  max-width: 520px;
  min-width: 0;
}

/* Sider wordmark: chrome block at the top of the sidebar, matching the titlebar
   band height so the frame line runs continuously across the corner */
.sider-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 12px 10px;
  text-decoration: none;

  .wm {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    font-family: 'KillerScan', 'Courier New', monospace;
    line-height: 1;
  }

  .wm-killer {
    font-size: 49px;
    color: #f2f2f2;
    text-shadow: 3px 3px 4px rgba(0, 0, 0, 0.85), 6px 6px 12px rgba(0, 0, 0, 0.55);
  }

  /* Suffix: 1.3x, accent-colored, stroke-bolded - the family wordmark rule */
  .wm-tools {
    font-size: 64px;
    color: var(--kt-accent, #0AFFE7);
    -webkit-text-stroke: 1.6px var(--kt-accent, #0AFFE7);
    text-shadow: 3px 3px 4px rgba(0, 0, 0, 0.85), 6px 6px 12px rgba(0, 0, 0, 0.55);
  }
}

/* Light family: dark "Killer", no text shadows (family rule) */
html:not(.dark) .sider-logo {
  .wm-killer {
    color: #111111;
    text-shadow: none;
  }
  .wm-tools {
    text-shadow: none;
  }
}

.sider-content {
  padding-top: 0;
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
