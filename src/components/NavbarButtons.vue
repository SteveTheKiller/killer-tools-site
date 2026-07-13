<script setup lang="ts">
import { IconBrandAndroid, IconInfoCircle } from '@tabler/icons-vue';
</script>

<template>
  <div flex items-center gap-5>
    <c-tooltip tooltip="Killer Tools for Android" position="bottom">
      <c-button circle variant="text" to="/android" aria-label="Killer Tools for Android - join the beta">
        <n-icon size="30" :component="IconBrandAndroid" />
      </c-button>
    </c-tooltip>

    <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
      <c-button circle variant="text" to="/about" :aria-label="$t('home.nav.aboutLabel')">
        <n-icon size="30" :component="IconInfoCircle" />
      </c-button>
    </c-tooltip>

  </div>
</template>

<style lang="less" scoped>
.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
