<script setup lang="ts">
import type { Tool, ToolCategory } from '@/tools/tools.types';
import { useStorage } from '@vueuse/core';
import { useThemeVars } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import { useStyleStore } from '@/stores/style.store';
import MenuIconItem from './MenuIconItem.vue';

const props = withDefaults(defineProps<{ toolsByCategory?: ToolCategory[] }>(), { toolsByCategory: () => [] });
const { toolsByCategory } = toRefs(props);
const route = useRoute();

// Killer app entries carry their own brand icon + wordmark in the menu
const APP_BRAND: Record<string, { icon: string, wm: string }> = {
  '/killer-pdf': { icon: '/brand/kp-icon.png', wm: 'killerpdf' },
  '/killer-shell': { icon: '/brand/ksh-icon.png', wm: 'killershell' },
  '/killer-scan': { icon: '/brand/ks-icon.png', wm: 'killerscan' },
  '/killer-notes': { icon: '/brand/kn-icon.png', wm: 'killernotes' },
  '/killendar': { icon: '/brand/kd-icon.png', wm: 'killendar' },
};

const makeLabel = (tool: Tool) => () => {
  const brand = APP_BRAND[tool.path];
  if (brand) {
    return h(RouterLink, { to: tool.path }, { default: () => [
      h('img', { class: 'wm-menu wm-menu-dark', src: `/brand/${brand.wm}-wordmark-dark.png`, alt: tool.name }),
      h('img', { class: 'wm-menu wm-menu-light', src: `/brand/${brand.wm}-wordmark-light.png`, alt: tool.name }),
    ] });
  }
  return h(RouterLink, { to: tool.path }, { default: () => tool.name });
};
// Both branches go through MenuIconItem. The brand entries used to return a bare <img>,
// which skipped the isNew dot that component draws - so a new Killer app was the one kind
// of tool that could never show it.
const makeIcon = (tool: Tool) => () => {
  const brand = APP_BRAND[tool.path];
  return h(MenuIconItem, brand ? { tool, src: brand.icon } : { tool });
};

const collapsedCategories = useStorage<Record<string, boolean>>(
  'menu-tool-option:collapsed-categories',
  {},
  undefined,
  {
    deep: true,
    serializer: {
      read: v => (v ? JSON.parse(v) : null),
      write: v => JSON.stringify(v),
    },
  },
);

function toggleCategoryCollapse({ name }: { name: string }) {
  const current = collapsedCategories.value[name] === undefined ? name !== 'Killer Scripts' : collapsedCategories.value[name];
  collapsedCategories.value[name] = !current;
}

const menuOptions = computed(() =>
  toolsByCategory.value.map(({ name, components }) => ({
    name,
    isCollapsed: collapsedCategories.value[name] === undefined ? name !== 'Killer Scripts' : collapsedCategories.value[name],
    tools: components.map(tool => ({
      label: makeLabel(tool),
      icon: makeIcon(tool),
      key: tool.path,
    })),
  })),
);

const themeVars = useThemeVars();

const styleStore = useStyleStore();
function onMenuSelect() {
  if (styleStore.isSmallScreen) {
    styleStore.isMenuCollapsed = true;
  }
}
</script>

<template>
  <div v-for="{ name, tools, isCollapsed } of menuOptions" :key="name">
    <div v-if="tools.length > 1" class="cat-header" ml-6px mt-12px flex cursor-pointer items-center op-60 @click="toggleCategoryCollapse({ name })">
      <span :class="{ 'rotate-0': isCollapsed, 'rotate-90': !isCollapsed }" text-16px lh-1 op-50 transition-transform>
        <icon-mdi-chevron-right />
      </span>
      <span class="cat-name" ml-8px>
        {{ name }}
      </span>
    </div>
    <n-collapse-transition :show="tools.length === 1 || !isCollapsed">
      <div class="menu-wrapper">
        <div v-if="tools.length > 1" class="toggle-bar" @click="toggleCategoryCollapse({ name })" />
        <n-menu
          class="menu"
          :value="route.path"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="tools"
          :indent="8"
          :default-expand-all="true"
          @update:value="onMenuSelect"
        />
      </div>
    </n-collapse-transition>
  </div>
</template>

<style scoped lang="less">
.killerscan-link {
  padding: 6px 0 2px 32px;
  a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: v-bind('themeVars.primaryColor');
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    opacity: 0.85;
    transition: opacity 0.15s;
    &:hover {
      opacity: 1;
    }
  }
  .ks-icon {
    font-size: 16px;
  }
  .ks-external {
    font-size: 11px;
    opacity: 0.5;
  }
}
/* Category headers: family section-header voice (small caps, spaced), accent on hover */
.cat-header {
  transition: opacity 0.15s ease;
  &:hover {
    opacity: 1;
    .cat-name { color: var(--kt-accent); }
  }
}
.cat-name {
  font-family: 'KillerScan', 'Courier New', monospace;
  font-size: 15.5px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  transition: color 0.15s ease;
}

/* Light family nulls text strokes (family rule) + swaps brand wordmarks */
html:not(.dark) .menu-wrapper ::v-deep(.n-menu-item-content-header) {
  text-shadow: none !important;
}
html:not(.dark) .menu-wrapper ::v-deep(.wm-menu-dark) {
  display: none;
}
html:not(.dark) .menu-wrapper ::v-deep(.wm-menu-light) {
  display: block;
}

.menu-wrapper {
  display: flex;
  flex-direction: row;
  .menu {
    flex: 1;
    margin-bottom: -10px;
    /* Family voice: menu items in the killer font */
    ::v-deep(.n-menu-item-content-header) {
      font-family: 'KillerScan', 'Courier New', monospace;
      font-size: 16px;
      letter-spacing: 0.4px;
    }
    ::v-deep(.n-menu-item-content::before) {
      left: 0;
      /* 7px: pill end sits 17px from the content pane (8 box + 7 + 2 pane
         gap), matching the 17px on the left (was 13px = 23px total) */
      right: 7px;
      border-radius: 6px;
      transition: background-color 0.15s ease;
    }
    /* Grunge motion: items nudge right on hover; the active item grows an
       accent stripe on its left edge (the sidebar cousin of the tab stripe) */
    ::v-deep(.n-menu-item-content) {
      position: relative;
      transition: transform 0.16s ease;
      &:hover {
        transform: translateX(3px);
      }
    }
    ::v-deep(.n-menu-item-content--selected) {
      &:hover { transform: none; }

      /* White SelectionFg over the solid bar, with the family text stroke
         so the lettering stands out (nulled in Light, per the family rule) */
      .n-menu-item-content-header {
        text-shadow: 0 2px 3px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.5);
      }
    }

    /* Hover: accent lettering gets the same stroke on the gray bar */
    ::v-deep(.n-menu-item-content:hover .n-menu-item-content-header) {
      text-shadow: 0 2px 3px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Killer app entries: brand icon + wordmark sized to sit like text */
    ::v-deep(.menu-app-icon) {
      width: 21px;
      height: 21px;
      object-fit: contain;
      display: block;
    }
    ::v-deep(.wm-menu) {
      /* 18, not 15 - the shared-window wordmarks are taller for the same text size.
         See Killer Branding/make-card-wordmarks.py. */
      height: 18px;
      width: auto;
      display: block;
    }
    ::v-deep(.wm-menu-light) {
      display: none;
    }
  }
  .toggle-bar {
    width: 24px;
    opacity: 0.1;
    transition: opacity ease 0.2s;
    position: relative;
    cursor: pointer;
    &::before {
      width: 2px;
      height: 100%;
      content: ' ';
      background-color: v-bind('themeVars.textColor3');
      border-radius: 2px;
      position: absolute;
      top: 0;
      left: 14px;
    }
    &:hover {
      opacity: 0.5;
    }
  }
}
</style>
