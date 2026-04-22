<script setup lang="ts">
const props = defineProps<{ title: string; action: () => void; isActive?: () => boolean }>();
const { title, action, isActive } = toRefs(props);
</script>

<template>
  <c-tooltip :tooltip="title">
    <c-button circle variant="text" :type="isActive?.() ? 'primary' : 'default'" @click="action">
      <slot />
    </c-button>
  </c-tooltip>
</template>
