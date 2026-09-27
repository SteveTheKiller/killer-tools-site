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

function copyWithSelection(value: string) {
  const input = document.createElement('textarea');
  input.value = value;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  try {
    return document.execCommand('copy');
  }
  catch {
    return false;
  }
  finally {
    input.remove();
  }
}

async function copyText(value: string, label: string) {
  copyStatus.value = 'Copying...';
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.value = `${label} copied`;
    return true;
  }
  catch {
    const copied = copyWithSelection(value);
    copyStatus.value = copied ? `${label} copied` : `Copy failed. Copy this instead: ${value}`;
    return copied;
  }
}

async function copyAndOpenClaude() {
  const copiedNow = copyWithSelection(endpoint);
  const copyPromise = copiedNow ? Promise.resolve(true) : copyText(endpoint, 'Server URL');
  const claudeTab = window.open('about:blank', '_blank');
  if (await copyPromise) {
    copyStatus.value = 'Server URL copied';
    if (claudeTab) {
      claudeTab.opener = null;
      claudeTab.location.replace('https://claude.ai/customize/connectors');
    }
    else {
      copyStatus.value = 'Server URL copied. Allow pop-ups to open Claude.';
    }
  }
  else {
    claudeTab?.close();
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
        <span class="mcp-icon-pair" aria-hidden="true">
          <img class="mcp-mark" src="/brand/mcp.png?v=ac7ee189" alt="">
          <img class="mcp-app-mark" src="/app-icon-512.png" alt="">
        </span>
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
        Put KillerTools in your agent's toolkit. Connect once, then ask it to calculate a subnet,
        check DNS records, research a CVE, parse email headers, build a PowerShell command,
        convert JSON to CSV, or decode Base64.
      </p>
      <p class="mcp-status">
        KillerMCP supports all 81 KillerTools website tools.
      </p>
    </section>

    <div class="mcp-workspace">
      <div class="mcp-setup-column">
    <section class="mcp-connect mcp-surface" aria-labelledby="mcp-connect-title">
      <p class="mcp-eyebrow">
        ONE INSTALLER / ONE CONNECTION
      </p>
      <div class="mcp-title-row">
        <h2 id="mcp-connect-title">
          <span class="mcp-install-label">Install</span> <span class="killermcp-wordmark">Killer<span>MCP</span></span>
        </h2>
        <a class="mcp-github" href="https://github.com/SteveTheKiller/KillerMCP" target="_blank" rel="noopener" aria-label="KillerMCP on GitHub" title="KillerMCP on GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.44 9.77 8.2 11.36.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" /></svg>
        </a>
      </div>
      <p>
        KillerMCP includes all 81 KillerTools utilities plus tools from supported Killer apps in one local connection. You will not need a separate KillerTools installer, a source checkout, Node, or a list of commands.
      </p>
      <a class="mcp-download" href="https://github.com/SteveTheKiller/KillerMCP/releases/latest/download/KillerMCP-Setup.exe">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
        <span>Download for Windows</span>
      </a>
      <div class="mcp-installer-meta">
        <span>Version 0.1.0</span><span>36.6 MiB</span><span>Digitally signed</span><a href="https://github.com/SteveTheKiller/KillerMCP/releases/tag/v0.1.0" target="_blank" rel="noopener">Hosted on GitHub Releases</a>
      </div>
      <ol class="mcp-install-steps">
        <li><strong>Download and run KillerMCP Setup.</strong> The installer is signed by Open Source Developer Stephen Riley and published through GitHub Releases.</li>
        <li><strong>Let setup connect your agent.</strong> It installs the shared runtime and registers KillerMCP with Codex, Claude Code, Claude Desktop, Cursor, GitHub Copilot, Gemini CLI, and Windsurf when found.</li>
        <li><strong>Open a new agent chat and ask.</strong> KillerMCP makes all 81 KillerTools utilities available through the same connection.</li>
      </ol>
      <p class="mcp-eyebrow mcp-hosted-heading">
        OPTIONAL HOSTED CONNECTION
      </p>
      <p>
        Do not want to install anything? Connect directly to the hosted KillerTools server for 64 web based utilities. The remaining 17 KillerTools utilities and all desktop app tools require the installed KillerMCP runtime.
      </p>
      <div class="mcp-install-actions">
        <a class="mcp-action" :href="cursorInstallUrl">Add to Cursor</a>
        <a class="mcp-action" :href="vscodeInstallUrl">Add to VS Code</a>
        <button type="button" class="mcp-action" @click="copyAndOpenClaude">
          Copy URL and open Claude
        </button>
        <button type="button" class="mcp-action" @click="copyText(codexCommand, 'Codex command')">
          Copy Codex setup command
        </button>
        <button type="button" class="mcp-action" @click="copyText(claudeCodeCommand, 'Claude Code command')">
          Copy Claude Code setup command
        </button>
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
      <p v-if="copyStatus" class="mcp-feedback" role="status" aria-live="polite">
        {{ copyStatus }}
      </p>
      <p class="mcp-eyebrow mcp-usage-heading">
        AFTER INSTALLING OR CONNECTING
      </p>
      <p>
        The shortest useful prompt is <code>killer &lt;task&gt;</code>. For example: <code>killer domain search thekiller.net</code>.
      </p>
      <p>
        Your agent can infer the matching KillerTools or Killer app tool from the task and available context. Use <code>KillerTools</code>, <code>killerpdf</code>, <code>killerscan</code>, or another app name only when you want to make the target explicit. You do not need underscores, an operation name, or a slash command.
      </p>
    </section>
    <section class="mcp-card mcp-surface">
      <h2>How the Cloudflare Worker works</h2>
      <p>The public endpoint is an open-source streamable HTTP MCP server deployed separately from the website. Your MCP client sends a tool name and bounded arguments to <code>https://mcp.killertools.net</code>. The Worker validates the request, runs the selected utility, and returns the result.</p>
      <p>Most calculations and conversions run directly in the Worker. DNS queries use Cloudflare DNS over HTTPS. Domain registration follows the IANA RDAP directory. CVE, GIF, and catalog searches contact their public providers and can fail when those providers are unavailable or rate limited.</p>
    </section>
      </div>
      <div class="mcp-detail-column">

    <section class="mcp-card mcp-surface" aria-labelledby="mcp-examples-title">
      <h2 id="mcp-examples-title">
        Try asking
      </h2>
      <p>
        Start with <code>killer</code> and describe the result you want. The app or tool name is optional when the task is clear.
      </p>
      <div class="mcp-example-grid">
        <code>killer domain search thekiller.net</code>
        <code>killer calculate 192.168.10.0/24</code>
        <code>killer look up Windows event 4625</code>
        <code>killer research CVE-2025-53770</code>
        <code>killer parse these email headers</code>
        <code>killer build a PowerShell command to list stopped services</code>
        <code>killer convert this JSON to CSV</code>
        <code>killer compare these two JSON documents</code>
        <code>killer generate an SPF record for example.com</code>
        <code>killer decode this Base64 text</code>
        <code>killer identify this M365 SKU</code>
        <code>killer calculate a 30 second exposure with this ND filter</code>
      </div>
    </section>

    <div class="mcp-grid">
      <section class="mcp-card mcp-surface mcp-card-wide">
        <h2>
          What can it do?
        </h2>
        <p>
          Ask in plain language. Your agent discovers the available tools and their inputs, then calls the ones it needs. For example, it can:
        </p>
        <ul>
          <li>Calculate IPv4 subnets, expand address ranges, generate IPv6 ULA prefixes, and look up MAC vendors.</li>
          <li>Check DNS records and domain registration, search CVEs, and identify ports and protocols.</li>
          <li>Parse email headers, generate SPF or DMARC records, and look up Exchange NDR messages.</li>
          <li>Find Windows error and event IDs, Group Policy settings, and M365 license SKUs.</li>
          <li>Search PowerShell cmdlets and assemble commands for you to review before running.</li>
          <li>Format JSON and XML, convert JSON to CSV or among JSON, YAML, and TOML, decode Base64, compare documents, and test regular expressions.</li>
          <li>Generate QR codes, UUIDs, meta tags, and placeholders, or work through photo exposure and film calculations.</li>
          <li>Convert case, dates, times, temperatures, colors, number bases, Roman numerals, binary text, NATO spelling, and phone formats.</li>
          <li>Format SQL, YAML, TOML, Markdown, HTML entities, and structured data, or calculate percentages, cron schedules, and chmod values.</li>
          <li>Search emoji, GIFs, KillerScripts, and Killer modules, or inspect URLs, user agents, HTTP status codes, and text statistics.</li>
        </ul>
      </section>
      <section class="mcp-card mcp-surface mcp-card-wide">
        <h2>Hosted and local coverage</h2>
        <div class="mcp-coverage-grid">
          <p><strong>Hosted Worker</strong><span>64 browser safe utilities with 74 operations. No installation.</span></p>
          <p><strong>Installed KillerMCP</strong><span>All 81 KillerTools utilities with 94 operations, plus detected Killer apps.</span></p>
          <p><strong>Browser companions</strong><span>Camera, device, editor, and signature tools open a private localhost page.</span></p>
        </div>
      </section>
    </div>

    <div class="mcp-grid">
      <section class="mcp-card mcp-surface">
        <h2>
          Where does the data go?
        </h2>
        <p>
          The installed KillerMCP runtime runs on your computer. Some network and reference lookups still contact their public data sources. Your agent receives the inputs and results needed to complete the request.
        </p>
        <p>
          The optional hosted connection sends tool inputs to the KillerTools Cloudflare Worker. It has no sign-in, limits request bodies to 64 KiB, applies bounded schemas, and rate limits each connecting IP. Do not send passwords, private files, tokens, or client data through the hosted connection.
        </p>
        <p>
          Local file, browser, password, token, encryption, hashing, OTP, BIP39, and key generation tools stay off the public Worker. They run through installed KillerMCP, but the MCP client and model provider may still receive the inputs and results.
        </p>
      </section>
      <section class="mcp-card mcp-surface">
        <h2>Open source and current limits</h2>
        <p>
          The <a href="https://github.com/SteveTheKiller/killer-tools-site" target="_blank" rel="noopener">KillerTools source</a> contains the public Worker, local KillerTools bundle, operation map, validation schemas, and coverage checks. The <a href="https://github.com/SteveTheKiller/KillerMCP" target="_blank" rel="noopener">KillerMCP source</a> contains the shared local host, desktop app adapters, installer, and integration checks.
        </p>
        <p>
          External lookup results depend on their sources. Local tools only receive paths or values supplied in a tool call. Base64 file decoding creates a new file and refuses to overwrite an existing one. Camera capture still requires a manual browser permission and hardware verification. KillerMCP v0.1.0 is signed, timestamped, and published through GitHub Releases.
        </p>
      </section>
    </div>

      </div>
    </div>
  </main>
</template>

<style scoped>
.mcp-page {
  width: min(100%, 1360px);
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
  transition: transform 0.12s, box-shadow 0.12s, border-color 0.15s;
}

.mcp-surface:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--kt-accent-rgb), 0.75);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
}

html:not(.dark) .mcp-surface:hover {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
}

.mcp-surface::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 2px;
  background: var(--kt-accent-sel, var(--kt-accent));
}

.mcp-hero { padding: 22px; }
.mcp-card, .mcp-connect { padding: 18px 20px; }
.mcp-workspace { display: grid; grid-template-columns: minmax(300px, .72fr) minmax(0, 1.55fr); gap: 16px; align-items: start; }
.mcp-setup-column, .mcp-detail-column { display: grid; gap: 16px; }
.mcp-title-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.mcp-title-row h2 { margin: 0; }
.mcp-github { display: grid; place-items: center; flex: 0 0 48px; width: 48px; height: 48px; margin: -4px 0; color: inherit; border-radius: 50%; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, .42)); transition: transform .12s, color .12s, filter .12s; }
.mcp-github svg { width: 30px; height: 30px; fill: currentColor; }
.mcp-github:hover, .mcp-github:focus-visible { color: var(--kt-accent); transform: translateY(-2px) scale(1.08); filter: drop-shadow(0 7px 8px rgba(0, 0, 0, .48)); }
.mcp-heading { display: flex; align-items: center; gap: 0; }
.mcp-icon-pair { position: relative; flex: 0 0 106px; width: 106px; height: 94px; }
.mcp-mark { position: absolute; left: 0; top: 0; width: 90px; height: 90px; object-fit: contain; }
.mcp-app-mark { position: absolute; right: 14px; bottom: 14px; width: 46px; height: 46px; object-fit: contain; filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.45)); }
.mcp-eyebrow { margin: 0 0 6px; color: var(--kt-accent); font-size: 11px; letter-spacing: 0.16em; }
.mcp-wordmark { display: flex; align-items: center; gap: 8px; margin: 0; }
.mcp-wordmark img { display: block; width: clamp(210px, 28vw, 350px); height: auto; }
.mcp-wordmark span { font-family: 'KillerScan', 'Courier New', monospace; font-size: clamp(32px, 4vw, 52px); color: #fff; }
html:not(.dark) .mcp-wordmark span { color: #111; }
h2 { margin: 0 0 14px; color: var(--kt-accent); font-family: 'KillerScan', 'Courier New', monospace; font-size: 24px; font-weight: normal; }
.mcp-lead { font-size: 16px; line-height: 1.6; margin: 18px 0; }
.mcp-status { color: var(--kt-accent); margin: 0; font-size: 15px; }
.mcp-connect h2 { margin-bottom: 8px; }
.mcp-install-label { color: var(--kt-text, #fff); }
.killermcp-wordmark { display: inline-block; white-space: nowrap; color: var(--kt-text, #fff); font-weight: normal; }
.killermcp-wordmark span { display: inline-block; color: var(--kt-accent); font-size: 1.3em; line-height: 1; vertical-align: -.03em; -webkit-text-stroke: .012em rgba(0, 0, 0, .7); text-shadow: 0 .08em 0 rgba(0, 0, 0, .5), 0 .16em .24em rgba(0, 0, 0, .35); }
html:not(.dark) .killermcp-wordmark { color: var(--kt-text, #111); }
html:not(.dark) .mcp-install-label { color: var(--kt-text, #111); }
.mcp-connect p { font-size: 13px; line-height: 1.6; }
.mcp-connect p:not(.mcp-eyebrow):not(.mcp-feedback) { margin: 0 0 10px; }
.mcp-install-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 12px; }
.mcp-copy-row { display: flex; align-items: stretch; gap: 10px; }
.mcp-value { display: block; overflow-wrap: anywhere; border: 1px solid var(--kt-chrome-border, #1f1f1f); border-radius: 4px; background: var(--kt-bg, transparent); padding: 12px 14px; font-size: 13px; }
.mcp-value { flex: 1; }
.mcp-action { display: inline-flex; align-items: center; justify-content: center; min-height: 43px; padding: 9px 16px; border: 1px solid var(--kt-accent); border-radius: 4px; background: transparent; color: var(--kt-accent); font: inherit; font-size: 13px; cursor: pointer; text-align: center; text-decoration: none; }
.mcp-action:hover, .mcp-action:focus-visible { background: var(--kt-accent); color: var(--kt-modal, #0a0a0a); }
.mcp-action:focus-visible { outline: 2px solid var(--kt-accent); outline-offset: 3px; }
.mcp-feedback { margin: 8px 0 0; color: var(--kt-accent); }
.mcp-download { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; margin-top: 2px; padding: 12px 18px; border-radius: 6px; background: var(--kt-accent); color: var(--kt-modal, #0a0a0a) !important; font-size: 15px; font-weight: 700; box-shadow: 0 8px 20px rgba(0, 0, 0, .35); transition: filter .15s, transform .1s, box-shadow .15s; }
.mcp-download:hover, .mcp-download:focus-visible { filter: brightness(1.18); transform: translateY(-1px); box-shadow: 0 12px 28px rgba(0, 0, 0, .5); }
.mcp-download:active { transform: translateY(1px); }
.mcp-download:focus-visible { outline: 2px solid var(--kt-text, #fff); outline-offset: 3px; }
.mcp-download svg { width: 18px; height: 18px; fill: currentColor; }
.mcp-installer-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 8px 0 14px; color: var(--kt-muted, #aaa); font: 11.5px/1.45 Consolas, monospace; }
.mcp-installer-meta a { color: var(--kt-accent); font-weight: 400; }
.mcp-install-steps { margin: 0; padding: 0; list-style: none; counter-reset: install; display: grid; gap: 10px; }
.mcp-install-steps li { position: relative; min-height: 40px; padding: 7px 10px 7px 50px; font-size: 13px; line-height: 1.6; }
.mcp-install-steps li::before { counter-increment: install; content: counter(install); position: absolute; left: 0; top: 3px; display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--kt-accent); border-radius: 50%; color: var(--kt-accent); font-size: 18px; }
.mcp-hosted-heading { margin-top: 18px; }
.mcp-usage-heading { margin-top: 16px; }
.mcp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }
.mcp-card-wide { grid-column: 1 / -1; }
.mcp-coverage-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.mcp-coverage-grid p { margin: 0; }
.mcp-coverage-grid strong, .mcp-coverage-grid span { display: block; }
.mcp-coverage-grid strong { margin-bottom: 5px; }
.mcp-card p, .mcp-card li { font-size: 13px; line-height: 1.65; }
.mcp-card p { margin: 0 0 14px; }
.mcp-card p:last-child { margin-bottom: 0; }
.mcp-card ul { margin: 0 0 14px; padding-left: 22px; }
.mcp-card li { margin-bottom: 4px; }
.mcp-example-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.mcp-example-grid code { display: block; padding: 12px 14px; border: 1px solid var(--kt-chrome-border, #1f1f1f); border-radius: 4px; background: var(--kt-bg, transparent); color: inherit; line-height: 1.5; }
code { color: var(--kt-accent); overflow-wrap: anywhere; }
.mcp-card a { color: var(--kt-accent); }

@media (max-width: 720px) {
  .mcp-workspace { grid-template-columns: 1fr; }
  .mcp-grid { grid-template-columns: 1fr; }
  .mcp-coverage-grid { grid-template-columns: 1fr; }
  .mcp-example-grid { grid-template-columns: 1fr; }
  .mcp-hero, .mcp-card, .mcp-connect { padding: 20px; }
  .mcp-copy-row { flex-direction: column; }
  .mcp-heading { gap: 0; }
  .mcp-icon-pair { flex-basis: 62px; width: 62px; height: 56px; }
  .mcp-mark { width: 52px; height: 52px; }
  .mcp-app-mark { right: 8px; bottom: 8px; width: 27px; height: 27px; }
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
