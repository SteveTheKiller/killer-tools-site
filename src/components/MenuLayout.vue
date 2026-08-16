<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
// Footer starts at the sider's right edge so it never sits under the sidebar
// (0 when the sider is collapsed or overlaid on a small screen)
const footerLeft = computed(() => (isMenuCollapsed.value || isSmallScreen.value ? '0px' : '300px'));

// ── Easter egg: click the v2.0 version (family standard: red drips + toast) ──
const eggShown = ref(false);
const eggMsg = ref('');
let eggTimer: ReturnType<typeof setTimeout> | undefined;

function popEgg() {
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('span');
    d.className = 'kt-drip';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.height = 18 + Math.random() * 64 + 'px';
    d.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    const dur = 1.1 + Math.random() * 1.6;
    d.style.animation = 'kt-dripfall ' + dur + 's linear forwards';
    d.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), (dur + 0.8) * 1000);
  }
  eggMsg.value = '80 tools. Zero subscriptions. One spiteful field tech.';
  eggShown.value = true;
  if (eggTimer) clearTimeout(eggTimer);
  eggTimer = setTimeout(() => { eggShown.value = false; }, 2800);
}
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
      :class="{ 'sider-overlay': isSmallScreen }"
    >
      <slot name="sider" />
    </n-layout-sider>
    <n-layout class="content-col">
      <!-- Frame titlebar: chrome, OUTSIDE the scroll container, so the content pane
           scrolls beneath a fixed frame (sticky dies inside Naive's nested scrollers). -->
      <div v-if="$slots.titlebar" class="kt-titlebar-shell">
        <slot name="titlebar" />
      </div>
        <n-layout class="content" :class="{ 'has-titlebar': $slots.titlebar, 'no-sider': isMenuCollapsed || isSmallScreen }">
          <slot name="content" />
          <transition name="fade">
            <div v-if="isSmallScreen && !isMenuCollapsed" class="overlay" @click="isMenuCollapsed = true" />
          </transition>
        </n-layout>
      </n-layout>
    </n-layout>
    <!-- Statusbar: offset right by the sider width so the footer never sits
         under the sidebar (the sider runs full height to own the corner) -->
    <div class="kt-statusbar" :style="{ marginLeft: footerLeft }">
      <span class="sb-right"><span class="sb-site">killertools.net</span><span class="sb-sep">&middot;</span><span class="kt-ver" title="click me" @click="popEgg">v2.0</span><span class="sb-xtra">&middot;&nbsp;GPLv3 - <a class="sb-link" href="https://github.com/SteveTheKiller/killer-tools-site" target="_blank" rel="noopener">Source on Github</a> &middot; &copy;{{ new Date().getFullYear() }}</span><span class="sb-sep">&middot;</span><a class="sb-link" href="https://thekiller.net" target="_blank" rel="noopener">Steve the Killer</a></span>
      <div class="kt-grip" aria-hidden="true" />
    </div>
    <Transition name="kt-egg-fade">
      <div v-if="eggShown" class="kt-egg-toast">{{ eggMsg }}</div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
.n-layout-sider {
  /* The FULL property list naive-ui animates, not transform alone: a scoped
     transition shorthand REPLACES naive's own (min/max-width included), so a
     transform-only list made the width snap open/closed instantly and the only
     thing left animating was the content pane's 2px->8px margin - the "snaps,
     then drifts about 8px" collapse (2026-08-16). */
  transition: min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0 !important;
}

/* Small screens: the sider becomes a drawer OVER the content pane. Without
   this it paints UNDER the content-col (z-index 2) and looks broken. */
.n-layout-sider.sider-overlay {
  z-index: 6 !important;
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.45);
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
  /* Allow the column to shrink below its content's min width on phones —
     otherwise the frame overflows horizontally and the pane clips right */
  min-width: 0;
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
  height: calc(100% - 8px);
  /* 2px left: the pane (and its shadow) hugs the sidebar so the selected
     menu pill reads directly against the content edge. No bottom margin:
     the statusbar text then sits 4px from the pane and 4px from the window
     edge, evenly (was 8px above / 4px below). */
  margin: 8px 8px 0 2px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 14px;
  overflow: hidden;
  /* Raised pane: the shadow falls OUTWARD onto the sidebar, top bar, and
     footer, so the chrome reads lower than the content */
  position: relative;
  z-index: 2;
  /* Strong enough to read inside the 8px chrome gutter on dark themes */
  box-shadow: 0 0 18px 3px rgba(0, 0, 0, 0.55);
}

html:not(.dark) .content {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.26);
}

/* No sidebar hugging the pane (collapsed, or drawer mode on small screens):
   match the right-side gutter so the frame reads even on both edges */
.content.no-sider {
  margin-left: 8px;
}

/* ── Frame titlebar shell (Grunge chrome): sidebar tone + grain + frame edge ── */
.kt-titlebar-shell {
  /* Skinny band: search bar keeps 8px of air above and below (was 19/19 at
     64px; centered contents lose 11px per side) */
  height: 42px;
  display: flex;
  align-items: center;
  /* 8px top offset: the search button's visual field is top-aligned in its
     34px box, so box gaps 8/0 read as an even 8px above and below */
  padding: 8px 26px 0;

  /* Phones: shorter bar (no full search field to house), tighter gutters.
     4px top offset re-centers the row optically (was 9 above / 17 below);
     bar height itself never changes */
  @media (max-width: 700px) {
    /* Bar hugs the 36px row exactly (per Steve's measurement); the pane's
       top margin supplies the space below. No vertical padding. */
    /* ONE RULE: everything centers on the bar's horizontal centerline.
       No vertical padding anywhere — nothing can be pushed off-axis. */
    align-items: center;
    box-sizing: border-box;
    height: 36px; /* pane sits at 36+8=44 and never moves */
    padding: 0 10px;
  }
  /* IDENTICAL background construction to #kt-sider so the rails and the
     sidebar always blend - one chrome, one pre-dimmed grain tile. No border:
     the frame line lives on the content pane, not between chrome pieces.
     --kt-chrome-bg is a gradient on the grunge themes, painted fixed at
     viewport size so all the rails show one aligned gradient. */
  background: var(--kt-grain-img, url('/grain-a12.png')) repeat, var(--kt-chrome-bg, var(--kt-chrome, #000000));
  background-size: 256px 256px, 100vw 100vh;
  background-attachment: scroll, fixed;
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
  height: calc(100% - 42px - 8px) !important;
}

/* Matches the phone titlebar height above */
@media (max-width: 700px) {
  .content.has-titlebar {
    height: calc(100% - 36px - 8px) !important;
  }
}

/* ── Statusbar: black grained chrome rail with the frame line on top ── */
.kt-statusbar {
  height: 25px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  /* Only the version + copyright remain, held to the far right */
  justify-content: flex-end;
  padding: 0 16px;
  background: var(--kt-grain-img, url('/grain-a12.png')) repeat, var(--kt-chrome-bg, var(--kt-chrome, #000000));
  background-size: 256px 256px, 100vw 100vh;
  background-attachment: scroll, fixed;
  position: relative;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: Consolas, monospace;
  font-size: 11px;
  color: var(--kt-rail-text, #888);

  > * {
    position: relative;
    z-index: 1;
  }

  /* footer grip clearance, family standard.
     Flex with shrink priorities: when space runs out the GPLv3/Github middle
     ellipsizes first, then the site name — "Steve the Killer" NEVER trims. */
  .sb-right {
    margin-right: 14px;
    white-space: nowrap;
    min-width: 0;
    display: inline-flex;
    align-items: center;
  }

  .sb-xtra {
    flex: 0 50 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .sb-site {
    flex: 0 10 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .kt-ver,
  .sb-right > a {
    flex: 0 0 auto;
  }

  /* Separator dots: explicit items with breathing room (flex strips the
     whitespace around loose text nodes) */
  .sb-sep {
    flex: 0 0 auto;
    margin: 0 5px;
  }

  .sb-xtra {
    margin-left: 5px;
  }

  /* Phones: the flex shrink weights above ellipsize the middle gracefully;
     only genuinely tight widths drop the GPLv3/(c) middle entirely. The site
     name stays as long as it fits (it only ellipsizes as a last resort). */
  @media (max-width: 520px) {
    .sb-xtra {
      display: none;
    }
  }

  .sb-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--kt-accent);
    }
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

/* ── Version easter-egg trigger + toast ── */
.kt-ver {
  cursor: pointer;
  transition: color 0.15s;
}
.kt-ver:hover {
  color: var(--kt-accent, #35a854);
}

.kt-egg-toast {
  position: fixed;
  left: 50%;
  bottom: 42px;
  transform: translateX(-50%);
  background: var(--kt-modal, #141414);
  color: #e8e8e8;
  border: 1px solid var(--kt-accent, #35a854);
  border-radius: 8px;
  padding: 11px 20px;
  font-family: Consolas, monospace;
  font-size: 13px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  z-index: 301;
  pointer-events: none;
}
html:not(.dark) .kt-egg-toast {
  background: #eaeaea;
  color: #1a1a1a;
}

.kt-egg-fade-enter-active,
.kt-egg-fade-leave-active {
  transition: opacity 0.3s;
}
.kt-egg-fade-enter-from,
.kt-egg-fade-leave-to {
  opacity: 0;
}
</style>

<!-- Global (unscoped): drips are appended to <body>, so their styles and the
     keyframes must not be scoped to this component -->
<style>
.kt-drip {
  position: fixed;
  top: -60px;
  width: 6px;
  border-radius: 0 0 3px 3px;
  background: #df1d1d;
  z-index: 300;
  pointer-events: none;
}
@keyframes kt-dripfall {
  to {
    transform: translateY(112vh);
  }
}
</style>
