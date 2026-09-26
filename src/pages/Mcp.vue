<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { useStyleStore } from '@/stores/style.store';
import { NEUTRAL_THEMES, THEME_DEFAULT_ACCENT } from '@/themes';

const endpoint = 'https://mcp.killertools.net';
const codexCommand = `codex mcp add killertools --url ${endpoint}`;
const claudeCodeCommand = `claude mcp add --transport http killertools ${endpoint}`;
const cursorInstallUrl = `cursor://anysphere.cursor-deeplink/mcp/install?name=killertools&config=${encodeURIComponent(btoa(JSON.stringify({ url: endpoint })))}`;
const vscodeInstallUrl = `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: 'killertools', type: 'http', url: endpoint }))}`;
const copyStatus = ref('');

async function copyText(value: string, label: string) {
  copyStatus.value = 'Copying...';
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.value = `${label} copied`;
  }
  catch {
    copyStatus.value = `Copy failed. Copy this instead: ${value}`;
  }
}

const styleStore = useStyleStore();
const wordmarkSrc = computed(() => {
  const theme = styleStore.ktTheme;
  if (!NEUTRAL_THEMES.includes(theme)) {
    return `/brand/killertools-wordmark-${theme}.png`;
  }
  const accent = styleStore.ktAccent || THEME_DEFAULT_ACCENT[theme] || 'teal';
  return `/brand/killertools-wordmark-${accent}-${theme}.png`;
});

const pageTitle = 'KillerMCP';
const pageDescription = 'Use KillerTools utilities from an AI agent through KillerTools MCP.';
const pageUrl = 'https://killertools.net/mcp';

useHead({
  title: pageTitle,
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:url', content: pageUrl },
    { property: 'og:type', content: 'website' },
  ],
});
</script>

<template>
  <main class="mcp-page">
    <section class="mcp-hero mcp-surface">
      <div class="mcp-heading">
        <img class="mcp-mark" src="/brand/mcp.png" alt="" aria-hidden="true">
        <div>
          <p class="mcp-eyebrow">
            KILLERTOOLS / AGENTS
          </p>
          <h1 class="mcp-wordmark" aria-label="KillerTools MCP">
            <img :src="wordmarkSrc" alt="" aria-hidden="true">
            <span>MCP</span>
          </h1>
        </div>
      </div>
      <p class="mcp-lead">
        Put KillerTools in your agent's toolkit. Connect once, then ask for a subnet calculation,
        a domain lookup, a text conversion, or any of the other public utilities.
      </p>
      <p class="mcp-status">
        Public server: 64 of 81 website tools. Optional local connector: all 81.
      </p>
    </section>

    <section class="mcp-connect mcp-surface" aria-labelledby="mcp-connect-title">
      <p class="mcp-eyebrow">
        ONE URL / ANY MCP CLIENT
      </p>
      <h2 id="mcp-connect-title">
        Add KillerTools to your agent
      </h2>
      <p>
        Choose your app. Cursor and VS Code can open their install prompts directly.
      </p>
      <div class="mcp-install-actions">
        <a class="mcp-action" :href="cursorInstallUrl">Add to Cursor</a>
        <a class="mcp-action" :href="vscodeInstallUrl">Add to VS Code</a>
      </div>
      <p>
        Using another MCP client? Copy the server URL.
      </p>
      <div class="mcp-copy-row">
        <code class="mcp-value">{{ endpoint }}</code>
        <button type="button" class="mcp-action" @click="copyText(endpoint, 'Server URL')">
          Copy URL
        </button>
      </div>
      <p class="mcp-feedback" role="status" aria-live="polite">
        {{ copyStatus }}
      </p>
    </section>

    <div class="mcp-client-grid">
      <section class="mcp-card mcp-surface">
        <h2>
          Claude
        </h2>
        <p>
          Open your connectors and add the copied server URL as a custom connector.
        </p>
        <a class="mcp-action mcp-link-action" href="https://claude.ai/customize/connectors" target="_blank" rel="noopener noreferrer" @click="copyText(endpoint, 'Server URL')">
          Copy URL and open Claude
        </a>
      </section>

      <section class="mcp-card mcp-surface">
        <h2>
          Codex
        </h2>
        <p>
          Copy one command to add KillerTools in Codex.
        </p>
        <button type="button" class="mcp-action" @click="copyText(codexCommand, 'Codex command')">
          Copy Codex setup command
        </button>
      </section>

      <section class="mcp-card mcp-surface">
        <h2>
          Claude Code
        </h2>
        <p>
          Copy one command to add KillerTools in Claude Code.
        </p>
        <button type="button" class="mcp-action" @click="copyText(claudeCodeCommand, 'Claude Code command')">
          Copy Claude Code setup command
        </button>
      </section>
    </div>

    <div class="mcp-grid">
      <section class="mcp-card mcp-surface">
        <h2>
          What can it do?
        </h2>
        <p>
          Ask your agent to use KillerTools for IP calculations, DNS and domain lookups, CVE searches, email header analysis, data conversion, PowerShell command building, and more. The agent discovers each tool's description and inputs automatically.
        </p>
        <p>
          The full local connector adds file, browser, and private operations. <a href="https://github.com/SteveTheKiller/killer-tools-site/blob/main/mcp/README.md" target="_blank" rel="noopener noreferrer">Read the local setup guide</a>.
        </p>
      </section>
      <section class="mcp-card mcp-surface">
        <h2>
          Where does the data go?
        </h2>
        <p>
          The website runs most utilities in your browser. Public MCP calls send inputs to the Cloudflare Worker. Some lookups also contact external data sources. Do not send passwords, private files, tokens, or client data to the public server.
        </p>
        <p>
          Local file, secret, and browser operations run on your computer through the optional local connector. Your agent client may still receive those inputs and results.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.mcp-page {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 14px 0 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.mcp-surface {
  position: relative;
  overflow: hidden;
  background: var(--kt-grain-img, url('/grain-a12.png')) repeat, var(--kt-modal, #0a0a0a);
  background-size: 256px 256px, auto;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 6px;
}

.mcp-surface::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 2px;
  background: var(--kt-accent-sel, var(--kt-accent));
}

.mcp-hero, .mcp-card, .mcp-connect { padding: 24px; }
.mcp-heading { display: flex; align-items: center; gap: 0; }
.mcp-mark { width: 90px; height: 90px; flex: none; object-fit: contain; }
.mcp-eyebrow { margin: 0 0 6px; color: var(--kt-accent); font-size: 11px; letter-spacing: 0.16em; }
.mcp-wordmark { display: flex; align-items: center; gap: 8px; margin: 0; }
.mcp-wordmark img { display: block; width: clamp(210px, 28vw, 350px); height: auto; }
.mcp-wordmark span { font-family: 'KillerScan', 'Courier New', monospace; font-size: clamp(32px, 4vw, 52px); color: var(--kt-accent); }
h2 { margin: 0 0 14px; color: var(--kt-accent); font-family: 'KillerScan', 'Courier New', monospace; font-size: 24px; font-weight: normal; }
.mcp-lead { font-size: 16px; line-height: 1.6; margin: 18px 0; }
.mcp-status { color: var(--kt-accent); margin: 0; font-size: 13px; }
.mcp-connect h2 { margin-bottom: 8px; }
.mcp-connect p { font-size: 13px; line-height: 1.6; }
.mcp-install-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
.mcp-copy-row { display: flex; align-items: stretch; gap: 10px; margin-top: 16px; }
.mcp-value { display: block; overflow-wrap: anywhere; border: 1px solid var(--kt-chrome-border, #1f1f1f); border-radius: 4px; background: var(--kt-bg, transparent); padding: 12px 14px; font-size: 13px; }
.mcp-value { flex: 1; }
.mcp-action { display: inline-flex; align-items: center; justify-content: center; min-height: 43px; padding: 9px 16px; border: 1px solid var(--kt-accent); border-radius: 4px; background: transparent; color: var(--kt-accent); font: inherit; font-size: 13px; cursor: pointer; text-align: center; text-decoration: none; }
.mcp-action:hover, .mcp-action:focus-visible { background: var(--kt-accent); color: var(--kt-modal, #0a0a0a); }
.mcp-action:focus-visible { outline: 2px solid var(--kt-accent); outline-offset: 3px; }
.mcp-feedback { min-height: 1.6em; margin: 7px 0 0; color: var(--kt-accent); }
.mcp-client-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.mcp-client-grid .mcp-card { display: flex; flex-direction: column; align-items: flex-start; }
.mcp-client-grid .mcp-card .mcp-action { margin-top: auto; }
.mcp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.mcp-card p, .mcp-card li { font-size: 13px; line-height: 1.65; }
.mcp-card p { margin: 0 0 14px; }
.mcp-card p:last-child { margin-bottom: 0; }
.mcp-card ul { margin: 0 0 14px; padding-left: 22px; }
.mcp-card li { margin-bottom: 4px; }
code { color: var(--kt-accent); overflow-wrap: anywhere; }
.mcp-card a { color: var(--kt-accent); }

@media (max-width: 720px) {
  .mcp-grid, .mcp-client-grid { grid-template-columns: 1fr; }
  .mcp-hero, .mcp-card, .mcp-connect { padding: 20px; }
  .mcp-copy-row { flex-direction: column; }
  .mcp-heading { gap: 0; }
  .mcp-mark { width: 48px; height: 48px; }
  .mcp-wordmark img { width: clamp(150px, 46vw, 250px); }
  .mcp-wordmark span { font-size: clamp(26px, 7vw, 40px); }
}

.mcp-page .mcp-lead,
.mcp-page .mcp-connect p:not(.mcp-eyebrow):not(.mcp-feedback),
.mcp-page .mcp-card p,
.mcp-page .mcp-card li { color: rgba(255, 255, 255, 0.85); }
html:not(.dark) .mcp-page .mcp-lead,
html:not(.dark) .mcp-page .mcp-connect p:not(.mcp-eyebrow):not(.mcp-feedback),
html:not(.dark) .mcp-page .mcp-card p,
html:not(.dark) .mcp-page .mcp-card li { color: rgba(0, 0, 0, 0.82); }
</style>
