import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { createHead } from '@vueuse/head';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import shadow from 'vue-shadow-dom';
import App from './App.vue';
import { i18nPlugin } from './plugins/i18n.plugin';
import { naive } from './plugins/naive.plugin';
import router from './router';
import 'virtual:uno.css';
import '@/assets/kt-terminal.css';

// The service worker precaches the app shell, so a returning visitor keeps the
// previous build until the worker notices a new one. Browsers only look on a
// full navigation, which a phone resuming a tab never does, so also check when
// the tab comes back into view and once an hour. autoUpdate then swaps in the
// new build and reloads.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) {
      return;
    }
    const checkForUpdate = () => {
      if (!registration.installing && navigator.onLine) {
        registration.update().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    });
    setInterval(checkForUpdate, 60 * 60 * 1000);
  },
});

// Android hardware/gesture back: go back in history instead of exiting the app.
// At the history root, minimize like a normal Android app.
if (Capacitor.isNativePlatform()) {
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    }
    else {
      CapacitorApp.minimizeApp();
    }
  });
}

const app = createApp(App);

app.use(createPinia());
app.use(createHead());
app.use(i18nPlugin);
app.use(router);
app.use(naive);
app.use(shadow);

app.mount('#app');
