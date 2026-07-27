<script setup lang="ts">
import type { Tool } from '@/tools/tools.types';
import { useThemeVars } from 'naive-ui';

// `src` is the Killer app entries' own brand icon. They render an <img> instead of the
// tool's vicon, but they still have to go through this component rather than around it -
// the isNew dot lives here, and an entry that skipped it lost its dot (KillerShell and
// KillerNotes were both new and both undotted).
const props = defineProps<{ tool: Tool, src?: string }>();
const { tool } = toRefs(props);

const theme = useThemeVars();
</script>

<template>
  <div class="menu-icon-item">
    <img v-if="src" class="menu-app-icon" :src="src" alt="">
    <n-icon v-else :component="tool.icon" />
    <div v-if="tool.isNew" class="badge" />
  </div>
</template>

<style lang="less" scoped>
.menu-icon-item {
  position: relative;

  .badge {
    position: absolute;
    background-color: v-bind('theme.primaryColor');
    border-radius: 10px;
    line-height: 1;
    top: 3px;
    left: -6px;
    font-size: 10px;

    height: 6px;
    width: 6px;
  }
}
</style>
