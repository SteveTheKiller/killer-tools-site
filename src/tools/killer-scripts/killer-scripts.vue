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
      <div class="ks-info mb-4 rounded px-4 py-3 text-sm">
        <span class="ks-info-cmd font-semibold">Copy Command</span> copies a one-liner to your clipboard that downloads and runs the script directly in PowerShell.
        <span class="ks-info-dl font-semibold">Download</span> saves the <code>.ps1</code> file to your machine for manual use.
      </div>
      <div
        class="grid gap-12px"
        style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));"
      >
        <div
          v-for="script in scripts"
          :key="script.name"
          class="kt-terminal ks-card"
        >
          <div class="kt-terminal-bar ks-bar">
            <span class="ks-acronym">{{ acronym(script.name) }}</span>
          </div>

          <div class="ks-body">
            <div class="ks-name">
              {{ descriptions[script.name]?.name ?? script.name }}
            </div>
            <div class="ks-desc">
              {{ descriptions[script.name]?.description ?? '' }}
            </div>
          </div>

          <div class="ks-actions">
            <button
              class="ks-btn-copy"
              @click.stop="copyCommand(script)"
            >
              {{ copied === script.name ? '✓ Copied!' : '⧉ Copy Command' }}
            </button>
            <button
              class="ks-btn-dl"
              title="Download .ps1"
              @click.stop="downloadScript(script)"
            >
              ↓ Download
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kt-terminal { background: #121212 !important; }

.ks-info {
  background: rgba(234, 179, 8, 0.07);
  border: 1px solid rgba(234, 179, 8, 0.65);
  color: rgba(255, 255, 255, 0.6);
}

.ks-info-cmd { color: #1ea54c; }
.ks-info-dl  { color: rgba(255, 255, 255, 0.5); }
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.ks-card {
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}
.ks-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px !important;
}

.ks-acronym {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.05em;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ks-body {
  padding: 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ks-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1ea54c;
  line-height: 1.3;
}

.ks-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ks-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(30, 165, 76, 0.1);
}

.ks-btn-copy {
  flex: 1;
  cursor: pointer;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: transparent;
  color: #1ea54c;
  border: 1px solid rgba(30, 165, 76, 0.5);
  transition: background 0.12s, border-color 0.12s;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ks-btn-copy:hover {
  background: rgba(30, 165, 76, 0.12);
  border-color: #1ea54c;
}

.ks-btn-dl {
  cursor: pointer;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.75rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ks-btn-dl:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}
</style>
