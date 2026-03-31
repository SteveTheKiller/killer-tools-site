<script setup lang="ts">
const scripts = ref<{ name: string; download_url: string }[]>([]);
const descriptions = ref<Record<string, { name: string; description: string }>>({});
const loading = ref(true);
const error = ref(false);
const downloading = ref<string | null>(null);
const search = ref('');

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

const filteredScripts = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return scripts.value;
  return scripts.value.filter((s) => {
    const desc = descriptions.value[s.name];
    return (
      s.name.toLowerCase().includes(q)
      || desc?.name?.toLowerCase().includes(q)
      || desc?.description?.toLowerCase().includes(q)
    );
  });
});

function acronym(filename: string) {
  return filename.replace('.ps1', '');
}

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
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <div mb-2 flex items-center justify-end gap-3>
      <a
        href="https://github.com/SteveTheKiller/killer-scripts"
        target="_blank"
        op-50
        hover:op-100
        transition
        style="color: inherit; text-decoration: none; font-size: 0.85rem;"
      >
        GitHub ↗
      </a>
      <c-input
        v-model:value="search"
        placeholder="Search scripts..."
        style="max-width: 260px;"
        clearable
      />
    </div>

    <div v-if="loading" flex justify-center py-10>
      <n-spin size="large" />
    </div>

    <n-alert v-else-if="error" type="error" mb-4>
      Failed to load scripts from GitHub.
    </n-alert>

    <template v-else>
      <div
        v-if="filteredScripts.length === 0"
        flex justify-center py-10 op-50
      >
        No scripts match "{{ search }}"
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-12px sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
      >
        <c-card
          v-for="script in filteredScripts"
          :key="script.name"
          class="flex flex-col justify-between transition transition-duration-0.5s !border-2px !hover:border-primary cursor-pointer"
          @click="downloadScript(script)"
        >
          <div>
            <div flex items-start justify-between gap-2 mb-3>
              <span
                class="font-mono font-bold text-primary"
                style="font-size: 1.4rem; letter-spacing: 0.05em; line-height: 1;"
              >>_{{ acronym(script.name) }}</span>
              <n-tag
                v-if="downloading === script.name"
                size="small"
                type="success"
              >
                ↓
              </n-tag>
            </div>

            <div class="text-sm font-semibold text-black dark:text-white mb-1">
              {{ descriptions[script.name]?.name ?? script.name }}
            </div>

            <div class="text-xs text-neutral-500 dark:text-neutral-400" style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
              {{ descriptions[script.name]?.description ?? '' }}
            </div>
          </div>

          <div mt-3 flex justify-end>
            <span class="text-xs op-40 hover:op-80 transition">
              {{ downloading === script.name ? 'Downloading...' : 'Click to download' }}
            </span>
          </div>
        </c-card>
      </div>
    </template>
  </div>
</template>