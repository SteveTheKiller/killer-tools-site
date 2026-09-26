<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { useStyleStore } from '@/stores/style.store';
import { NEUTRAL_THEMES, THEME_DEFAULT_ACCENT } from '@/themes';

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
const pageDescription = 'Use KillerTools utilities from an AI agent through the upcoming KillerTools MCP server.';
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
        Bring KillerTools into your agent's workflow. Ask it to use a tool, and the MCP server
        returns the result from the same utility code used by this site.
      </p>
      <p class="mcp-status">
        In development: the local server works, but the public endpoint is not live yet.
      </p>
    </section>

    <div class="mcp-grid">
      <section class="mcp-card mcp-surface">
        <h2>First tools</h2>
        <p>
          The local version currently exposes these read-only operations:
        </p>
        <ul>
          <li>Case conversion</li>
          <li>Base64 string encoding and decoding</li>
          <li>Text and ASCII binary conversion</li>
        </ul>
        <p>More website tools will follow as their logic is made available to both the page and the server.</p>
      </section>

      <section class="mcp-card mcp-surface">
        <h2>What changes with MCP</h2>
        <p>
          The website runs these utilities in your browser. A hosted MCP call sends its input to
          the MCP server for processing. The first public release will focus on bounded text utilities.
        </p>
        <p>
          The MCP endpoint will be <code>mcp.killertools.net/mcp</code>. Connection steps will appear
          here after the public server is deployed and tested.
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

.mcp-hero, .mcp-card { padding: 24px; }
.mcp-heading { display: flex; align-items: center; gap: 18px; }
.mcp-mark { width: 90px; height: 90px; flex: none; object-fit: contain; }
.mcp-eyebrow { margin: 0 0 6px; color: var(--kt-accent); font-size: 11px; letter-spacing: 0.16em; }
.mcp-wordmark { display: flex; align-items: center; gap: 8px; margin: 0; }
.mcp-wordmark img { display: block; width: clamp(210px, 28vw, 350px); height: auto; }
.mcp-wordmark span { font-family: 'KillerScan', 'Courier New', monospace; font-size: clamp(32px, 4vw, 52px); color: var(--kt-accent); }
h2 { margin: 0 0 14px; color: var(--kt-accent); font-family: 'KillerScan', 'Courier New', monospace; font-size: 24px; font-weight: normal; }
.mcp-lead { max-width: 760px; font-size: 16px; line-height: 1.6; margin: 18px 0; }
.mcp-status { color: var(--kt-accent); margin: 0; font-size: 13px; }
.mcp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.mcp-card p, .mcp-card li { font-size: 13px; line-height: 1.65; }
.mcp-card p { margin: 0 0 14px; }
.mcp-card p:last-child { margin-bottom: 0; }
.mcp-card ul { margin: 0 0 14px; padding-left: 22px; }
.mcp-card li { margin-bottom: 4px; }
code { color: var(--kt-accent); overflow-wrap: anywhere; }

@media (max-width: 720px) {
  .mcp-grid { grid-template-columns: 1fr; }
  .mcp-hero, .mcp-card { padding: 20px; }
  .mcp-heading { gap: 10px; }
  .mcp-mark { width: 48px; height: 48px; }
  .mcp-wordmark img { width: clamp(150px, 46vw, 250px); }
  .mcp-wordmark span { font-size: clamp(26px, 7vw, 40px); }
}

.mcp-page .mcp-lead,
.mcp-page .mcp-card p,
.mcp-page .mcp-card li { color: rgba(255, 255, 255, 0.85); }
html:not(.dark) .mcp-page .mcp-lead,
html:not(.dark) .mcp-page .mcp-card p,
html:not(.dark) .mcp-page .mcp-card li { color: rgba(0, 0, 0, 0.82); }
</style>
