<script setup lang="ts">
import { darkTheme, NGlobalStyle, NMessageProvider, NNotificationProvider } from 'naive-ui';
import { RouterView, useRoute } from 'vue-router';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';
import { buildOverridesFor } from './themes';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => buildOverridesFor(styleStore.ktTheme, styleStore.ktAccent));

const { locale } = useI18n({ useScope: 'global' });

syncRef(
  locale,
  useStorage('locale', locale),
  { direction: 'ltr' },
);
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
  background: #b8b8b8;
}

html.dark body {
  background: var(--kt-bg, #1c1c1c);
}

/* Family typewriter font, global (card headings, killer-font accents) */
@font-face {
  font-family: 'KillerScan';
  src: url('/brand/KillerScan.ttf') format('truetype');
  font-display: swap;
}

/* ── Theme engine CSS variables (six families, ported from the landing pages).
   The chrome vars drive the frame rails (titlebar, sidebar, statusbar); bg
   drives the content pane. data-kt-theme is set by the style store. ── */
html[data-kt-theme='black']    { --kt-bg: #0d0d0d; --kt-chrome: #000000; --kt-chrome-border: #1f1f1f; --kt-panel: #141414; --kt-modal: #000000; --kt-accent: #0AFFE7; --kt-accent-2: #08CCB9; --kt-accent-sel: #003832; --kt-accent-rgb: 10, 255, 231; --kt-rail-text: #888888; --kt-grain-img: url('/grain-a12.png'); }
html[data-kt-theme='dark']     { --kt-bg: #333333; --kt-chrome: #1c1c1c; --kt-chrome-border: #2e2e2e; --kt-panel: #3a3a3a; --kt-modal: #1e1e1e; --kt-accent: #50AEE8; --kt-accent-2: #3E93C9; --kt-accent-sel: #1C3B5E; --kt-accent-rgb: 80, 174, 232; --kt-rail-text: #9a9a9a; --kt-grain-img: url('/grain-a24.png'); }
html[data-kt-theme='light']    { --kt-bg: #b8b8b8; --kt-chrome: #c8c8c8; --kt-chrome-border: #b0b0b0; --kt-panel: #d8d8d8; --kt-modal: #ffffff; --kt-accent: #18608E; --kt-accent-2: #124C73; --kt-accent-sel: #18608E; --kt-accent-rgb: 24, 96, 142; --kt-rail-text: #555555; --kt-grain-img: url('/grain-a34.png'); }
html[data-kt-theme='blood']    { --kt-bg: #4a1f20; --kt-chrome: #1e0a0b; --kt-chrome-border: #3a1a1d; --kt-panel: #321416; --kt-modal: #1e0a0b; --kt-accent: #ffffff; --kt-accent-2: #f8c99e; --kt-accent-sel: rgba(255, 255, 255, 0.27); --kt-accent-rgb: 255, 255, 255; --kt-rail-text: #b09e9c; --kt-grain-img: url('/grain-a34.png'); }
html[data-kt-theme='greed']    { --kt-bg: #0a5234; --kt-chrome: #001e13; --kt-chrome-border: #07371f; --kt-panel: #003824; --kt-modal: #001e13; --kt-accent: #e6b800; --kt-accent-2: #C19B00; --kt-accent-sel: rgba(255, 255, 255, 0.27); --kt-accent-rgb: 230, 184, 0; --kt-rail-text: #a6a99a; --kt-grain-img: url('/grain-a32.png'); }
html[data-kt-theme='cyanotic'] { --kt-bg: #0a4a6e; --kt-chrome: #001a28; --kt-chrome-border: #093250; --kt-panel: #002e48; --kt-modal: #001624; --kt-accent: #ffffff; --kt-accent-2: #e0d49a; --kt-accent-sel: rgba(255, 255, 255, 0.27); --kt-accent-rgb: 255, 255, 255; --kt-rail-text: #9ba3ac; --kt-grain-img: url('/grain-a32.png'); }

/* Grain boost overlay removed — n-layout already carries grain background.
   The overlay was at z-index 99999 and rendered over n-select input boxes,
   causing visible stripe artifacts on custom UI components. */

html {
  height: 100%;
  margin: 0;
  padding: 0;
  /* no scrollbar-gutter: the frame is a fixed 100vh column that never scrolls;
     a reserved root gutter just paints a body-colored stripe on the right */
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

/* ── Tool header: explicit dark colors for light mode — opacity alone is not enough ── */
html:not(.dark) .tool-title-compact  { color: var(--kt-accent) !important; opacity: 1 !important; }
html:not(.dark) .tool-desc-compact   { color: rgba(0, 0, 0, 0.75) !important; opacity: 1 !important; }
html:not(.dark) .tool-layout .n-h1   { color: rgba(0, 0, 0, 0.92) !important; opacity: 1 !important; }
html:not(.dark) .tool-layout .description { color: rgba(0, 0, 0, 0.75) !important; opacity: 1 !important; }
html:not(.dark) .tool-header-link          { color: rgba(0, 0, 0, 0.60) !important; opacity: 1 !important; }
html:not(.dark) .tool-header-link:hover    { color: rgba(0, 0, 0, 0.88) !important; }

/* ── Page fade: every route change fades like the app windows ── */
.page-fade-enter-active {
  transition: opacity 0.2s ease;
}
.page-fade-leave-active {
  transition: opacity 0.12s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* ── Sidebar: NaiveUI menu injects its own background — force transparent so sider color shows ── */
.n-menu { background-color: transparent !important; }

/* ── Titlebar search: solid panel tone so the chrome grain does not show
   through the translucent button background ── */
.kt-titlebar-shell .palette-wrap .c-button {
  background-color: var(--kt-panel, #141414) !important;
}

/* ── Sidebar: chrome tone + family grain at the app's per-theme opacity ── */
#kt-sider {
  background: var(--kt-chrome, #000000) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
}

/* ── Body: grain texture in light mode ── */
html:not(.dark) body {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.10'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}

/* ── Sidebar: clear child element backgrounds so sider color shows through ── */
#kt-sider .n-scrollbar,
#kt-sider .n-scrollbar-container,
#kt-sider .n-scrollbar-content,
#kt-sider .n-layout-sider-scroll-container {
  background: transparent !important;
  background-color: transparent !important;
}

/* ── Sidebar: active — inset pill style (selected only, not hover) ── */
.dark .n-menu-item-content--selected,
.dark .n-menu-item-content--selected:hover {
  border-radius: 6px !important;
  margin: 0 8px !important;
  width: calc(100% - 16px) !important;
}

/* ── Global pill button ─────────────────────────────────────────────── */
.kt-pill-row {
  display: flex;
  align-items: center;
  border: 1px solid rgba(var(--kt-accent-rgb),0.3);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.35);
  width: fit-content;
}

.kt-pill {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 5px 14px;
  border-radius: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
  font-family: inherit;
}

.kt-pill:hover {
  background: rgba(var(--kt-accent-rgb),0.1);
  color: var(--kt-accent);
}

.kt-pill-active {
  background: rgba(var(--kt-accent-rgb),0.18) !important;
  color: var(--kt-accent) !important;
}

.kt-pill:disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

/* On narrow screens, break connected pill rows into individually-bordered pills */
@media (max-width: 640px) {
  .kt-pill-row,
  html:not(.dark) .kt-pill-row {
    flex-wrap: wrap;
    overflow: visible;
    border: none !important;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none !important;
    gap: 4px;
    flex-shrink: 1;
  }

  .kt-pill-row .kt-pill,
  html:not(.dark) .kt-pill-row .kt-pill {
    border: 1px solid rgba(var(--kt-accent-rgb),0.3) !important;
    border-radius: 5px !important;
  }

  .kt-pill-row .kt-pill-active,
  html:not(.dark) .kt-pill-row .kt-pill-active {
    border-color: var(--kt-accent) !important;
  }
}

/* ── Global tags / badges ───────────────────────────────────────────── */
.kt-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
  border: 1px solid;
  white-space: nowrap;
  line-height: 1.7;
  vertical-align: middle;
}

.kt-tag-default {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.5);
}

.kt-tag-success {
  background: rgba(var(--kt-accent-rgb),0.12);
  border-color: rgba(var(--kt-accent-rgb),0.45);
  color: #4dd07a;
}

.kt-tag-warning {
  background: rgba(200, 140, 0, 0.1);
  border-color: rgba(200, 140, 0, 0.45);
  color: rgba(255, 195, 55, 0.9);
}

.kt-tag-error {
  background: rgba(200, 50, 50, 0.1);
  border-color: rgba(200, 50, 50, 0.45);
  color: rgba(255, 110, 110, 0.9);
}

.kt-tag-info {
  background: rgba(60, 140, 210, 0.1);
  border-color: rgba(60, 140, 210, 0.45);
  color: rgba(110, 185, 255, 0.9);
}

.kt-tag-primary {
  background: rgba(var(--kt-accent-rgb),0.12);
  border-color: rgba(var(--kt-accent-rgb),0.45);
  color: var(--kt-accent);
}

/* ── Global alerts ──────────────────────────────────────────────────── */
.kt-alert {
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.82rem;
  line-height: 1.5;
}

.kt-alert-info {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(var(--kt-accent-rgb),0.4);
  color: rgba(255, 255, 255, 0.65);
}

.kt-alert-warning {
  background: rgba(200, 140, 0, 0.1);
  border: 1px solid rgba(200, 140, 0, 0.45);
  color: rgba(255, 200, 60, 0.9);
}

.kt-alert-error {
  background: rgba(200, 50, 50, 0.1);
  border: 1px solid rgba(200, 50, 50, 0.45);
  color: rgba(255, 110, 110, 0.9);
}

.kt-alert-success {
  background: rgba(var(--kt-accent-rgb),0.12);
  border: 1px solid rgba(var(--kt-accent-rgb),0.5);
  color: #4dd07a;
}

.kt-alert-title {
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.kt-alert-close {
  float: right;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 1rem;
  line-height: 1;
  padding: 0 0 0 8px;
}
.kt-alert-close:hover { opacity: 1; }

/* ── Global section label ───────────────────────────────────────────── */
.kt-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

/* ── Global divider ─────────────────────────────────────────────────── */
.kt-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 12px 0;
}

html:not(.dark) .kt-divider {
  background: rgba(0, 0, 0, 0.1);
}

/* Terminal-style section labels: white text is invisible on light backgrounds.
   All terminal tools use a single class ending in "-section-label" with no
   other classes on the same element, so [class$=] is safe here. */
html:not(.dark) [class$="-section-label"] {
  color: rgba(0, 0, 0, 0.45) !important;
}

/* ── General light mode: opacity-based text is unreadable on gray ── */

/* UnoCSS op-* — opacity: N% kills contrast on gray surfaces */
html:not(.dark) .op-80,
html:not(.dark) .op-70,
html:not(.dark) .op-60,
html:not(.dark) .op-50,
html:not(.dark) .op-45,
html:not(.dark) .op-35 {
  opacity: 1 !important;
  color: #485060 !important;
}

/* Tailwind / UnoCSS neutral text utilities */
html:not(.dark) .text-neutral-400,
html:not(.dark) .text-neutral-500,
html:not(.dark) .text-gray-400,
html:not(.dark) .text-gray-500 {
  color: #485060 !important;
}

/* KillerPDF feature card descriptions */
html:not(.dark) .feature-desc {
  color: #2e3440 !important;
}

/* Group Policy Reference: cyan registry keys invisible on light */
.gpr-registry-key {
  color: cyan;
}
html:not(.dark) .gpr-registry-key {
  color: #007a8a !important;
}

/* ── Terminal output blocks: always dark regardless of theme ── */
/* Outer containers */
.command-block,
.record-box,
.cron-terminal,
.mac-terminal,
.case-terminal,
.terminal-block,
.hero-terminal {
  background: #1a1a1a !important;
  border-color: rgba(var(--kt-accent-rgb),0.3) !important;
}

/* Terminal row items — force solid dark so green text is always readable */
.dt-row,
.hash-row,
.ip-row,
.base-row,
.range-row,
.ula-row,
.color-row,
.mac-line {
  background: #222222 !important;
  border-color: rgba(var(--kt-accent-rgb),0.25) !important;
}

/* ── Date-Time Converter ── */
html:not(.dark) .dt-fmt-btn {
  background: #f0f0f0 !important;
  border-color: rgba(var(--kt-accent-rgb),0.35) !important;
  color: rgba(0, 0, 0, 0.75) !important;
}
html:not(.dark) .dt-fmt-btn:hover,
html:not(.dark) .dt-fmt-btn-open {
  border-color: rgba(var(--kt-accent-rgb),0.60) !important;
  color: #083d1a !important;
}
html:not(.dark) .dt-fmt-caret { color: rgba(var(--kt-accent-rgb),0.55) !important; }
html:not(.dark) .dt-fmt-menu {
  background: #e8e8e8 !important;
  border-color: rgba(var(--kt-accent-rgb),0.40) !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
}
html:not(.dark) .dt-fmt-option { color: rgba(0, 0, 0, 0.65) !important; }
html:not(.dark) .dt-fmt-option:hover { background: rgba(var(--kt-accent-rgb),0.10) !important; color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .dt-fmt-option-active { color: #0b5c28 !important; background: rgba(var(--kt-accent-rgb),0.12) !important; }

/* Subnet calculator: data table, not a terminal — light mode border fix */
html:not(.dark) .subnet-results {
  border-color: rgba(0,0,0,0.15) !important;
}
html:not(.dark) .subnet-row {
  border-bottom-color: rgba(0,0,0,0.08) !important;
  background: transparent !important;
}

/* Keep green text inside terminal blocks at full brightness */
.ps-command-text,
.record-text {
  color: var(--kt-accent) !important;
}

/* ── Powershell-builder light mode ── */

/* Sidebar toggle */
html:not(.dark) .cs-toggle {
  background: rgba(0,0,0,0.05) !important;
  border-color: rgba(0,0,0,0.15) !important;
  color: rgba(0,0,0,0.55) !important;
}
html:not(.dark) .cs-toggle:not(.cs-toggle-open) {
  background: rgba(var(--kt-accent-rgb),0.10) !important;
  border-color: rgba(var(--kt-accent-rgb),0.40) !important;
  color: #083d1a !important;
}

/* Category filter pills */
html:not(.dark) .cat-pill {
  border-color: rgba(0,0,0,0.2) !important;
  background: rgba(0,0,0,0.07) !important;
  color: rgba(0,0,0,0.7) !important;
}
html:not(.dark) .cat-pill-active {
  background: rgba(var(--kt-accent-rgb),0.15) !important;
  border-color: rgba(var(--kt-accent-rgb),0.6) !important;
  color: var(--kt-accent) !important;
}

/* Preset quick-select chips */
html:not(.dark) .preset-chip {
  border-color: rgba(0,0,0,0.2) !important;
  background: rgba(0,0,0,0.07) !important;
  color: rgba(0,0,0,0.7) !important;
}
html:not(.dark) .preset-chip-active {
  background: rgba(var(--kt-accent-rgb),0.15) !important;
  border-color: var(--kt-accent) !important;
  color: var(--kt-accent) !important;
}

/* Snippet / example rows */
html:not(.dark) .snippet-row {
  background: rgba(0,0,0,0.06) !important;
  border-color: rgba(0,0,0,0.12) !important;
}

/* Module badge and strikethrough badge */
html:not(.dark) .badge.module {
  background: rgba(0,0,0,0.1) !important;
  color: rgba(0,0,0,0.65) !important;
  opacity: 1 !important;
}
html:not(.dark) .badge.ps-no {
  background: rgba(0,0,0,0.06) !important;
  opacity: 0.6 !important;
}

/* Cmdlet row hover + module badge */
html:not(.dark) .cmdlet-row:hover {
  background: rgba(0,0,0,0.07) !important;
  border-color: rgba(0,0,0,0.14) !important;
}
html:not(.dark) .cmdlet-row-badge {
  background: rgba(0,0,0,0.1) !important;
  color: rgba(0,0,0,0.6) !important;
}

/* Cmdlet description text — opacity:0.5 on dark bg = invisible on light */
html:not(.dark) .cmdlet-row-desc {
  opacity: 1 !important;
  color: #3a3f45 !important;
}
html:not(.dark) .cmdlet-empty {
  opacity: 1 !important;
  color: #666 !important;
}

/* Notes strip — warm amber is washed out on gray */
html:not(.dark) .notes-strip {
  color: #8a5a00 !important;
  border-color: rgba(180, 120, 0, 0.6) !important;
  background: rgba(180,120,0,0.08) !important;
}

/* Inline-opacity muted text — opacity on dark bg; solid color on light */
html:not(.dark) .ps-muted {
  opacity: 1 !important;
  color: #4a5058 !important;
}
html:not(.dark) .ps-section-label {
  opacity: 1 !important;
  color: #5a6370 !important;
}

/* ══════════════════════════════════════════════════════════════
   LIGHT MODE — kt-pill, kt-tag, kt-alert, kt-section-label
   ══════════════════════════════════════════════════════════════ */

html:not(.dark) .kt-pill-row {
  border-color: rgba(var(--kt-accent-rgb),0.30) !important;
  background: rgba(0, 0, 0, 0.04) !important;
}

@media (max-width: 640px) {
  html:not(.dark) .kt-pill-row {
    background: transparent !important;
    border: none !important;
  }
}
html:not(.dark) .kt-pill {
  border-right-color: rgba(0, 0, 0, 0.12) !important;
  color: rgba(0, 0, 0, 0.55) !important;
}
/* Standalone pill (not in a row) — needs its own visible border */
html:not(.dark) .kt-pill:not(.kt-pill-row .kt-pill) {
  border: 1px solid rgba(var(--kt-accent-rgb),0.40) !important;
  border-radius: 5px !important;
  background: rgba(var(--kt-accent-rgb),0.06) !important;
}
html:not(.dark) .kt-pill-active:not(.kt-pill-row .kt-pill-active) {
  border-color: rgba(var(--kt-accent-rgb),0.65) !important;
  background: rgba(var(--kt-accent-rgb),0.15) !important;
}
html:not(.dark) .kt-pill:hover {
  background: rgba(var(--kt-accent-rgb),0.10) !important;
  color: var(--kt-accent) !important;
}
html:not(.dark) .kt-pill-active {
  background: rgba(var(--kt-accent-rgb),0.15) !important;
  color: var(--kt-accent-2) !important;
}

html:not(.dark) .kt-tag-default {
  background:   rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.15);
  color:        rgba(0, 0, 0, 0.50);
}
html:not(.dark) .kt-tag-success { color: var(--kt-accent); }
html:not(.dark) .kt-tag-warning { color: #92600a; }
html:not(.dark) .kt-tag-error   { color: #b91c1c; }
html:not(.dark) .kt-tag-info    { color: #1d5fa8; }

html:not(.dark) .kt-section-label { color: rgba(0, 0, 0, 0.45); }

html:not(.dark) .kt-alert-info {
  color: rgba(0, 0, 0, 0.65);
  background: rgba(var(--kt-accent-rgb),0.08);
}

/* ══════════════════════════════════════════════════════════════
   LIGHT MODE — Tool-specific terminal card text
   html:not(.dark) prefix gives (0,2,1) specificity, beating
   scoped [data-v-xxx].class (0,2,0).
   ══════════════════════════════════════════════════════════════ */

/* ── Domain Lookup ── */
html:not(.dark) .whois-terminal-title { color: #0b5c28 !important; }
html:not(.dark) .whois-prompt       { color: rgba(var(--kt-accent-rgb),0.55) !important; }
html:not(.dark) .whois-label        { color: rgba(0, 0, 0, 0.50) !important; }
html:not(.dark) .whois-body-text    { color: rgba(0, 0, 0, 0.55) !important; }
html:not(.dark) .whois-record-block { color: rgba(0, 0, 0, 0.75) !important; }
html:not(.dark) .whois-record-row .whois-value { color: rgba(0, 0, 0, 0.75) !important; }
html:not(.dark) .whois-status-desc  { color: rgba(0, 0, 0, 0.40) !important; }
html:not(.dark) .whois-contact-role { color: rgba(0, 0, 0, 0.35) !important; background: rgba(0,0,0,0.03) !important; }
html:not(.dark) .whois-remark-title { color: rgba(0, 0, 0, 0.50) !important; }
html:not(.dark) .whois-remark-line  { color: rgba(0, 0, 0, 0.40) !important; }

/* ── Exchange NDR Lookup ── */
html:not(.dark) .ndr-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .ndr-description    { color: rgba(0, 0, 0, 0.60) !important; }
html:not(.dark) .ndr-kv-label       { color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .ndr-kv-value       { color: rgba(0, 0, 0, 0.75) !important; }
html:not(.dark) .ndr-kv-fix         { color: var(--kt-accent) !important; }
html:not(.dark) .ndr-kv-block       { border-color: rgba(0, 0, 0, 0.10) !important; }
html:not(.dark) .ndr-sev-default    { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.12) !important; }
html:not(.dark) .ndr-sev-error      { color: #b91c1c !important; }

/* ── Category headers (between card groups) — all tools ── */
html:not(.dark) .ndr-category-header,
html:not(.dark) .hsc-category-header,
html:not(.dark) .wec-category-header,
html:not(.dark) .wel-category-header,
html:not(.dark) .sku-category-header { color: #0b5c28 !important; border-bottom-color: rgba(11, 92, 40, 0.25) !important; }

/* ── Group Policy Reference ── */
html:not(.dark) .gpr-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .gpr-path           { color: rgba(0, 0, 0, 0.60) !important; }
html:not(.dark) .gpr-kv-label       { color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .gpr-kv-value       { color: rgba(0, 0, 0, 0.80) !important; }
html:not(.dark) .gpr-kv-block       { border-color: rgba(0, 0, 0, 0.10) !important; }
html:not(.dark) .gpr-registry       { color: #007a8a !important; background: rgba(0,122,138,0.06) !important; border-color: rgba(0,122,138,0.25) !important; }
html:not(.dark) .gpr-sev-default    { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.12) !important; }
html:not(.dark) .gpr-sev-error      { color: #b91c1c !important; }

/* ── Windows Event Lookup ── */
html:not(.dark) .wel-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .wel-desc           { color: rgba(0, 0, 0, 0.58) !important; border-top-color: rgba(0,0,0,0.08) !important; }

/* ── Windows Error Codes ── */
html:not(.dark) .wec-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .wec-decimal        { color: rgba(0, 0, 0, 0.40) !important; }
html:not(.dark) .wec-desc           { color: rgba(0, 0, 0, 0.58) !important; border-top-color: rgba(0,0,0,0.08) !important; }
html:not(.dark) .wec-sev-default    { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.12) !important; }
html:not(.dark) .wec-sev-error      { color: #b91c1c !important; }

/* ── HTTP Status Codes ── */
html:not(.dark) .hsc-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .hsc-desc           { color: rgba(0, 0, 0, 0.58) !important; border-top-color: rgba(0,0,0,0.08) !important; }

/* ── Port Protocol Reference ── */
html:not(.dark) .ppr-seg-btn        { color: rgba(0, 0, 0, 0.55) !important; }
html:not(.dark) .ppr-seg-btn:hover  { color: rgba(0, 0, 0, 0.80) !important; background: rgba(var(--kt-accent-rgb),0.08) !important; }
html:not(.dark) .ppr-category       { color: rgba(0, 0, 0, 0.38) !important; }
html:not(.dark) .ppr-service        { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .ppr-desc           { color: rgba(0, 0, 0, 0.58) !important; border-top-color: rgba(0,0,0,0.08) !important; }
html:not(.dark) .ppr-proto-both     { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.12) !important; }
/* Dangerous button stays amber in both modes — override the systemic green btn rule */
html:not(.dark) .ppr-dangerous-btn              { color: rgba(180, 130, 0, 0.75) !important; border-color: rgba(234, 179, 8, 0.35) !important; }
html:not(.dark) .ppr-dangerous-btn:hover        { color: #b45309 !important; border-color: rgba(234, 179, 8, 0.55) !important; background: rgba(234, 179, 8, 0.08) !important; }
html:not(.dark) .ppr-dangerous-btn-active       { color: #b45309 !important; border-color: rgba(234, 179, 8, 0.65) !important; background: rgba(234, 179, 8, 0.14) !important; }
.ppr-dangerous-btn                              { color: rgba(234, 179, 8, 0.65) !important; border-color: rgba(234, 179, 8, 0.30) !important; }
.ppr-dangerous-btn:hover                        { color: #ca8a04 !important; border-color: rgba(234, 179, 8, 0.55) !important; background: rgba(234, 179, 8, 0.08) !important; }
.ppr-dangerous-btn-active                       { color: #ca8a04 !important; border-color: rgba(234, 179, 8, 0.65) !important; background: rgba(234, 179, 8, 0.14) !important; }

/* ── M365 SKU Decoder ── */
html:not(.dark) .sku-name           { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .sku-desc           { color: rgba(0, 0, 0, 0.55) !important; }
html:not(.dark) .sku-tier-default   { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.12) !important; }

/* ── Killer Scripts ── */
html:not(.dark) .ks-info            { background: rgba(180, 145, 0, 0.10) !important; border-color: rgba(100, 78, 0, 0.75) !important; color: rgba(0, 0, 0, 0.72) !important; }
html:not(.dark) .ks-info-cmd        { color: var(--kt-accent) !important; }
html:not(.dark) .ks-info-dl         { color: rgba(0, 0, 0, 0.55) !important; }
html:not(.dark) .ks-name            { color: rgba(0, 0, 0, 0.88) !important; }
html:not(.dark) .ks-desc            { color: rgba(0, 0, 0, 0.60) !important; }
html:not(.dark) .ks-btn-dl          { color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .ks-btn-dl:hover    { background: rgba(0,0,0,0.06) !important; color: rgba(0,0,0,0.70) !important; }

/* ── c-input-text (NaiveUI wrapper) — global light mode fix ── */
html:not(.dark) .c-input-text .input-wrapper         { background-color: #f0f0f0 !important; border-color: rgba(0, 0, 0, 0.20) !important; box-shadow: none !important; }
html:not(.dark) .c-input-text .input-wrapper:hover   { border-color: rgba(var(--kt-accent-rgb),0.45) !important; }
html:not(.dark) .c-input-text .input-wrapper:focus-within { border-color: rgba(var(--kt-accent-rgb),0.70) !important; box-shadow: none !important; }

/* ── PowerShell Builder ── */
html:not(.dark) .ps-panel-title      { color: var(--kt-accent) !important; }
html:not(.dark) .ps-panel-body       { color: rgba(0, 0, 0, 0.80) !important; }
html:not(.dark) .command-block       { background: #c8c8c8 !important; border-color: rgba(var(--kt-accent-rgb),0.25) !important; }
html:not(.dark) .notes-strip         { color: rgba(0, 0, 0, 0.72) !important; }
html:not(.dark) .badge.module        { color: rgba(0, 0, 0, 0.55) !important; opacity: 1 !important; }
html:not(.dark) .badge.ps-no         { opacity: 0.5 !important; }
/* Input inside ps-panel-body — slightly darker bg to distinguish from page */
html:not(.dark) .ps-panel-body .c-input-text .input-wrapper         { background-color: #d0d0d0 !important; border-color: rgba(var(--kt-accent-rgb),0.30) !important; }
html:not(.dark) .ps-panel-body .c-input-text .input-wrapper:hover   { border-color: rgba(var(--kt-accent-rgb),0.55) !important; }
html:not(.dark) .ps-panel-body .c-input-text .input-wrapper:focus-within { background-color: #cccccc !important; border-color: rgba(var(--kt-accent-rgb),0.70) !important; }

/* ── CVE Lookup — custom dropdowns ── */
html:not(.dark) .cv-trigger         { background: #c8c8c8 !important; border-color: rgba(var(--kt-accent-rgb),0.30) !important; color: rgba(0, 0, 0, 0.80) !important; }
html:not(.dark) .cv-trigger:hover,
html:not(.dark) .cv-dropdown:focus-within .cv-trigger { border-color: rgba(var(--kt-accent-rgb),0.65) !important; }
html:not(.dark) .cv-placeholder     { color: rgba(0, 0, 0, 0.35) !important; }
html:not(.dark) .cv-chevron         { color: rgba(var(--kt-accent-rgb),0.70) !important; }
html:not(.dark) .cv-clear           { color: rgba(0, 0, 0, 0.35) !important; }
html:not(.dark) .cv-clear:hover     { color: rgba(0, 0, 0, 0.65) !important; }
html:not(.dark) .cv-menu            { background: #d0d0d0 !important; border-color: rgba(var(--kt-accent-rgb),0.35) !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important; }
html:not(.dark) .cv-item            { color: rgba(0, 0, 0, 0.65) !important; border-bottom-color: rgba(0, 0, 0, 0.07) !important; }
html:not(.dark) .cv-item:hover      { background: rgba(var(--kt-accent-rgb),0.10) !important; color: rgba(0, 0, 0, 0.90) !important; }
html:not(.dark) .cv-item-active     { color: var(--kt-accent) !important; background: rgba(var(--kt-accent-rgb),0.10) !important; }

/* ── CVE Lookup ── */
html:not(.dark) .cve-card-id        { color: var(--kt-accent) !important; }
html:not(.dark) .cve-bar-title      { color: rgba(0, 0, 0, 0.38) !important; }
html:not(.dark) .cve-meta-label     { color: rgba(0, 0, 0, 0.50) !important; }
html:not(.dark) .cve-meta-val       { color: rgba(0, 0, 0, 0.80) !important; }
html:not(.dark) .cve-meta-sep       { color: rgba(0, 0, 0, 0.25) !important; }
html:not(.dark) .cve-desc           { color: rgba(0, 0, 0, 0.85) !important; }
html:not(.dark) .cve-section-label  { color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .cve-metric-label   { color: rgba(0, 0, 0, 0.50) !important; }
html:not(.dark) .cve-score-default  { color: rgba(0,0,0,0.50) !important; border-color: rgba(0,0,0,0.15) !important; }
html:not(.dark) .cve-dot-default    { background: rgba(0,0,0,0.20) !important; }

/* ══════════════════════════════════════════════════════════════
   MOBILE — Card grids: minmax(420px) overflows narrow viewports.
   !important beats non-!important scoped grid-template-columns.
   ══════════════════════════════════════════════════════════════ */
@media (max-width: 520px) {
  .ndr-grid,
  .gpr-grid,
  .wec-grid,
  .hsc-grid {
    grid-template-columns: 1fr !important;
  }
}

/* ── Killer App landing pages (KillerPDF, KillerFind, KillerScan) ── */
html:not(.dark) .kapp-subtitle  { color: rgba(0, 0, 0, 0.55) !important; }
html:not(.dark) .kapp-sha256    { color: rgba(0, 0, 0, 0.50) !important; }
html:not(.dark) .kapp-version   { background: #d0d0d0 !important; border-color: rgba(var(--kt-accent-rgb),0.35) !important; }
html:not(.dark) .kapp-gh-link   { background: #d8d8d8 !important; color: rgba(0, 0, 0, 0.75) !important; }

/* ── Email Record Generator ── */
html:not(.dark) .erg-tab         { background: rgba(0, 0, 0, 0.08) !important; border-color: rgba(0, 0, 0, 0.18) !important; color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .erg-tab:hover   { background: rgba(0, 0, 0, 0.12) !important; border-color: rgba(var(--kt-accent-rgb),0.40) !important; color: rgba(0, 0, 0, 0.70) !important; }
html:not(.dark) .erg-tab-active  { background: rgba(var(--kt-accent-rgb),0.18) !important; border-color: rgba(var(--kt-accent-rgb),0.65) !important; }
html:not(.dark) .erg-pill        { border-color: rgba(var(--kt-accent-rgb),0.20) !important; background: rgba(var(--kt-accent-rgb),0.04) !important; }
html:not(.dark) .erg-pill:hover  { color: #0b5c28 !important; border-color: rgba(var(--kt-accent-rgb),0.45) !important; background: rgba(var(--kt-accent-rgb),0.10) !important; }
html:not(.dark) .erg-pill-active { background: rgba(var(--kt-accent-rgb),0.16) !important; border-color: rgba(var(--kt-accent-rgb),0.55) !important; }
/* Record output text — should be dark green, not gray */
html:not(.dark) .erg-record-text  { color: #0b5c28 !important; }
html:not(.dark) .erg-record-label { color: rgba(var(--kt-accent-rgb),0.65) !important; }
html:not(.dark) .erg-copy-hint    { color: rgba(var(--kt-accent-rgb),0.55) !important; }
html:not(.dark) .erg-dd-caret     { color: rgba(var(--kt-accent-rgb),0.70) !important; }
html:not(.dark) .erg-slider-hint  { color: rgba(0, 0, 0, 0.40) !important; }
html:not(.dark) .erg-input::placeholder { color: rgba(0, 0, 0, 0.28) !important; }
html:not(.dark) .erg-warn         { color: #92600a !important; }

/* ── Meta Tag Generator — syntax highlight in light mode ── */
html:not(.dark) .mg-pre           { color: rgba(0, 0, 0, 0.75) !important; }
html:not(.dark) .hl-comment       { color: rgba(0, 0, 0, 0.38) !important; font-style: italic; }
html:not(.dark) .hl-tag           { color: rgba(0, 0, 0, 0.60) !important; }
html:not(.dark) .hl-attr          { color: #92600a !important; }
html:not(.dark) .hl-value         { color: var(--kt-accent) !important; }

/* ── Email Header Parser — classes not caught by the broad *-terminal rule ── */
/* .ehp-auth-entry has its own #0a0a0c !important bg — needs explicit override */
html:not(.dark) .ehp-auth-entry     { background: var(--kt-term-bg) !important; }
html:not(.dark) .ehp-auth-grid      { background: rgba(var(--kt-accent-rgb),0.10) !important; }
/* Green accent elements inside terminals need !important to survive the broad * rule */
html:not(.dark) .ehp-hop-key        { color: var(--kt-accent) !important; }
html:not(.dark) .ehp-hop-num        { color: rgba(var(--kt-accent-rgb),0.70) !important; }
html:not(.dark) .ehp-section-header { color: #0b5c28 !important; }
/* Dim elements */
html:not(.dark) .ehp-hop-ip         { color: rgba(0, 0, 0, 0.45) !important; }
html:not(.dark) .ehp-hop-ts         { color: rgba(0, 0, 0, 0.42) !important; }
html:not(.dark) .ehp-hop-delay      { color: rgba(0, 0, 0, 0.38) !important; }
html:not(.dark) .ehp-auth-detail    { color: rgba(0, 0, 0, 0.70) !important; }

/* ─────────────────────────────────────────────────────────────────────────────
   Migrated from public/killer-tools-overrides.css
   ───────────────────────────────────────────────────────────────────────────── */

/* --- hide social links, buy me coffee, info button, toolbar circle buttons --- */
.support-button,
a[href*="twitter.com"],
.c-button.round.support-button,
.i-mdi-github,
.i-mdi-twitter,
.i-mdi-information-outline,
.i-mdi-information,
a.c-button.circle:not([aria-label="Toggle menu"]):not([aria-label="Toggle dark/light mode"]):not([aria-label="killer-tools GitHub repository"]):not([aria-label="About"]),
.c-button.circle:not([aria-label="Toggle menu"]):not([aria-label="Toggle dark/light mode"]):not([aria-label="killer-tools GitHub repository"]):not([aria-label="About"]) {
  display: none !important;
}

/* --- hide sidebar hero elements --- */
.hero-wrapper svg,
.hero-wrapper .title,
.hero-wrapper .subtitle,
.hero-wrapper .divider,
.hero-wrapper .text-wrapper,
.sider-content::before,
.n-layout-sider .n-scrollbar-rail {
  display: none !important;
}

/* --- sidebar layout ---
   (the old -170px pull-up compensated for the removed 160px hero padding;
   the Grunge logo block is normal flow now, so no offset games) */
.sider-content {
  margin-top: 0 !important;
  position: relative;
}

.sider-content > div > div:first-child {
  margin-top: 20px !important;
}

.logo-click-target {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 240px;
  height: 72px;
  z-index: 100;
  cursor: pointer;
}

/* Legacy .sider-logo sizing/margins removed: the Grunge wordmark block in
   base.layout.vue owns its own 57px chrome band now, and the light-mode
   brightness filter would wrongly dim the dedicated light wordmark PNG. */
.sider-logo {
  cursor: pointer;
}

.menu-wrapper {
  margin-bottom: 0 !important;
}

div:first-child > .menu-wrapper .n-menu-item-content {
  padding-left: 32px !important;
}

.n-layout-sider,
.sider-content {
  overflow-x: hidden !important;
}

body {
  overflow-x: hidden !important;
}

/* --- family grain (app recipe + per-theme GrainOpacity): content pane --- */
html.dark .n-layout {
  background-color: var(--kt-bg, #0d0d0d) !important;
  background-image: var(--kt-grain-img, url('/grain-a12.png')) !important;
  background-repeat: repeat !important;
  background-size: 256px 256px !important;
}

html:not(.dark) .n-layout {
  background-image: var(--kt-grain-img, url('/grain-a34.png')) !important;
  background-repeat: repeat !important;
  background-size: 256px 256px !important;
}

html.dark .n-layout-scroll-container {
  background-color: transparent !important;
}

/* ── Gutter wrapper (content-col): paints CHROME, not the pane tone.
   Must out-specify `html.dark .n-layout` above, which was leaking the
   lighter pane color into the 8px gutter around the rounded pane ── */
html.dark .n-layout.content-col,
html:not(.dark) .n-layout.content-col {
  background: var(--kt-chrome, #000000) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
}

/* --- code output wrap --- */
.n-code pre,
.n-code code {
  white-space: pre-wrap !important;
  word-break: break-all;
}

/* --- restore wysiwyg editor toolbar buttons --- */
.editor-header .c-button.circle {
  display: inline-flex !important;
}

/* --- mobile fixes --- */
@media (max-width: 768px) {
  pre {
    max-width: 100%;
    overflow-x: auto !important;
    box-sizing: border-box;
  }

  .n-card,
  .c-card {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .n-input__textarea-el,
  .n-input__input-el {
    word-break: break-all;
    overflow-wrap: break-word;
  }

  .editor-header {
    flex-wrap: wrap;
  }
}

/* --- global scrollbar ---
   webkit-only: setting the standard scrollbar-width/scrollbar-color props
   makes Chromium IGNORE the ::-webkit rules and draw native arrows */

::-webkit-scrollbar { width: 4px; height: 4px; }
/* No arrow buttons on any scrollbar (family standard) */
::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(var(--kt-accent-rgb), 0.33); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--kt-accent); }

.n-input .n-input__textarea-el::-webkit-scrollbar,
.n-input .n-input__input-el::-webkit-scrollbar,
.n-scrollbar-rail::-webkit-scrollbar { width: 4px; }

.n-input .n-input__textarea-el::-webkit-scrollbar-thumb,
.n-scrollbar-rail::-webkit-scrollbar-thumb { background: rgba(var(--kt-accent-rgb), 0.33); border-radius: 4px; }

.custom-sidebar-scroll {
  display: block;
  position: relative;
}

.custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
.custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(var(--kt-accent-rgb), 0.33); border-radius: 4px; }
.custom-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: var(--kt-accent); }

/* --- dark mode: increase text contrast --- */
html.dark .truncat { color: rgba(255, 255, 255, 0.88) !important; }

html.dark .c-card .line-clamp-2,
html.dark .n-card .line-clamp-2 { color: rgba(255, 255, 255, 0.50) !important; }

html.dark h3.text-neutral-400,
html.dark .text-neutral-400 { color: rgba(255, 255, 255, 0.60) !important; }

html.dark .n-input__input-el { color: rgba(255, 255, 255, 0.75) !important; }
html.dark .n-input__input-el::placeholder { color: rgba(255, 255, 255, 0.35) !important; }
html.dark .n-input .n-input__prefix,
html.dark .n-input .n-base-icon { color: rgba(255, 255, 255, 0.45) !important; }

/* --- card title: green on hover --- */
.c-card .truncat { transition: color 0.18s ease; }
html.dark .c-card:hover .truncat { color: var(--kt-accent) !important; }

/* --- dark mode: cards take the theme panel tone (was hardcoded #252525,
   fighting the naive Card override from themes.ts) --- */
html.dark .n-card,
html.dark .c-card { background-color: var(--kt-modal, #141414) !important; }

/* --- Home tool cards: landing info-card hover (lift + shadow + grain) --- */
.grid-wrapper .c-card {
  background-image: var(--kt-grain-img, url('/grain-a12.png')) !important;
  background-repeat: repeat !important;
  background-size: 256px 256px !important;
  transition: transform 0.12s, box-shadow 0.12s, border-color 0.5s !important;
}

.grid-wrapper a:hover .c-card {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.4);
}

html:not(.dark) .grid-wrapper a:hover .c-card {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
}

html.dark .n-layout-sider {
  background-color: var(--kt-chrome, #000000) !important;
  background-image: var(--kt-grain-img, url('/grain-a12.png')) !important;
  background-repeat: repeat !important;
  background-size: 256px 256px !important;
}

html.dark .sider-content { background-color: transparent !important; }

html.dark .n-menu-item-content--selected,
html.dark .n-menu-item-content--selected:hover {
  border-radius: 6px !important;
  margin: 0 8px !important;
  width: calc(100% - 16px) !important;
}

/* --- killer app landing pages --- */
html.dark .kapp-version {
  background: #1a1d22 !important;
  border-color: rgba(var(--kt-accent-rgb),0.25) !important;
}

html.dark .kapp-gh-link {
  background: #252525 !important;
  border-color: rgba(var(--kt-accent-rgb),0.5) !important;
  transition: background 0.15s, border-color 0.15s;
}

html.dark .kapp-gh-link:hover {
  background: #111111 !important;
  border-color: rgba(var(--kt-accent-rgb),0.9) !important;
}

html:not(.dark) .kapp-gh-link:hover {
  background: #c8c8c8 !important;
  border-color: rgba(var(--kt-accent-rgb),0.7) !important;
}

/* --- about page: dark mode contrast --- */
html.dark .app-desc,
html.dark .col-intro { color: rgba(255, 255, 255, 0.75) !important; }

html.dark .section-heading { color: rgba(255, 255, 255, 0.75) !important; }
html.dark .link-label { color: rgba(255, 255, 255, 0.65) !important; }

html.dark .killer-apps,
html.dark .links-bar,
html.dark .about-footer { color: rgba(255, 255, 255, 0.80) !important; }

/* --- tool header: unconstrain on desktop --- */
@media (min-width: 769px) {
  .tool-layout {
    max-width: none !important;
    padding: 0 32px;
  }
}

/* --- compact header visibility --- */
.tool-header-compact { opacity: 1 !important; }
/* (legacy 0.9rem/0.7-opacity title cap removed - the big killer-font page
   title is styled in tool.layout.vue) */
.tool-title-compact { opacity: 1 !important; }

/* --- hide compact header on KillerScan page --- */
body:has([href="/killer-scan"].router-link-active) .tool-header-compact { display: none !important; }

/* --- full-width tool overrides --- */
body:has([href="/killer-scan"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100%; }
body:has([href="/json-diff"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
body:has([href="/user-agent-parser"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
body:has([href="/url-parser"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
body:has([href="/otp-code-generator-and-validator"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
body:has([href="/ascii-word-art"].router-link-active) .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
</style>