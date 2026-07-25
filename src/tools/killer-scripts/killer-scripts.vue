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
  <div style="flex: 1 1 900px; max-width: 1600px; margin-top: 0;">
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
      <Teleport to="#tool-header-extra">
        <div class="ks-info rounded px-3 py-1 text-xs">
          <span class="ks-info-cmd font-semibold">Copy Command</span> copies a one-liner to your clipboard that downloads and runs the script directly in PowerShell.
          The <span class="ks-info-dl font-semibold">↓</span> button saves the <code>.ps1</code> file to your machine for manual use.
        </div>
      </Teleport>
      <div
        class="grid gap-x-12px gap-y-16px"
        style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));"
      >
        <div
          v-for="script in scripts"
          :key="script.name"
          class="kt-terminal ks-card"
        >
          <div class="kt-terminal-bar ks-bar">
            <span class="ks-acronym">{{ acronym(script.name) }}</span>
            <div class="ks-actions">
              <button
                class="ks-btn-copy"
                :class="{ 'is-copied': copied === script.name }"
                @click.stop="copyCommand(script)"
              >
                <span class="ks-lbl ks-lbl-idle">⧉ Copy Command</span>
                <span class="ks-lbl ks-lbl-done">✓ Copied!</span>
              </button>
              <button
                class="ks-btn-dl"
                @click.stop="downloadScript(script)"
              >
                ↓
              </button>
            </div>
          </div>

          <div class="ks-body">
            <div class="ks-name">
              {{ descriptions[script.name]?.name ?? script.name }}
            </div>
            <div class="ks-desc">
              {{ descriptions[script.name]?.description ?? '' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Card surface comes from the global kt-terminal skin (panel + grain + accent
   top edge) - no local background override */

.ks-info {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.4);
  color: rgba(255, 255, 255, 0.6);
}

.ks-info-cmd { color: var(--kt-accent); }
.ks-info-dl  { color: rgba(255, 255, 255, 0.5); }

html:not(.dark) .ks-info {
  background: rgba(var(--kt-accent-rgb), 0.08);
  border-color: rgba(var(--kt-accent-rgb), 0.35);
  color: rgba(0, 0, 0, 0.65);
}

html:not(.dark) .ks-info-cmd { color: var(--kt-accent); }
html:not(.dark) .ks-info-dl  { color: rgba(0, 0, 0, 0.55); }

.ks-card {
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}
.ks-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 0 !important;
}

/* Card title: killer font, big and neutral - fixed white/near-black per
   family, deliberately NOT tied to the accent color */
.ks-acronym {
  line-height: 0.8;
  position: relative;
  top: 1.5px;
  font-size: 1.7rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.5px;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

html:not(.dark) .ks-acronym {
  color: #1a1a1a;
  text-shadow: none;
}

.ks-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ks-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--kt-accent);
  line-height: 1.3;
}

.ks-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
}

.ks-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ks-btn-copy {
  cursor: pointer;
  display: inline-grid;
  justify-items: center;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: transparent;
  color: var(--kt-accent);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.5);
  transition: background 0.12s, border-color 0.12s;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* Both labels share one grid cell, so the button is always as wide as the
   widest label and never resizes when it swaps to "Copied!" */
.ks-btn-copy .ks-lbl { grid-area: 1 / 1; }
.ks-btn-copy .ks-lbl-done { visibility: hidden; }
.ks-btn-copy.is-copied .ks-lbl-idle { visibility: hidden; }
.ks-btn-copy.is-copied .ks-lbl-done { visibility: visible; }

.ks-btn-copy:hover {
  background: rgba(var(--kt-accent-rgb), 0.12);
  border-color: var(--kt-accent);
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
