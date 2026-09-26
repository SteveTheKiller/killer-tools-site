<script setup lang="ts">
import { NDropdown } from 'naive-ui';

const { availableLocales, locale } = useI18n({ useScope: 'global' });

const localesLong: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  no: 'Norwegian',
  pt: 'Português',
  ru: 'Русский',
  uk: 'Українська',
  zh: '中文',
  vi: 'Tiếng Việt',
};

const localeOptions = computed(() =>
  availableLocales.map(code => ({
    label: `${localesLong[code] ?? code}${code === locale.value ? ' ✓' : ''}`,
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
    <c-button class="locale-selector" circle variant="text" :aria-label="`Language: ${localesLong[locale] ?? locale}`">
      <icon-mdi:translate text-24px />
    </c-button>
  </NDropdown>
</template>
