<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

// The Capacitor WebView injects a global bridge object; the banner is for the
// website only - inside the Android app itself it would be pointless nagging.
const isNativeApp = typeof window !== 'undefined' && 'Capacitor' in window;

const dismissed = useStorage('kt-android-beta-banner-dismissed', false);

// Hidden in the app, after dismissal, and on the page it links to.
const visible = computed(() => !isNativeApp && !dismissed.value && route.name !== 'android');
</script>

<template>
  <div v-if="visible" class="beta-banner" role="complementary" aria-label="Android beta announcement">
    <RouterLink class="beta-body" to="/android" @click="dismissed = true">
      <img class="beta-icon" src="/android-chrome-192x192.png" alt="">
      <span class="beta-text">
        <strong class="beta-title killer-font">Killer Tools is coming to Android</strong>
        <span class="beta-sub">Beta testers needed - tap to join</span>
      </span>
    </RouterLink>
    <button class="beta-close" type="button" aria-label="Dismiss" @click="dismissed = true">&#215;</button>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'KillerScan';
  src: url('/brand/KillerScan.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.killer-font {
  font-family: 'KillerScan', 'Courier New', monospace;
  font-weight: normal;
  letter-spacing: 0.5px;
}

/* Family grunge surface, floated bottom-right like a quiet toast */
.beta-banner {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 900;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--kt-modal, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 6px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
}

.beta-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--kt-accent-sel, var(--kt-accent));
  pointer-events: none;
}

.beta-body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 6px 12px 14px;
  text-decoration: none;
  transition: background 0.15s;
}

.beta-body:hover {
  background: color-mix(in srgb, var(--kt-accent) 10%, transparent);
}

.beta-icon {
  width: 38px;
  height: 38px;
  object-fit: contain;
  flex-shrink: 0;
}

.beta-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: monospace;
}

.beta-title {
  font-size: 14px;
  color: var(--kt-accent);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

.beta-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.beta-close {
  align-self: stretch;
  width: 34px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.beta-close:hover {
  color: #fff;
  background: rgba(196, 43, 28, 0.55);
}

@media (max-width: 640px) {
  .beta-banner {
    left: 12px;
    right: 12px;
    bottom: 12px;
  }
  .beta-body { flex: 1; min-width: 0; }
}

/* Light mode: surface adapts through the theme vars, text flips */
html:not(.dark) .beta-sub { color: rgba(0, 0, 0, 0.6); }
html:not(.dark) .beta-title { text-shadow: none; }
html:not(.dark) .beta-close { color: rgba(0, 0, 0, 0.45); }
html:not(.dark) .beta-close:hover { color: #fff; }
</style>
