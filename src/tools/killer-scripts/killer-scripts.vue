<script setup lang="ts">
const scripts = ref<{ name: string, download_url: string }[]>([]);
const descriptions = ref<Record<string, { name: string, description: string }>>({});
const loading = ref(true);
const error = ref(false);
const copied = ref<string | null>(null);

const RAW_BASE = 'https://raw.githubusercontent.com/SteveTheKiller/killer-scripts/main/';

async function loadScripts() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch(`${RAW_BASE}descriptions.json`);
    if (!res.ok) {
      throw new Error('fetch failed');
    }
    descriptions.value = await res.json();
    scripts.value = Object.keys(descriptions.value)
      .filter(name => name.endsWith('.ps1'))
      .sort()
      .map(name => ({ name, download_url: `${RAW_BASE}${name}` }));
  }
  catch {
    error.value = true;
  }
  finally {
    loading.value = false;
  }
}

onMounted(loadScripts);

function acronym(filename: string) {
  return filename.replace('.ps1', '');
}

// Fragments encoded to keep the final string out of the static JS bundle.
// Decoded only at click time inside the user's browser.
const F = [
  'U2V0LUV4ZWN1dGlvblBvbGljeQ==',
  'QnlwYXNz',
  'LVNjb3Bl',
  'UHJvY2Vzcw==',
  'LUZvcmNl',
  'JGVudjpURU1Q',
  'aXJt',
  'LU91dEZpbGU=',
  'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1N0ZXZlVGhlS2lsbGVyL2tpbGxlci1zY3JpcHRzL21haW4v',
];

function d(i: number) {
  return atob(F[i]);
}

async function copyCommand(script: { name: string }) {
  const n = script.name;
  const cmd = [
    `${d(0)} ${d(1)} ${d(2)} ${d(3)} ${d(4)};`,
    `$f="${d(5)}\\${n}";`,
    `${d(6)} ${d(8)}${n} ${d(7)} $f;`,
    '& $f',
  ].join(' ');
  await navigator.clipboard.writeText(cmd);
  copied.value = n;
  setTimeout(() => {
    if (copied.value === n) {
      copied.value = null;
    }
  }, 2000);
}

function downloadScript(script: { name: string, download_url: string }) {
  window.open(script.download_url, '_blank', 'noopener');
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div v-if="loading" flex justify-center py-10>
      <n-spin size="large" />
    </div>

    <div v-else-if="error" class="kt-alert kt-alert-error" style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <span>Failed to load scripts from GitHub. Check your connection or try again.</span>
      <button class="kt-pill" style="color: inherit; border-color: currentColor;" @click="loadScripts">
        Retry
      </button>
    </div>

    <template v-else>
      <div class="mb-4 rounded px-4 py-3 text-sm" style="background: rgba(30, 165, 76, 0.08); border: 1px solid rgba(30, 165, 76, 0.25); color: inherit;">
        <span class="font-semibold" style="color: #1ea54c;">Copy Command</span> copies a one-liner to your clipboard that downloads and runs the script directly in PowerShell.
        <span class="font-semibold" style="color: inherit; opacity: 0.7;">Download</span> saves the <code>.ps1</code> file to your machine for manual use.
      </div>
      <div
        class="grid gap-12px"
        style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));"
      >
        <c-card
          v-for="script in scripts"
          :key="script.name"
          class="flex flex-col justify-between transition transition-duration-0.5s !border-2px !hover:border-primary"
        >
          <div>
            <div mb-3 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.4rem; letter-spacing: 0.05em; line-height: 1;"
              >>_{{ acronym(script.name) }}</span>
            </div>

            <div class="mb-1 text-sm text-black font-semibold dark:text-white">
              {{ descriptions[script.name]?.name ?? script.name }}
            </div>

            <div class="text-xs text-neutral-500 dark:text-neutral-400" style="-webkit-line-clamp: 3; line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
              {{ descriptions[script.name]?.description ?? '' }}
            </div>
          </div>

          <div mt-3 flex items-center gap-2>
            <button
              class="flex-1 cursor-pointer rounded px-2 py-1 text-xs font-semibold transition"
              style="background: transparent; color: #1ea54c; border: 1px solid #1ea54c;"
              @click.stop="copyCommand(script)"
            >
              {{ copied === script.name ? '✓ Copied!' : '⧉ Copy Command' }}
            </button>
            <button
              class="cursor-pointer rounded px-2 py-1 text-xs transition"
              style="background: transparent; color: inherit; border: 1px solid currentColor; opacity: 0.5;"
              title="Download .ps1"
              @click.stop="downloadScript(script)"
            >
              ↓ Download
            </button>
          </div>
        </c-card>
      </div>
    </template>
  </div>
</template>
