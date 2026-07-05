<script lang="ts" setup>
import type { ToolCategory } from '@/tools/tools.types';
import { ChevronLeft, Home2 } from '@vicons/tabler';
import { NIcon, useThemeVars } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import NavbarButtons from '@/components/NavbarButtons.vue';
import ThemeDots from '@/components/ThemeDots.vue';
import { config } from '@/config';
import { useStyleStore } from '@/stores/style.store';
import { NEUTRAL_THEMES, THEME_DEFAULT_ACCENT } from '@/themes';
import { useToolStore } from '@/tools/tools.store';
import MenuLayout from '../components/MenuLayout.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();

// Generated wordmark art, following the live theme + accent (colored themes
// fall back to the teal site identity)
const wmSrc = computed(() => {
  const t = styleStore.ktTheme;
  const accent = NEUTRAL_THEMES.includes(t)
    ? (styleStore.ktAccent || THEME_DEFAULT_ACCENT[t] || 'teal')
    : 'teal';
  return `/brand/killertools-wordmark-${accent}-${t === 'light' ? 'light' : 'dark'}.png`;
});

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
        <!-- Mobile: the drawer covers the topbar chevron, so it gets its own
             collapse button beside the logo -->
        <button
          v-if="styleStore.isSmallScreen"
          type="button"
          class="sider-collapse"
          aria-label="Collapse menu"
          @click="styleStore.isMenuCollapsed = true"
        >
          <NIcon size="25" :component="ChevronLeft" />
        </button>
        <RouterLink to="/" class="sider-logo" aria-label="KillerTools home">
          <!-- Brand icon: large behind the wordmark, fading toward the bottom -->
          <img class="wm-bg" src="/app-icon-512.png" alt="" aria-hidden="true">
          <!-- Generated beveled wordmark art (per-accent files) -->
          <img class="wm" :src="wmSrc" alt="KillerTOOLS">
        </RouterLink>

        <CollapsibleToolMenu :tools-by-category="tools" />
      </div>
    </template>

    <!-- Frame system (Grunge): the titlebar is chrome that lives in MenuLayout's
         fixed shell - present on every page, sidebar-toned, with the content pane
         recessed and scrolling beneath it, exactly like the app windows. -->
    <template #titlebar>
      <div class="tb-row" flex items-center gap-2>
        <c-button
          circle
          variant="text"
          :aria-label="$t('home.toggleMenu')"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="ChevronLeft" class="menu-chevron" :class="{ collapsed: styleStore.isMenuCollapsed }" />
        </c-button>

        <c-tooltip class="tb-home" :tooltip="$t('home.home')" position="bottom">
          <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
            <NIcon size="25" :component="Home2" />
          </c-button>
        </c-tooltip>

        <!-- Mobile brand: icon + wordmark centered in the bar while the
             sidebar (and its logo) is hidden -->
        <router-link to="/" class="tb-brand" aria-label="KillerTools home">
          <img class="tb-brand-icon" src="/app-icon-512.png" alt="">
          <img class="tb-brand-wm" :src="wmSrc" alt="KillerTOOLS">
        </router-link>

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
        <NavbarButtons class="tb-about" />
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

/* Sidebar-gone widths: the search bar becomes an icon-only button, so the
   wrap shrinks to content instead of stretching */
@media (max-width: 700px) {
  .palette-wrap {
    flex: 0 0 auto;
  }
}

/* The topbar row is the positioning ancestor for the brand: when the row
   moves, the brand moves with it — they can never drift apart again */
.tb-row {
  position: relative;
  width: 100%;
}

@media (max-width: 700px) {
  /* Steve's measurement: logo was 3px from the top, 11px from the content.
     +4px here = 7/7. This is the ONLY vertical adjustment in the mobile bar. */
  .tb-row {
    top: 4px;
  }
}

/* Mobile brand (visible only when the sidebar logo is gone) */
.tb-brand {
  display: none;
}

@media (max-width: 700px) {
  .tb-home {
    display: none; /* brand link doubles as home */
  }

  .tb-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    position: absolute;
    left: 50%;
    /* The brand is absolutely positioned so bar padding does NOT move it —
       +2px re-centers it on the row, which sits 4px down in the 40px bar */
    top: 50%; /* same centerline as every other bar element */
    transform: translate(-50%, -50%);
    pointer-events: auto;
  }

  .tb-brand-icon {
    width: 27px;
    height: 27px;
  }

  .tb-brand-wm {
    height: 19px;
    display: block;
  }
}

/* Extreme narrow: the WORDMARK collapses first — the brand icon and the
   search/About icons always stay */
@media (max-width: 430px) {
  .tb-brand-wm {
    display: none;
  }

  .tb-brand-icon {
    width: 24px;
    height: 24px;
  }
}

/* Menu fold chevron: points left (fold) when open, flips right when collapsed */
.menu-chevron {
  transition: transform 0.25s ease;

  &.collapsed {
    transform: rotate(180deg);
  }
}

/* Sider wordmark: chrome block at the top of the sidebar, matching the titlebar
   band height so the frame line runs continuously across the corner */
.sider-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Extra top padding pushes the wordmark down so the brand icon behind it
     has room to show its full top edge; 6px below so the art's baked shadow
     never touches the clip edge */
  padding: 96px 12px 6px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  /* Hard guarantee: the block is always taller than the icon's fade extent
     (10px top + 150px x 86% mask = 139px), so the icon can NEVER flat-cut
     against the clip edge no matter how the wordmark sizing changes */
  min-height: 148px;

  /* Brand icon behind the wordmark: large, dimmed, anchored to the top of the
     block (never clipped) and fading out toward the bottom */
  .wm-bg {
    position: absolute;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    width: 150px;
    height: 150px;
    object-fit: contain;
    opacity: 0.85;
    pointer-events: none;
    /* Fade must reach FULL transparency before the container's clip edge
       (~143px tall now that the wordmark is a 41px image) — otherwise the
       icon flat-cuts at the bottom */
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 48%, rgba(0, 0, 0, 0) 86%);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 48%, rgba(0, 0, 0, 0) 86%);
    z-index: 0;
  }

  /* Generated wordmark art (shadow + bevel baked into the PNG) */
  .wm {
    position: relative;
    z-index: 1;
    display: block;
    width: 252px;
    height: auto;
  }
}

.sider-content {
  padding-top: 0;
  padding-bottom: 200px;
  position: relative;
}

/* Mobile drawer collapse chevron: top-left, beside the logo */
.sider-collapse {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background: none;
  border: none;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.82);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6));
  transition: color 0.12s;

  &:hover {
    color: var(--kt-accent);
  }
}

html:not(.dark) .sider-collapse {
  color: #1a1a1a;
  filter: none;
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
