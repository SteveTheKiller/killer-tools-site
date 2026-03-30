<script setup lang="ts">
const scripts = ref<{ name: string; download_url: string }[]>([]);
const descriptions = ref<Record<string, { name: string; description: string }>>({});
const loading = ref(true);
const error = ref(false);
const downloading = ref<string | null>(null);

onMounted(async () => {
  try {
    const [contentsRes, descRes] = await Promise.all([
      fetch('https://api.github.com/repos/SteveTheKiller/killer-scripts/contents/'),
      fetch('https://raw.githubusercontent.com/SteveTheKiller/killer-scripts/main/descriptions.json'),
    ]);
    const contents = await contentsRes.json();
    descriptions.value = await descRes.json();
    scripts.value = contents
      .filter((f: any) => f.name.endsWith('.ps1'))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  catch {
    error.value = true;
  }
  finally {
    loading.value = false;
  }
});

async function downloadScript(script: { name: string; download_url: string }) {
  downloading.value = script.name;
  try {
    const res = await fetch(script.download_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  finally {
    downloading.value = null;
  }
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1200px;">
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

      <div v-else flex flex-col gap-3>
        <div
          v-for="script in scripts"
          :key="script.name"
          flex items-center justify-between gap-4
          p-3
          style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;"
        >
          <div flex flex-col gap-1>
            <span font-bold font-mono>{{ descriptions[script.name]?.name ?? script.name }}</span>
            <span text-sm op-60>{{ descriptions[script.name]?.description ?? '' }}</span>
          </div>
          <c-button
            size="small"
            style="flex-shrink: 0;"
            :loading="downloading === script.name"
            @click="downloadScript(script)"
          >
            Download
          </c-button>
        </div>
      </div>
    </c-card>
  </div>
</template>
