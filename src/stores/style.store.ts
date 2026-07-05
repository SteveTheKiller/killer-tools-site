import type { Ref } from 'vue';
import type { KtAccentKey, KtThemeKey } from '@/themes';
import { useMediaQuery, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, nextTick, watch, watchEffect } from 'vue';
import { accentTriple } from '@/themes';

const VALID_THEMES: KtThemeKey[] = ['dark', 'light', 'black', 'blood', 'greed', 'cyanotic'];
const VALID_ACCENTS: (KtAccentKey | '')[] = ['', 'red', 'orange', 'green', 'teal', 'blue', 'purple'];

export const useStyleStore = defineStore('style', {
  state: () => {
    // Six-theme engine (Grunge port). Default = Dark(Teal); saved choice wins.
    const ktTheme = useStorage('kt-theme', 'dark') as Ref<KtThemeKey>;
    if (!VALID_THEMES.includes(ktTheme.value)) {
      ktTheme.value = 'dark';
    }

    // Accent override for the neutral themes (Dark/Light/Black). Defaults to
    // teal (site identity); empty string = the theme's own default accent.
    const ktAccent = useStorage('kt-accent', 'teal') as Ref<KtAccentKey | ''>;
    if (!VALID_ACCENTS.includes(ktAccent.value)) {
      ktAccent.value = '';
    }

    const isDarkTheme = computed(() => ktTheme.value !== 'light');
    const isSmallScreen = useMediaQuery('(max-width: 700px)');
    const isMenuCollapsed = useStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;

    watch(isSmallScreen, v => (isMenuCollapsed.value = v));

    // Reflect theme + accent onto <html>: the legacy .dark class, data-kt-theme
    // (carries the CSS variable table), and inline accent vars when a neutral
    // theme is active (inline wins over the static table).
    watchEffect(() => {
      const d = document.documentElement;
      d.classList.toggle('dark', ktTheme.value !== 'light');
      d.classList.toggle('light', ktTheme.value === 'light');
      d.setAttribute('data-kt-theme', ktTheme.value);

      const t = accentTriple(ktTheme.value, ktAccent.value);
      if (t) {
        d.style.setProperty('--kt-accent', t.base);
        d.style.setProperty('--kt-accent-2', t.pressed);
        d.style.setProperty('--kt-accent-sel', t.sel);
        d.style.setProperty('--kt-accent-rgb', t.rgb.join(', '));
        // First-paint cache (read by the index.html inline script)
        try {
          localStorage.setItem('kt-av', `${t.base}|${t.pressed}|${t.rgb.join(', ')}|${t.sel}`);
        }
        catch {}
      }
      else {
        // Colored theme: fall back to the static per-theme CSS table
        d.style.removeProperty('--kt-accent');
        d.style.removeProperty('--kt-accent-2');
        d.style.removeProperty('--kt-accent-sel');
        d.style.removeProperty('--kt-accent-rgb');
      }
    });

    // Smooth theme swap: while kt-theme-fade is on <html>, a global rule
    // transitions colors everywhere, so the CSS-var chrome and the JS-themed
    // NaiveUI content fade together instead of flipping in two parts.
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const themeFade = () => {
      const d = document.documentElement;
      d.classList.add('kt-theme-fade');
      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }
      fadeTimer = setTimeout(() => d.classList.remove('kt-theme-fade'), 400);
    };

    // One-shot page cross-fade: the View Transitions API snapshots the page,
    // applies the swap (CSS-var chrome AND the NaiveUI re-render together,
    // thanks to the awaited tick), and composites a single smooth fade.
    // Browsers without it get the kt-theme-fade CSS fallback.
    const applyThemed = (mutate: () => void) => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => Promise<void>) => {
          ready?: Promise<void>
          finished?: Promise<void>
          updateCallbackDone?: Promise<void>
        }
      };
      if (typeof doc.startViewTransition === 'function') {
        try {
          const vt = doc.startViewTransition(async () => {
            mutate();
            await nextTick();
          });
          // Rapid re-clicks abort the in-flight transition; that's fine —
          // swallow the rejections so they don't surface as exceptions
          vt?.ready?.catch(() => {});
          vt?.finished?.catch(() => {});
          vt?.updateCallbackDone?.catch(() => {});
        }
        catch {
          themeFade();
          mutate();
        }
      }
      else {
        themeFade();
        mutate();
      }
    };

    const setTheme = (t: KtThemeKey) => {
      applyThemed(() => (ktTheme.value = t));
    };

    const setAccent = (name: KtAccentKey | '') => {
      applyThemed(() => (ktAccent.value = name));
    };

    // Back-compat: the old sun/moon toggle and command palette action
    const toggleDark = () => {
      applyThemed(() => (ktTheme.value = ktTheme.value === 'light' ? 'dark' : 'light'));
    };

    return {
      ktTheme,
      ktAccent,
      isDarkTheme,
      setTheme,
      setAccent,
      toggleDark,
      isMenuCollapsed,
      isSmallScreen,
    };
  },
});
