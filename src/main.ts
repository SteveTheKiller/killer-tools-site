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

registerSW();

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
