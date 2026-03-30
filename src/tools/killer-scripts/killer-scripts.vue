<script setup lang="ts">
const scripts = ref<{ name: string; download_url: string }[]>([]);
const loading = ref(true);
const error = ref(false);

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/SteveTheKiller/killer-scripts/contents/');
    const data = await res.json();
    scripts.value = data
      .filter((f: any) => f.name.endsWith('.ps1'))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <c-card>
    <div mb-4>
      <p op-70>
        PowerShell scripts for Windows administration and MSP field work.
        Source on <a href="https://github.com/SteveTheKiller/killer-scripts" target="_blank" style="color: inherit; text-decoration: underline;">GitHub</a>.
      </p>
    </div>

    <div v-if="loading" flex justify-center py-6>
      <n-spin />
    </div>

    <n-alert v-else-if="error" type="error" mb-4>
      Failed to load scripts from GitHub.
    </n-alert>

    <div v-else flex flex-col gap-2>
      <div
        v-for="script in scripts"
        :key="script.name"
        flex items-center justify-between
        p-3
        style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;"
      >
        <span font-mono>{{ script.name }}</span>
        <a :href="script.download_url" :download="script.name">
          <c-button size="small">Download</c-button>
        </a>
      </div>
    </div>
  </c-card>
</template>