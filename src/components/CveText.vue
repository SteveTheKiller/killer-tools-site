<script setup lang="ts">
// Renders plain text with every CVE ID turned into a link that opens the
// site's own CVE Lookup in a new tab. Text stays text (no v-html).
const props = defineProps<{ text: string }>();

const parts = computed(() =>
  props.text.split(/(CVE-\d{4}-\d{4,})/i).map((chunk, i) => ({ chunk, cve: i % 2 === 1 })),
);
</script>

<template>
  <template v-for="(p, i) in parts" :key="i">
    <a
      v-if="p.cve"
      class="kt-cve-link"
      :href="`/cve-lookup?q=${encodeURIComponent(p.chunk.toUpperCase())}`"
      target="_blank"
      rel="noopener"
      @click.stop
    >{{ p.chunk }}</a>
    <template v-else>
      {{ p.chunk }}
    </template>
  </template>
</template>

<style scoped>
.kt-cve-link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
}
.kt-cve-link:hover {
  text-decoration-thickness: 2px;
}
</style>
