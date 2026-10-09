<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { IconBrandAndroid, IconInfoCircle } from '@tabler/icons-vue';
import LocaleSelector from '@/modules/i18n/components/locale-selector.vue';

const isNativeApp = Capacitor.isNativePlatform();
const { t } = useI18n();
</script>

<template>
  <div class="navbar-buttons" flex items-center gap-5>
    <LocaleSelector />
    <c-tooltip v-if="!isNativeApp" :tooltip="t('components.navbarButtons.androidTooltip')" position="bottom">
      <c-button class="keep-circle" circle variant="text" to="/android" :aria-label="t('components.navbarButtons.androidAriaLabel')">
        <n-icon size="30" :component="IconBrandAndroid" />
      </c-button>
    </c-tooltip>

    <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
      <c-button class="keep-circle" circle variant="text" to="/about" :aria-label="$t('home.nav.aboutLabel')">
        <n-icon size="30" :component="IconInfoCircle" />
      </c-button>
    </c-tooltip>
  </div>
</template>

<style lang="less" scoped>
/* The tooltip wrappers are inline blocks, so the text line box made them taller than the
   34px buttons and pushed the whole titlebar row onto a fractional pixel, which blurred
   the bottom edge of every 1px border in it. Flex wrappers size to the button exactly. */
.navbar-buttons > div,
.navbar-buttons > div > :deep(div:first-child) {
  display: flex;
}

.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
