<script setup lang="ts">
import { NDropdown } from 'naive-ui';

const { availableLocales, locale } = useI18n({ useScope: 'global' });
const localeOrder = ['en', 'es', 'de', 'fr', 'ja', 'kk', 'ru', 'tr', 'vi', 'zh-TW', 'zh', 'bn', 'cs', 'pl', 'hu', 'it', 'no', 'pt', 'uk'];
const localesLong: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  kk: 'Қазақша',
  ru: 'Русский',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  zhTW: '繁體中文',
  zh: '简体中文',
  bn: 'বাংলা',
  cs: 'Čeština',
  pl: 'Polski',
  hu: 'Magyar',
  it: 'Italiano',
  no: 'Norsk',
  pt: 'Português',
  uk: 'Українська',
};

const flags: Record<string, string> = {
  en: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><g fill="#b22234"><rect width="24" height="1.85"/><rect y="3.7" width="24" height="1.85"/><rect y="7.4" width="24" height="1.85"/><rect y="11.1" width="24" height="1.85"/><rect y="14.8" width="24" height="1.85"/><rect y="18.5" width="24" height="1.85"/><rect y="22.2" width="24" height="1.8"/></g><rect width="11" height="12.95" fill="#3c3b6e"/></svg>',
  es: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#c60b1e"/><rect y="6" width="24" height="12" fill="#ffc400"/></svg>',
  de: '<svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#000"/><rect y="8" width="24" height="8" fill="#dd0000"/><rect y="16" width="24" height="8" fill="#ffce00"/></svg>',
  fr: '<svg viewBox="0 0 24 24"><rect width="8" height="24" fill="#0055a4"/><rect x="8" width="8" height="24" fill="#fff"/><rect x="16" width="8" height="24" fill="#ef4135"/></svg>',
  ja: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/><circle cx="12" cy="12" r="7" fill="#bc002d"/></svg>',
  kk: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#00afca"/><circle cx="12" cy="12" r="4.5" fill="#f6d34a"/><g stroke="#f6d34a" stroke-width="1"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></g></svg>',
  ru: '<svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#0039a6"/><rect y="16" width="24" height="8" fill="#d52b1e"/></svg>',
  tr: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#e30a17"/><circle cx="9.5" cy="12" r="5" fill="#fff"/><circle cx="11" cy="12" r="4" fill="#e30a17"/><polygon points="15.5,9.4 16.12,11.15 17.97,11.2 16.5,12.32 17.03,14.1 15.5,13.05 13.97,14.1 14.5,12.32 13.03,11.2 14.88,11.15" fill="#fff"/></svg>',
  vi: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#da251d"/><polygon points="12,5 13.65,9.85 18.75,9.85 14.62,12.85 16.2,17.7 12,14.7 7.8,17.7 9.38,12.85 5.25,9.85 10.35,9.85" fill="#ff0"/></svg>',
  zhTW: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#fe0000"/><rect width="12" height="12" fill="#000095"/><polygon points="6,3 7.2,6.6 11,6.6 7.9,8.8 9.1,12.4 6,10.2 2.9,12.4 4.1,8.8 1,6.6 4.8,6.6" fill="#fff"/></svg>',
  zh: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#de2910"/><polygon points="4,3 4.9,5.6 7.6,5.6 5.4,7.3 6.2,9.9 4,8.3 1.8,9.9 2.6,7.3 0.4,5.6 3.1,5.6" fill="#ffde00"/></svg>',
  bn: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#006a4e"/><circle cx="10.5" cy="12" r="6" fill="#f42a41"/></svg>',
  cs: '<svg viewBox="0 0 24 24"><rect width="24" height="12" fill="#fff"/><rect y="12" width="24" height="12" fill="#d7141a"/><polygon points="0,0 12,12 0,24" fill="#11457e"/></svg>',
  pl: '<svg viewBox="0 0 24 24"><rect width="24" height="12" fill="#fff"/><rect y="12" width="24" height="12" fill="#dc143c"/></svg>',
  hu: '<svg viewBox="0 0 24 24"><rect width="24" height="8" fill="#ce2939"/><rect y="8" width="24" height="8" fill="#fff"/><rect y="16" width="24" height="8" fill="#477050"/></svg>',
  it: '<svg viewBox="0 0 24 24"><rect width="8" height="24" fill="#009246"/><rect x="8" width="8" height="24" fill="#fff"/><rect x="16" width="8" height="24" fill="#ce2b37"/></svg>',
  no: '<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#ba0c2f"/><path d="M7 0v24M0 11h24" stroke="#fff" stroke-width="6"/><path d="M7 0v24M0 11h24" stroke="#00205b" stroke-width="3"/></svg>',
  pt: '<svg viewBox="0 0 24 24"><rect width="10" height="24" fill="#006600"/><rect x="10" width="14" height="24" fill="#ff0000"/><circle cx="10" cy="12" r="5" fill="#ffcc00"/><circle cx="10" cy="12" r="3" fill="#fff"/></svg>',
  uk: '<svg viewBox="0 0 24 24"><rect width="24" height="12" fill="#0057b7"/><rect y="12" width="24" height="12" fill="#ffd700"/></svg>',
};

function displayKey(code: string) {
  return code === 'zh-TW' ? 'zhTW' : code;
}

function localeRank(code: string) {
  const rank = localeOrder.indexOf(code);
  return rank < 0 ? localeOrder.length : rank;
}

const localeOptions = computed(() =>
  [...availableLocales].sort((a, b) => localeRank(a) - localeRank(b)).map(code => ({
    label: `${localesLong[displayKey(code)] ?? code}${code === locale.value ? ' ✓' : ''}`,
    key: code,
  })),
);

function selectLocale(code: string) {
  locale.value = code;
}
</script>

<template>
  <NDropdown
    trigger="click"
    :options="localeOptions"
    @select="selectLocale"
  >
    <c-button class="locale-selector" circle variant="text" :aria-label="`Language: ${localesLong[displayKey(locale)] ?? locale}`">
      <span class="locale-flag" aria-hidden="true" v-html="flags[displayKey(locale)] ?? flags.en" />
    </c-button>
  </NDropdown>
</template>

<style scoped>
.locale-flag {
  display: block;
  width: 26px;
  height: 26px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  line-height: 0;
}
.locale-flag :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
.locale-selector:hover .locale-flag {
  border-color: var(--kt-accent);
}
</style>
