<script setup lang="ts">
import type { PaletteOption } from '../command-palette.types';

const props = withDefaults(defineProps<{ option: PaletteOption, selected?: boolean }>(), {
  selected: false,
});
const emit = defineEmits(['activated']);
const { option } = toRefs(props);

const { selected } = toRefs(props);

// Killer app entries carry their own brand icon + wordmark (same map as the sidebar)
const APP_BRAND: Record<string, { icon: string, wm: string }> = {
  '/killer-pdf': { icon: '/brand/kp-icon.png', wm: 'killerpdf' },
  '/killer-shell': { icon: '/brand/ksh-icon.png', wm: 'killershell' },
  '/killer-scan': { icon: '/brand/ks-icon.png', wm: 'killerscan' },
  // killer-notes was missing here while present in the other three maps, so KillerNotes showed
  // a generic icon in the palette only. Added 2026-07-30 alongside killendar.
  '/killer-notes': { icon: '/brand/kn-icon.png', wm: 'killernotes' },
  '/killendar': { icon: '/brand/kd-icon.png', wm: 'killendar' },
};

const brand = computed(() => (option.value.to ? APP_BRAND[option.value.to] : undefined));
</script>

<template>
  <div
    role="option"
    :aria-selected="selected"
    class="cp-option"
    :class="{ 'cp-option-selected': selected }"
    w-full flex cursor-pointer items-center overflow-hidden pa-3
    @click="() => emit('activated', option)"
  >
    <template v-if="brand">
      <img :src="brand.icon" alt="" mr-3 h-30px w-30px shrink-0>

      <div flex-1 overflow-hidden>
        <img class="cp-wm cp-wm-dark" :src="`/brand/${brand.wm}-wordmark-dark.png`" :alt="option.name">
        <img class="cp-wm cp-wm-light" :src="`/brand/${brand.wm}-wordmark-light.png`" :alt="option.name">

        <div v-if="option.description" truncate lh-tight op-60>
          {{ option.description }}
        </div>
      </div>
    </template>

    <template v-else>
      <component :is="option.icon" v-if="option.icon" mr-3 h-30px w-30px shrink-0 op-50 />

      <div flex-1 overflow-hidden>
        <div truncate font-bold lh-tight op-90>
          {{ option.name }}
        </div>

        <div v-if="option.description" truncate lh-tight op-60>
          {{ option.description }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Family hover/selected: accent-tinted bar + accent text (dropdown-item rule) */
.cp-option {
  border-radius: 6px;
  transition: background 0.12s ease, color 0.12s ease;
}

.cp-option:hover,
.cp-option-selected {
  background: rgba(var(--kt-accent-rgb), 0.1);
  color: var(--kt-accent);
}

/* Brand wordmarks sized to sit like the option title, dark/light swap */
.cp-wm {
  /* 21, not 17 - the shared-window wordmarks are taller for the same text size.
     See Killer Branding/make-card-wordmarks.py. */
  height: 21px;
  width: auto;
  display: block;
  margin-bottom: 3px;
}

.cp-wm-light {
  display: none;
}

html:not(.dark) .cp-wm-dark {
  display: none;
}

html:not(.dark) .cp-wm-light {
  display: block;
}
</style>
