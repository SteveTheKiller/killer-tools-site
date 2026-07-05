<script setup lang="ts">
import type { KtAccentKey } from '@/themes';
import { useStorage } from '@vueuse/core';
import { computed, nextTick, ref } from 'vue';
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

// Mobile: the six theme swatches collapse behind the current-theme circle
// to make room for the centered brand; tapping it expands the row.
const swatchesOpen = ref(false);
const currentTheme = computed(() => ktThemes.find(t => t.key === styleStore.ktTheme));

function accentColor(name: KtAccentKey) {
  return ktAccents[accentFamily.value][name];
}

// ── Accent popup (KillerScan style): opened from a single trigger circle.
//    Docks to the top rail (KillerPDF annotation-bar behavior): fixed y,
//    drags left/right along that row only, x position persisted ──
const popupOpen = ref(false);
// Rail height: top of the bar flush with the top of the content pane
const popupTop = ref(72);
const popupX = useStorage('kt-accent-popup-x', -1);
const triggerRef = ref<HTMLElement>();
const popupRef = ref<HTMLElement>();

// Drag range: contained within the content pane — a few px inside the left
// border, and never past the pane scrollbar on the right
const railMinX = ref(8);
const railMaxX = ref(1000);

function measureRail() {
  const pane = document.querySelector('.n-layout.content');
  if (pane) {
    const rect = pane.getBoundingClientRect();
    const popupW = popupRef.value?.offsetWidth ?? 250;
    popupTop.value = Math.round(rect.top);
    railMinX.value = Math.round(rect.left + 6);
    railMaxX.value = Math.max(railMinX.value, Math.round(rect.right - popupW - 18));
  }
}

function clampX(x: number) {
  return Math.min(Math.max(x, railMinX.value), railMaxX.value);
}

async function togglePopup() {
  popupOpen.value = !popupOpen.value;
  if (!popupOpen.value) {
    return;
  }
  await nextTick();
  measureRail();
  if (popupX.value < 0) {
    // First open: anchor near the trigger, on the rail
    const rect = triggerRef.value?.getBoundingClientRect();
    popupX.value = clampX(rect ? rect.right - 250 : 100);
  }
  else {
    // Saved position: re-clamp in case the window shrank since last session
    popupX.value = clampX(popupX.value);
  }
}

function startDrag(e: PointerEvent) {
  e.preventDefault();
  measureRail(); // refresh bounds in case the window was resized
  document.body.style.userSelect = 'none'; // no text selection while dragging
  const offX = e.clientX - popupX.value;
  const move = (ev: PointerEvent) => {
    popupX.value = clampX(ev.clientX - offX);
  };
  const up = () => {
    document.body.style.userSelect = '';
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}
</script>

<template>
  <div class="chrome-pickers">
    <!-- Accent trigger (app style): one slightly larger circle in the current
         accent; clicking opens the draggable accent popup -->
    <button
      v-if="accentsVisible"
      ref="triggerRef"
      class="acc-trigger"
      :style="{ background: accentColor(effectiveAccent) }"
      title="Accent color"
      aria-label="Accent color"
      :aria-expanded="popupOpen"
      @click="togglePopup"
    />
    <div v-if="accentsVisible" class="pick-divider" />

    <!-- Mobile-only collapse trigger: shows the current theme, expands the row -->
    <button
      class="swatch sm-theme-trigger"
      :style="{ background: currentTheme?.swatchBg, '--sw-accent': currentTheme?.swatchAccent }"
      title="Theme"
      aria-label="Toggle theme swatches"
      :aria-expanded="swatchesOpen"
      @click="swatchesOpen = !swatchesOpen"
    />

    <!-- Theme swatches, ported from the landing-page picker -->
    <div class="tgrp" :class="{ 'tgrp-open': swatchesOpen }" role="group" aria-label="Theme">
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

    <!-- Accent popup: floating, draggable by the grip, position saved -->
    <Teleport to="body">
      <Transition name="acc-popup-fade">
        <div
          v-if="popupOpen && accentsVisible"
          ref="popupRef"
          class="acc-popup"
          :style="{ left: `${popupX}px`, top: `${popupTop}px` }"
          role="group"
          aria-label="Accent color picker"
        >
          <span class="acc-popup-grip" title="Drag to move" @pointerdown="startDrag">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
              <circle cx="2.5" cy="2" r="1.3" /><circle cx="7.5" cy="2" r="1.3" />
              <circle cx="2.5" cy="7" r="1.3" /><circle cx="7.5" cy="7" r="1.3" />
              <circle cx="2.5" cy="12" r="1.3" /><circle cx="7.5" cy="12" r="1.3" />
            </svg>
          </span>
          <span class="acc-popup-label">accent:</span>
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
          <button class="acc-popup-close" aria-label="Close accent picker" @click="popupOpen = false">
            ×
          </button>
        </div>
      </Transition>
    </Teleport>
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

.tgrp {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Accent trigger: slightly larger than the theme swatches (app style) */
.acc-trigger {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.22);
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;

  &:hover {
    transform: scale(1.12);
    border-color: rgba(255, 255, 255, 0.45);
  }

  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px var(--kt-accent);
  }
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

/* Accent dots inside the popup */
.acc {
  width: 16px;
  height: 16px;
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
html:not(.dark) .acc,
html:not(.dark) .acc-trigger {
  border-color: rgba(0, 0, 0, 0.25);
}

/* Desktop: no collapse trigger, full swatch row */
.sm-theme-trigger {
  display: none;
}

/* Phones: tighter pickers; the six swatches collapse behind the
   current-theme circle so the centered brand has room */
@media (max-width: 700px) {
  .chrome-pickers {
    margin-right: 6px;
  }

  .pick-divider {
    margin: 0 6px;
  }

  .sm-theme-trigger {
    display: block;
    width: 17px;
    height: 17px;
  }

  .tgrp {
    display: none;
    gap: 5px;
  }

  .tgrp.tgrp-open {
    display: flex;
    margin-left: 6px;
  }

  .swatch:not(.sm-theme-trigger) {
    width: 15px;
    height: 15px;
  }

  .acc-trigger {
    width: 20px;
    height: 20px;
  }
}
</style>

<style lang="less">
/* Popup is teleported to <body>, so its chrome lives unscoped. Family menu
   look: grained modal surface, accent border, rounded, drop shadow. */
.acc-popup {
  position: fixed;
  z-index: 4000;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  /* Docked to the pane's top edge: square on top, rounded below */
  border-radius: 0 0 9px 9px;
  background: var(--kt-modal, #111111) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}

.acc-popup-grip {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.35);
  cursor: grab;
  touch-action: none;
  padding: 2px;

  &:active {
    cursor: grabbing;
  }
}

.acc-popup-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  user-select: none;
}

.acc-popup-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.12s;

  &:hover {
    color: var(--kt-accent);
  }
}

html:not(.dark) .acc-popup-grip { color: rgba(0, 0, 0, 0.35); }
html:not(.dark) .acc-popup-label { color: rgba(0, 0, 0, 0.65); }
html:not(.dark) .acc-popup-close { color: rgba(0, 0, 0, 0.4); }

.acc-popup-fade-enter-active,
.acc-popup-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.acc-popup-fade-enter-from,
.acc-popup-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
