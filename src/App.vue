<script setup lang="ts">
import { darkTheme, NGlobalStyle, NMessageProvider, NNotificationProvider } from 'naive-ui';
import { RouterView, useRoute } from 'vue-router';
import { layouts } from './layouts';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { useStyleStore } from './stores/style.store';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));

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
          <RouterView />
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
  background: #cccccc;
}

html.dark body {
  background: #1c1c1c;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  scrollbar-gutter: stable;
}

* {
  box-sizing: border-box;
}

/* ── Global pill button ─────────────────────────────────────────────── */
.kt-pill {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 5px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.kt-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.kt-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

.kt-pill:disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.kt-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
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
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.45);
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
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.45);
  color: #1ea54c;
}

/* ── Global alerts ──────────────────────────────────────────────────── */
.kt-alert {
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.82rem;
  line-height: 1.5;
}

.kt-alert-info {
  background: rgba(30, 165, 76, 0.08);
  border: 1px solid rgba(30, 165, 76, 0.3);
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
  background: rgba(30, 165, 76, 0.12);
  border: 1px solid rgba(30, 165, 76, 0.5);
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
  border-color: rgba(30,165,76,0.3) !important;
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
  border-color: rgba(30,165,76,0.25) !important;
}

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
  color: #1ea54c !important;
}

/* ── Powershell-builder light mode ── */

/* Sidebar toggle */
html:not(.dark) .cs-toggle {
  background: rgba(0,0,0,0.05) !important;
  border-color: rgba(0,0,0,0.15) !important;
  color: rgba(0,0,0,0.55) !important;
}
html:not(.dark) .cs-toggle:not(.cs-toggle-open) {
  background: rgba(30,165,76,0.08) !important;
  border-color: rgba(30,165,76,0.35) !important;
  color: #1ea54c !important;
}

/* Category filter pills */
html:not(.dark) .cat-pill {
  border-color: rgba(0,0,0,0.2) !important;
  background: rgba(0,0,0,0.07) !important;
  color: rgba(0,0,0,0.7) !important;
}
html:not(.dark) .cat-pill-active {
  background: rgba(13,112,51,0.15) !important;
  border-color: rgba(13,112,51,0.6) !important;
  color: #0d7033 !important;
}

/* Preset quick-select chips */
html:not(.dark) .preset-chip {
  border-color: rgba(0,0,0,0.2) !important;
  background: rgba(0,0,0,0.07) !important;
  color: rgba(0,0,0,0.7) !important;
}
html:not(.dark) .preset-chip-active {
  background: rgba(13,112,51,0.15) !important;
  border-color: #0d7033 !important;
  color: #0d7033 !important;
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
</style>
