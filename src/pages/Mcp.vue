<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';

const endpoint = 'https://mcp.killertools.net';
const codexCommand = `codex mcp add killertools --url ${endpoint}`;
const claudeCodeCommand = `claude mcp add --transport http killertools ${endpoint}`;
const cursorInstallUrl = `cursor://anysphere.cursor-deeplink/mcp/install?name=killertools&config=${encodeURIComponent(btoa(JSON.stringify({ url: endpoint })))}`;
const vscodeInstallUrl = `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: 'killertools', type: 'http', url: endpoint }))}`;
const { t } = useI18n();
const copyStatus = ref('');
const installerVersion = ref('0.2.1');
const installerSize = ref('9.7 MiB');
const installerReleaseUrl = ref('https://github.com/SteveTheKiller/KillerMCP/releases/tag/v0.2.1');

onMounted(async () => {
  try {
    const response = await fetch(`https://api.github.com/repos/SteveTheKiller/KillerMCP/releases/latest?cache=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) {
      return;
    }
    const release = await response.json();
    const asset = release.assets?.find((item: { name?: string }) => item.name === 'KillerMCP-Setup.exe');
    if (!asset) {
      return;
    }
    installerVersion.value = String(release.tag_name || '').replace(/^v/, '') || installerVersion.value;
    installerSize.value = `${(asset.size / 1048576).toFixed(1)} MiB`;
    installerReleaseUrl.value = release.html_url || installerReleaseUrl.value;
  }
  catch {
    // Keep the packaged release metadata when GitHub is unavailable.
  }
});

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
  copyStatus.value = t('pages.mcp.copy.copying');
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.value = t('pages.mcp.copy.copied', { label });
    return true;
  }
  catch {
    const copied = copyWithSelection(value);
    copyStatus.value = copied ? t('pages.mcp.copy.copied', { label }) : t('pages.mcp.copy.failed', { value });
    return copied;
  }
}

async function copyAndOpenClaude() {
  const copiedNow = copyWithSelection(endpoint);
  const copyPromise = copiedNow ? Promise.resolve(true) : copyText(endpoint, t('pages.mcp.labels.serverUrl'));
  const claudeTab = window.open('about:blank', '_blank');
  if (await copyPromise) {
    copyStatus.value = t('pages.mcp.copy.copied', { label: t('pages.mcp.labels.serverUrl') });
    if (claudeTab) {
      claudeTab.opener = null;
      claudeTab.location.replace('https://claude.ai/customize/connectors');
    }
    else {
      copyStatus.value = t('pages.mcp.copy.popups');
    }
  }
  else {
    claudeTab?.close();
  }
}

const pageTitle = 'KillerMCP';
const pageDescription = computed(() => t('pages.mcp.description'));
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
      <a class="mcp-github" href="https://github.com/SteveTheKiller/KillerMCP" target="_blank" rel="noopener" :aria-label="t('pages.mcp.github')" :title="t('pages.mcp.github')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.44 9.77 8.2 11.36.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" /></svg>
      </a>
      <div class="mcp-heading">
        <span class="mcp-icon-pair" aria-hidden="true">
          <img class="mcp-mark" src="/brand/mcp.png?v=ac7ee189" alt="">
        </span>
        <div>
          <p class="mcp-eyebrow">
            {{ t('pages.mcp.eyebrow.agents') }}
          </p>
          <h1 class="mcp-wordmark">
            Killer<span>MCP</span>
          </h1>
        </div>
      </div>
      <p class="mcp-lead">
        {{ t('pages.mcp.lead') }}
      </p>
      <p class="mcp-status">
        {{ t('pages.mcp.status') }}
      </p>
    </section>

    <div class="mcp-workspace">
      <div class="mcp-setup-column">
        <section class="mcp-connect mcp-surface" aria-labelledby="mcp-connect-title">
          <p class="mcp-eyebrow">
            {{ t('pages.mcp.eyebrow.oneInstaller') }}
          </p>
          <div class="mcp-title-row">
            <h2 id="mcp-connect-title">
              <span class="mcp-install-label">{{ t('pages.mcp.install') }}</span> <span class="killermcp-wordmark">Killer<span>MCP</span></span>
            </h2>
          </div>
          <p>
            {{ t('pages.mcp.intro') }}
          </p>
          <a class="mcp-download" href="https://github.com/SteveTheKiller/KillerMCP/releases/latest/download/KillerMCP-Setup.exe">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
            <span>{{ t('pages.mcp.download') }}</span>
          </a>
          <div class="mcp-installer-meta">
            <span>{{ t('pages.mcp.meta.version', { version: installerVersion }) }}</span><span>{{ installerSize }}</span><span>.NET 10</span><span>{{ t('pages.mcp.meta.signed') }}</span><a :href="installerReleaseUrl" target="_blank" rel="noopener">{{ t('pages.mcp.meta.hosted') }}</a>
          </div>
          <ol class="mcp-install-steps">
            <li><strong>{{ t('pages.mcp.steps.s1Title') }}</strong> {{ t('pages.mcp.steps.s1Body') }}</li>
            <li><strong>{{ t('pages.mcp.steps.s2Title') }}</strong> {{ t('pages.mcp.steps.s2Body') }}</li>
            <li><strong>{{ t('pages.mcp.steps.s3Title') }}</strong> {{ t('pages.mcp.steps.s3Body') }}</li>
          </ol>
        </section>
        <section class="mcp-connect mcp-surface" aria-labelledby="mcp-hosted-title">
          <p class="mcp-eyebrow">
            {{ t('pages.mcp.eyebrow.hosted') }}
          </p>
          <h2 id="mcp-hosted-title">
            {{ t('pages.mcp.hostedTitle', 'Connect without installing') }}
          </h2>
          <p>{{ t('pages.mcp.hostedBody') }}</p>
          <div class="mcp-install-actions">
            <a class="mcp-action" :href="cursorInstallUrl">{{ t('pages.mcp.actions.cursor') }}</a>
            <a class="mcp-action" :href="vscodeInstallUrl">{{ t('pages.mcp.actions.vscode') }}</a>
            <button type="button" class="mcp-action" @click="copyAndOpenClaude">
              {{ t('pages.mcp.actions.claude') }}
            </button>
            <button type="button" class="mcp-action" @click="copyText(codexCommand, t('pages.mcp.labels.codex'))">
              {{ t('pages.mcp.actions.codex') }}
            </button>
            <button type="button" class="mcp-action" @click="copyText(claudeCodeCommand, t('pages.mcp.labels.claudeCode'))">
              {{ t('pages.mcp.actions.claudeCode') }}
            </button>
          </div>
          <p>
            {{ t('pages.mcp.otherClient') }}
          </p>
          <div class="mcp-copy-row">
            <code class="mcp-value">{{ endpoint }}</code>
            <button type="button" class="mcp-action" @click="copyText(endpoint, t('pages.mcp.labels.serverUrl'))">
              {{ t('pages.mcp.actions.copyUrl') }}
            </button>
          </div>
          <p v-if="copyStatus" class="mcp-feedback" role="status" aria-live="polite">
            {{ copyStatus }}
          </p>
          <p class="mcp-eyebrow mcp-usage-heading">
            {{ t('pages.mcp.eyebrow.after') }}
          </p>
          <i18n-t keypath="pages.mcp.shortest" tag="p">
            <template #prompt>
              <code>killer &lt;task&gt;</code>
            </template>
            <template #example>
              <code>killer domain search thekiller.net</code>
            </template>
          </i18n-t>
          <i18n-t keypath="pages.mcp.infer" tag="p">
            <template #a>
              <code>KillerTools</code>
            </template>
            <template #b>
              <code>killerpdf</code>
            </template>
            <template #c>
              <code>killerscan</code>
            </template>
          </i18n-t>
        </section>
        <section class="mcp-card mcp-surface">
          <h2>{{ t('pages.mcp.worker.title') }}</h2>
          <i18n-t keypath="pages.mcp.worker.p1" tag="p">
            <template #url>
              <code>https://mcp.killertools.net</code>
            </template>
          </i18n-t>
          <p>{{ t('pages.mcp.worker.p2') }}</p>
        </section>
        <section class="mcp-card mcp-surface">
          <h2>{{ t('pages.mcp.oss.title') }}</h2>
          <i18n-t keypath="pages.mcp.oss.p1" tag="p">
            <template #kt>
              <a href="https://github.com/SteveTheKiller/killer-tools-site" target="_blank" rel="noopener">{{ t('pages.mcp.oss.ktLink') }}</a>
            </template>
            <template #km>
              <a href="https://github.com/SteveTheKiller/KillerMCP" target="_blank" rel="noopener">{{ t('pages.mcp.oss.kmLink') }}</a>
            </template>
          </i18n-t>
          <p>
            {{ t('pages.mcp.oss.p2').replace('v0.1.1', `v${installerVersion}`) }}
          </p>
        </section>
      </div>
      <div class="mcp-detail-column">
        <section class="mcp-card mcp-surface" aria-labelledby="mcp-examples-title">
          <h2 id="mcp-examples-title">
            {{ t('pages.mcp.examples.title') }}
          </h2>
          <i18n-t keypath="pages.mcp.examples.intro" tag="p">
            <template #killer>
              <code>killer</code>
            </template>
          </i18n-t>
          <div class="mcp-example-grid">
            <code v-for="n in 12" :key="n">killer {{ t(`pages.mcp.examples.e${n}`) }}</code>
          </div>
        </section>

        <div class="mcp-grid">
          <section class="mcp-card mcp-surface mcp-card-wide">
            <h2>
              {{ t('pages.mcp.can.title') }}
            </h2>
            <p>
              {{ t('pages.mcp.can.intro') }}
            </p>
            <ul>
              <li v-for="n in 10" :key="n">
                {{ t(`pages.mcp.can.i${n}`) }}
              </li>
            </ul>
          </section>
          <section class="mcp-card mcp-surface mcp-card-wide">
            <h2>{{ t('pages.mcp.cov.title') }}</h2>
            <div class="mcp-coverage-grid">
              <p><strong>{{ t('pages.mcp.cov.hostedTitle') }}</strong><span>{{ t('pages.mcp.cov.hostedBody') }}</span></p>
              <p><strong>{{ t('pages.mcp.cov.installedTitle') }}</strong><span>{{ t('pages.mcp.cov.installedBody') }}</span></p>
              <p><strong>{{ t('pages.mcp.cov.browserTitle') }}</strong><span>{{ t('pages.mcp.cov.browserBody') }}</span></p>
            </div>
          </section>
        </div>

        <section class="mcp-card mcp-surface">
          <h2>
            {{ t('pages.mcp.data.title') }}
          </h2>
          <p>
            {{ t('pages.mcp.data.p1') }}
          </p>
          <p>
            {{ t('pages.mcp.data.p2') }}
          </p>
          <p>
            {{ t('pages.mcp.data.p3') }}
          </p>
        </section>
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
.mcp-workspace { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
.mcp-setup-column, .mcp-detail-column { display: grid; gap: 16px; }
.mcp-title-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.mcp-title-row h2 { margin: 0; }
.mcp-github { position: absolute; top: 18px; right: 20px; z-index: 1; display: grid; place-items: center; width: 64px; height: 64px; color: inherit; border-radius: 50%; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, .42)); transition: transform .12s, color .12s, filter .12s; }
.mcp-github svg { width: 42px; height: 42px; fill: currentColor; }
.mcp-github:hover, .mcp-github:focus-visible { color: var(--kt-accent); transform: translateY(-2px) scale(1.08); filter: drop-shadow(0 7px 8px rgba(0, 0, 0, .48)); }
.mcp-heading { display: flex; align-items: center; gap: 0; }
.mcp-icon-pair { position: relative; flex: 0 0 106px; width: 106px; height: 94px; }
.mcp-mark { position: absolute; left: 0; top: 0; width: 90px; height: 90px; object-fit: contain; }
.mcp-eyebrow { margin: 0 0 6px; color: var(--kt-accent); font-size: 11px; letter-spacing: 0.16em; }
.mcp-wordmark { display: flex; align-items: center; gap: 8px; margin: 0; }
.mcp-wordmark { font-family: 'KillerScan', 'Courier New', monospace; font-size: clamp(34px, 5vw, 58px); font-weight: normal; color: var(--kt-text, #fff); }
.mcp-wordmark span { color: var(--kt-accent); }
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

@media (max-width: 1050px) {
  .mcp-workspace { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .mcp-grid { grid-template-columns: 1fr; }
  .mcp-coverage-grid { grid-template-columns: 1fr; }
  .mcp-example-grid { grid-template-columns: 1fr; }
  .mcp-hero, .mcp-card, .mcp-connect { padding: 20px; }
  .mcp-copy-row { flex-direction: column; }
  .mcp-heading { gap: 0; }
  .mcp-icon-pair { flex-basis: 62px; width: 62px; height: 56px; }
  .mcp-mark { width: 52px; height: 52px; }
  .mcp-wordmark { font-size: clamp(30px, 8vw, 44px); }
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
