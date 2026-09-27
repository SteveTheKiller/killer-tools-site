import { ref, watch } from 'vue';

// Translations for a tool's reference data. Each locale file maps the English
// source text to its translation, so reordering or adding entries never breaks
// existing translations. Only the active locale's file is downloaded; anything
// missing falls back to English.
type LocaleLoaders = Record<string, () => Promise<unknown>>;

export function useDataI18n(loaders: LocaleLoaders) {
  const { locale } = useI18n();
  const messages = ref<Record<string, string>>({});

  watch(locale, async (current) => {
    const path = Object.keys(loaders).find(key => key.endsWith(`/${current}.json`));
    if (!path) {
      messages.value = {};
      return;
    }
    const loaded = await loaders[path]() as { default: Record<string, string> };
    if (locale.value === current) {
      messages.value = loaded.default;
    }
  }, { immediate: true });

  return (text: string) => messages.value[text] ?? text;
}
