<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
</script>

<template>
  <div class="kt-frame">
    <n-layout has-sider class="kt-main-row">
      <n-layout-sider
      id="kt-sider"
      collapse-mode="transform"
      :collapsed-width="0"
      :width="300"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
    >
      <slot name="sider" />
    </n-layout-sider>
    <n-layout class="content-col">
      <!-- Frame titlebar: chrome, OUTSIDE the scroll container, so the content pane
           scrolls beneath a fixed frame (sticky dies inside Naive's nested scrollers). -->
      <div v-if="$slots.titlebar" class="kt-titlebar-shell">
        <slot name="titlebar" />
      </div>
        <n-layout class="content" :class="{ 'has-titlebar': $slots.titlebar }">
          <slot name="content" />
          <transition name="fade">
            <div v-if="isSmallScreen && !isMenuCollapsed" class="overlay" @click="isMenuCollapsed = true" />
          </transition>
        </n-layout>
      </n-layout>
    </n-layout>
    <!-- Statusbar: full-width bottom rail OUTSIDE the sider row, so the frame
         encloses the sidebar exactly like the app windows -->
    <div class="kt-statusbar">
      <span class="sb-left">GPLv3 &middot; killertools.net</span>
      <span class="sb-right">&copy; {{ new Date().getFullYear() }} Steve the Killer</span>
      <div class="kt-grip" aria-hidden="true" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.n-layout-sider {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0 !important;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.content {
  // background-color: #f1f5f9;
  ::v-deep(.n-layout-scroll-container) {
    padding: 14px 26px 26px;
    scrollbar-gutter: stable;

    @media (max-width: 640px) {
      padding: 12px 6px;
    }
  }
}

/* Frame column: main row (sider + content) on top, statusbar rail across the
   full width underneath - the sidebar is enclosed by the frame like the apps */
.kt-frame {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kt-main-row {
  flex: 1 1 auto;
  min-height: 0;
  height: calc(100vh - 25px);
  /* Above the statusbar in paint order, so the pane's shadow lands ON the
     footer; overflow released on the wrapper AND its scroll container so
     the shadow is never clipped */
  position: relative;
  z-index: 2;
  overflow: visible !important;

  ::v-deep(> .n-layout-scroll-container) {
    overflow: visible !important;
  }
}

.content-col {
  height: 100%;
  /* Above the sider in paint order, so the pane's shadow lands ON the
     sidebar; same overflow release for the shadow */
  position: relative;
  z-index: 2;
  overflow: visible !important;
  /* Chrome background lives in App.vue (html.dark .n-layout.content-col):
     it must out-specify the global n-layout pane-tone rule */

  ::v-deep(> .n-layout-scroll-container) {
    overflow: visible !important;
  }
}

.content {
  /* Inset pane: a grained chrome gutter lines all four sides, fully
     enclosing the rounded pane (KillerFind results-pane style) */
  height: calc(100% - 12px);
  margin: 8px 8px 4px;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 14px;
  overflow: hidden;
  /* Raised pane: the shadow falls OUTWARD onto the sidebar, top bar, and
     footer, so the chrome reads lower than the content */
  position: relative;
  z-index: 2;
  /* Strong enough to read inside the 8px chrome gutter on dark themes */
  box-shadow: 0 0 24px 6px rgba(0, 0, 0, 0.9);
}

html:not(.dark) .content {
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.38);
}

/* ── Frame titlebar shell (Grunge chrome): sidebar tone + grain + frame edge ── */
.kt-titlebar-shell {
  height: 57px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  /* IDENTICAL background construction to #kt-sider so the rails and the
     sidebar always blend - one chrome, one pre-dimmed grain tile. No border:
     the frame line lives on the content pane, not between chrome pieces. */
  background: var(--kt-chrome, #000000) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  position: relative;
  flex-shrink: 0;
  > * {
    position: relative;
    /* Above the content pane (z 2): the command-palette modal renders inside
       this stacking context, and must not paint behind the pane */
    z-index: 10;
    width: 100%;
  }

  @media (max-width: 640px) {
    padding: 0 10px;
  }
}


/* Titlebar (57px) + inset gutters + content fill the column exactly, so
   nothing outside the content pane ever scrolls and both rails stay fixed. */
.content.has-titlebar {
  height: calc(100% - 57px - 12px) !important;
}

/* ── Statusbar: black grained chrome rail with the frame line on top ── */
.kt-statusbar {
  height: 25px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--kt-chrome, #000000) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  position: relative;
  font-family: Consolas, monospace;
  font-size: 11px;
  color: var(--kt-rail-text, #888);

  > * {
    position: relative;
    z-index: 1;
  }

  /* footer grip clearance, family standard */
  .sb-right {
    margin-right: 14px;
  }
}

/* Corner triangle grip dots (family standard, bottom-right) */
.kt-grip {
  position: absolute;
  right: 4px;
  bottom: 3px;
  width: 13px;
  height: 13px;
  z-index: 1;
  background-image: radial-gradient(circle, #4a4a4a 1.1px, transparent 1.6px);
  background-size: 4.5px 4.5px;
  background-position: bottom right;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  pointer-events: none;
}

html:not(.dark) .kt-statusbar .kt-grip {
  background-image: radial-gradient(circle, #8a8a8a 1.1px, transparent 1.6px);
}

</style>
