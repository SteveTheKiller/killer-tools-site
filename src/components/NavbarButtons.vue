<script setup lang="ts">
import { IconBrandGithub, IconInfoCircle } from '@tabler/icons-vue';
</script>

<template>
  <div flex items-center>
    <c-tooltip :tooltip="$t('home.nav.github')" position="bottom">
      <c-button
        circle
        variant="text"
        href="https://github.com/SteveTheKiller/killer-tools-site"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="$t('home.nav.githubRepository')"
      >
        <n-icon size="25" :component="IconBrandGithub" />
      </c-button>
    </c-tooltip>

    <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
      <c-button circle variant="text" to="/about" :aria-label="$t('home.nav.aboutLabel')">
        <n-icon size="25" :component="IconInfoCircle" />
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
