<script setup lang="ts">
interface KillerModule {
  name: string
  expansion?: string
  description: string
  install: string
  repo: string
  functions: { cmd: string, alias?: string }[]
  requirements: string
}

// Add new modules here. Each entry renders one card, in the order listed.
const modules: KillerModule[] = [
  {
    name: 'KillerPivot',
    expansion: 'Per-Identity Validated Org-Toggle',
    description:
      'Switch between Microsoft 365 tenants in PowerShell without firing commands at the wrong one. '
      + 'KillerPivot disables the auth broker to force a real sign-in prompt, then asks the session which '
      + 'tenant it actually landed in and verifies it before you touch anything. Save your tenants once, '
      + 'then pivot between them by name with identity verification built in.',
    install: 'Install-Module KillerPivot -Scope CurrentUser',
    repo: 'https://github.com/SteveTheKiller/KillerPivot',
    functions: [
      { cmd: 'Connect-PivotTenant', alias: 'pivot' },
      { cmd: 'Get-PivotContext', alias: 'pvc' },
      { cmd: 'Disconnect-PivotTenant', alias: 'pvx' },
      { cmd: 'Add-PivotTenant' },
      { cmd: 'Get-PivotTenant' },
      { cmd: 'Remove-PivotTenant' },
    ],
    requirements: 'PowerShell 5.1 & 7 · ExchangeOnlineManagement v3+ · Microsoft.Graph.Authentication (for -Graph)',
  },
];

const copied = ref<string | null>(null);

async function copyInstall(mod: KillerModule) {
  await navigator.clipboard.writeText(mod.install);
  copied.value = mod.name;
  setTimeout(() => {
    if (copied.value === mod.name) {
      copied.value = null;
    }
  }, 2000);
}

function openRepo(mod: KillerModule) {
  window.open(mod.repo, '_blank', 'noopener');
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1600px; margin-top: 0;">
    <div
      class="grid gap-x-16px gap-y-20px"
      style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 560px));"
    >
      <div
        v-for="mod in modules"
        :key="mod.name"
        class="kt-terminal km-card"
      >
        <div class="kt-terminal-bar km-bar">
          <div class="km-heading">
            <span class="km-title">{{ mod.name }}</span>
            <span v-if="mod.expansion" class="km-expansion">{{ mod.expansion }}</span>
          </div>
          <button
            class="km-btn-repo"
            @click.stop="openRepo(mod)"
          >
            Repo
          </button>
        </div>

        <div class="km-body">
          <div class="km-desc">
            {{ mod.description }}
          </div>

          <div class="km-fns">
            <span class="km-label">Commands</span>
            <div class="km-fns-list">
              <code v-for="fn in mod.functions" :key="fn.cmd" class="km-fn">
                {{ fn.cmd }}<template v-if="fn.alias"><span class="km-fn-alias">({{ fn.alias }})</span></template>
              </code>
            </div>
          </div>

          <div class="km-req">
            <span class="km-label">Requires</span>
            <span class="km-req-text">{{ mod.requirements }}</span>
          </div>
        </div>

        <div class="km-install">
          <code class="km-cmd">{{ mod.install }}</code>
          <button
            class="km-btn-copy"
            :class="{ 'is-copied': copied === mod.name }"
            @click.stop="copyInstall(mod)"
          >
            <span class="km-lbl km-lbl-idle">⧉ Copy Install</span>
            <span class="km-lbl km-lbl-done">✓ Copied!</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Card surface comes from the global kt-terminal skin (panel + grain + accent
   top edge) - no local background override, matching Killer Scripts */

.km-card {
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}

.km-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 0 !important;
}

/* Card title: killer font, big and neutral - fixed white/near-black,
   deliberately NOT tied to the accent color (matches Killer Scripts) */
.km-title {
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

html:not(.dark) .km-title {
  color: #1a1a1a;
  text-shadow: none;
}

.km-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

/* PIVOT etc. - the acronym expansion under the module name */
.km-expansion {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  color: rgba(var(--kt-accent-rgb), 0.8);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

html:not(.dark) .km-expansion { color: rgba(var(--kt-accent-rgb), 0.95); }

.km-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.km-desc {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.55;
}

html:not(.dark) .km-desc { color: rgba(0, 0, 0, 0.68); }

.km-label {
  display: block;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 700;
  color: rgba(var(--kt-accent-rgb), 0.85);
  margin-bottom: 6px;
}

.km-fns-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.km-fn {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  padding: 3px 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
}

.km-fn-alias {
  margin-left: 5px;
  color: rgba(var(--kt-accent-rgb), 0.95);
  font-weight: 600;
}

html:not(.dark) .km-fn {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.75);
}

.km-req-text {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

html:not(.dark) .km-req-text { color: rgba(0, 0, 0, 0.55); }

.km-install {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 12px 16px 16px;
}

.km-cmd {
  width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.74rem;
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}

html:not(.dark) .km-cmd {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.14);
  color: rgba(0, 0, 0, 0.8);
}

.km-btn-copy {
  cursor: pointer;
  align-self: flex-end;
  display: inline-grid;
  justify-items: center;
  border-radius: 4px;
  padding: 7px 10px;
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
.km-btn-copy .km-lbl { grid-area: 1 / 1; }
.km-btn-copy .km-lbl-done { visibility: hidden; }
.km-btn-copy.is-copied .km-lbl-idle { visibility: hidden; }
.km-btn-copy.is-copied .km-lbl-done { visibility: visible; }

.km-btn-copy:hover {
  background: rgba(var(--kt-accent-rgb), 0.12);
  border-color: var(--kt-accent);
}

.km-btn-repo {
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.75rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.km-btn-repo:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

html:not(.dark) .km-btn-repo {
  color: rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 0, 0, 0.15);
}

html:not(.dark) .km-btn-repo:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.7);
}
</style>
