<script setup lang="ts">
import type { KtAccentKey } from '@/themes';
import { computed } from 'vue';
import { useStyleStore } from '@/stores/style.store';
import { ktAccents, ktThemes, NEUTRAL_THEMES, THEME_DEFAULT_ACCENT } from '@/themes';

const styleStore = useStyleStore();

const ACCENT_ORDER: KtAccentKey[] = ['red', 'orange', 'green', 'teal', 'blue', 'purple'];

// Accents apply to the neutral themes only (Dark / Light / Black)
const accentsVisible = computed(() => NEUTRAL_THEMES.includes(styleStore.ktTheme));

const accentFamily = computed(() =>
  styleStore.ktTheme === 'light' ? 'light' : styleStore.ktTheme === 'black' ? 'black' : 'dark');

const effectiveAccent = computed(() =>
  styleStore.ktAccent || THEME_DEFAULT_ACCENT[styleStore.ktTheme] || 'teal');

function accentColor(name: KtAccentKey) {
  return ktAccents[accentFamily.value][name];
}
</script>

<template>
  <div class="chrome-pickers">
    <!-- Accent dots (per-theme accent colors, app style) -->
    <div v-if="accentsVisible" class="agrp" role="group" aria-label="Accent color">
      <button
        v-for="name in ACCENT_ORDER"
        :key="name"
        class="acc"
        :style="{ background: accentColor(name) }"
        :title="name.charAt(0).toUpperCase() + name.slice(1)"
        :aria-label="`Accent: ${name}`"
        :aria-pressed="effectiveAccent === name"
        @click="styleStore.setAccent(name)"
      />
    </div>
    <div v-if="accentsVisible" class="pick-divider" />

    <!-- Theme swatches, ported from the landing-page picker -->
    <div class="tgrp" role="group" aria-label="Theme">
      <button
        v-for="t in ktThemes"
        :key="t.key"
        class="swatch"
        :style="{ background: t.swatchBg, '--sw-accent': t.swatchAccent }"
        :title="t.label"
        :aria-label="t.label"
        :aria-pressed="styleStore.ktTheme === t.key"
        @click="styleStore.setTheme(t.key)"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.chrome-pickers {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.pick-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 10px;
  flex-shrink: 0;
}
html:not(.dark) .pick-divider {
  background: rgba(0, 0, 0, 0.2);
}

.tgrp,
.agrp {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Theme swatches (19px, ring + inner accent dot) */
.swatch {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.22);
  padding: 0;
  position: relative;
  transition: transform 0.12s, border-color 0.12s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.15);
  }

  &[aria-pressed='true'] {
    border-color: var(--kt-accent);
    box-shadow: 0 0 0 2px var(--kt-accent);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: var(--sw-accent);
  }
}

/* Accent dots (smaller solid dots, app style) */
.acc {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0;
  transition: transform 0.12s, box-shadow 0.12s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.2);
  }

  &[aria-pressed='true'] {
    box-shadow: 0 0 0 2px var(--kt-accent);
  }
}

html:not(.dark) .swatch,
html:not(.dark) .acc {
  border-color: rgba(0, 0, 0, 0.25);
}
</style>
