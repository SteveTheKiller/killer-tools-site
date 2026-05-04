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

const makeLabel = (tool: Tool) => () => h(RouterLink, { to: tool.path }, { default: () => tool.name });
const makeIcon = (tool: Tool) => () => h(MenuIconItem, { tool });

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
    <div v-if="tools.length > 1" ml-6px mt-12px flex cursor-pointer items-center op-60 @click="toggleCategoryCollapse({ name })">
      <span :class="{ 'rotate-0': isCollapsed, 'rotate-90': !isCollapsed }" text-16px lh-1 op-50 transition-transform>
        <icon-mdi-chevron-right />
      </span>
      <span ml-8px text-13px>
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
.menu-wrapper {
  display: flex;
  flex-direction: row;
  .menu {
    flex: 1;
    margin-bottom: -10px;
    ::v-deep(.n-menu-item-content::before) {
      left: 0;
      right: 13px;
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
