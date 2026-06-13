<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  window.open('https://find.killertools.net', '_blank', 'noopener');
  router.replace('/');
});
</script>

<template>
  <div />
</template>
