<script setup lang="ts">
import { useHead } from '@vueuse/head';

const aboutTitle = 'About - Killer Tools';
const aboutDescription = 'About Killer Tools: a free, open-source collection of handy online tools for developers, sysadmins, and IT pros.';
const aboutUrl = 'https://killertools.net/about';
useHead({
  title: aboutTitle,
  link: [{ rel: 'canonical', href: aboutUrl }],
  meta: [
    { name: 'description', content: aboutDescription },
    { property: 'og:title', content: aboutTitle },
    { property: 'og:description', content: aboutDescription },
    { property: 'og:url', content: aboutUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: aboutTitle },
    { name: 'twitter:description', content: aboutDescription },
  ],
});
</script>

<!-- eslint-disable vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
<template>
  <div class="about-wrapper">

    <!-- Row 1: terminal left, killer apps right -->
    <div class="about-main">

      <!-- Grunge card (family standard): dark grained surface, rounded, replaces the old terminal chrome -->
      <div class="g-card">
        <div class="terminal-body">
          <div class="prompt-line">
            <img class="site-icon" src="/app-icon-512.png" alt="">
            <h1 class="site-title killer-font">About Killer Tools</h1>
          </div>
          <p>
            Field techs don't have time for bloat. Every tool here exists because I needed it on the job and
            couldn't find something that just worked without an account, an install, or telemetry.
          </p>
          <p>
            I'm a field tech at an MSP handling networking, sysadmin work, and endpoint support.
            KillerTools.net started as a fork of the excellent
            <a href="https://github.com/CorentinTh/it-tools" target="_blank" rel="noopener" style="white-space: nowrap">IT-Tools</a>
            project by
            <a href="https://github.com/CorentinTh" target="_blank" rel="noopener">Corentin Thomasset</a>
            and grew into something built for the kind of work I actually do.
            I built it to look up Group Policy settings mid-ticket, scan a client's subnet, and pull port references without leaving the browser.
          </p>
          <p>
            The Killer Scripts library covers the jobs that come up every ticket cycle. Every script runs in PS 5.1, PS 7, and Kaseya LiveConnect with no dependencies.
          </p>
          <p>
            Everything runs in your browser. Nothing is tracked. No account is required, ever.
            The site enforces a strict Content Security Policy to block dependency-chain attacks. If a compromised npm package ever ends up in the bundle, it can't phone home with what you pasted.
          </p>
          <p class="last">
            Built and maintained by
            <a href="https://thekiller.net" target="_blank" rel="noopener">Steve the Killer</a>.
            If this saves you time on the job,
            <a href="https://www.buymeacoffee.com/StevetheKiller" target="_blank" rel="noopener">buying me a coffee</a>
            is appreciated but never expected.
          </p>
        </div>
      </div>

      <div class="killer-apps">
        <!-- Same cross-promo card as the app landing pages: "Also try..." in the
             family typewriter face, cards on a grained Grunge surface -->
        <div class="g-card">
          <h2 class="also-heading killer-font">Also try...</h2>
          <div class="app-cards">
            <a class="app-card" href="https://killerscan.net" target="_blank" rel="noopener">
              <img class="app-icon" src="/brand/ks-icon.png" alt="KillerScan" width="46" height="46">
              <span class="app-body">
                <img class="app-wm wm-dark" src="/brand/killerscan-wordmark-dark.png" alt="KillerScan">
                <img class="app-wm wm-light" src="/brand/killerscan-wordmark-light.png" alt="KillerScan">
                <span class="app-tag">Open-source network scanner for Windows</span>
              </span>
            </a>
            <a class="app-card" href="https://killerpdf.net" target="_blank" rel="noopener">
              <img class="app-icon" src="/brand/kp-icon.png" alt="KillerPDF" width="46" height="46">
              <span class="app-body">
                <img class="app-wm wm-dark" src="/brand/killerpdf-wordmark-dark.png" alt="KillerPDF">
                <img class="app-wm wm-light" src="/brand/killerpdf-wordmark-light.png" alt="KillerPDF">
                <span class="app-tag">Open-source PDF editor for Windows</span>
              </span>
            </a>
            <a class="app-card" href="https://killerfind.net" target="_blank" rel="noopener">
              <img class="app-icon" src="/brand/kf-icon.png" alt="KillerFind" width="46" height="46">
              <span class="app-body">
                <img class="app-wm wm-dark" src="/brand/killerfind-wordmark-dark.png" alt="KillerFind">
                <img class="app-wm wm-light" src="/brand/killerfind-wordmark-light.png" alt="KillerFind">
                <span class="app-tag">Open-source file search for Windows</span>
              </span>
            </a>
            <a class="app-card" href="https://killernotes.net" target="_blank" rel="noopener">
              <img class="app-icon" src="/brand/kn-icon.png" alt="KillerNotes" width="46" height="46">
              <span class="app-body">
                <img class="app-wm wm-dark" src="/brand/killernotes-wordmark-dark.png" alt="KillerNotes">
                <img class="app-wm wm-light" src="/brand/killernotes-wordmark-light.png" alt="KillerNotes">
                <span class="app-tag">Open-source encrypted notepad for Windows</span>
              </span>
            </a>
          </div>
        </div>

        <!-- Missing a tool: same column, under the Also try card -->
        <div class="about-footer g-card">
          <h2 class="also-heading killer-font">Missing a tool? Found a bug?</h2>
          <p>
            Open a feature request or bug report in the
            <a href="https://github.com/SteveTheKiller/killer-tools-site/issues/new/choose" target="_blank" rel="noopener">issues section</a>
            on GitHub. I read them.
          </p>
        </div>
      </div>

    </div>

    <!-- Row 2: full-width links card -->
    <div class="links-bar g-card">
      <h2 class="also-heading killer-font">Links</h2>
      <div class="links-row">
        <div class="link-group">
          <div class="link-label">Site</div>
          <a href="https://killertools.net" target="_blank" rel="noopener">killertools.net</a>
          <a href="https://thekiller.net" target="_blank" rel="noopener">thekiller.net</a>
        </div>
        <div class="link-divider" />
        <div class="link-group">
          <div class="link-label">Source</div>
          <a href="https://github.com/SteveTheKiller" target="_blank" rel="noopener">GitHub — SteveTheKiller</a>
          <a href="https://github.com/SteveTheKiller/killer-tools-site" target="_blank" rel="noopener">GitHub — killer-tools-site</a>
        </div>
        <div class="link-divider" />
        <div class="link-group">
          <div class="link-label">Issues</div>
          <a href="https://github.com/SteveTheKiller/killer-tools-site/issues/new/choose" target="_blank" rel="noopener">Report a bug</a>
          <a href="https://github.com/SteveTheKiller/killer-tools-site/issues/new/choose" target="_blank" rel="noopener">Request a feature</a>
        </div>
        <div class="link-divider" />
        <div class="link-group">
          <div class="link-label">Support</div>
          <a href="https://www.buymeacoffee.com/StevetheKiller" target="_blank" rel="noopener">Buy Me a Coffee</a>
        </div>
        <div class="link-divider" />
        <div class="link-group">
          <div class="link-label">Built on</div>
          <a href="https://vuejs.org" target="_blank" rel="noopener">Vue 3</a>
          <a href="https://www.naiveui.com" target="_blank" rel="noopener">Naive UI</a>
          <a href="https://vitejs.dev" target="_blank" rel="noopener">Vite</a>
          <a href="https://github.com/CorentinTh/it-tools" target="_blank" rel="noopener" style="white-space: nowrap">IT-Tools (fork)</a>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.about-wrapper {
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Row 1 */
.about-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  padding-top: 12px;
}

@media (max-width: 1050px) {
  .about-main { grid-template-columns: 1fr; }
}

/* ── Grunge (family) pieces: typewriter face + grained card surface ── */
@font-face {
  font-family: 'KillerScan';
  src: url('/brand/KillerScan.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.killer-font {
  font-family: 'KillerScan', 'Courier New', monospace;
  font-weight: normal;
  letter-spacing: 0.5px;
}

/* Family card recipe (kt-terminal language): near-black grained surface on
   --kt-modal, chrome border, accent top edge, hover accent (no lift - text) */
.g-card {
  position: relative;
  overflow: hidden;
  background: var(--kt-modal, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 6px;
  padding: 18px 24px 22px;
  transition: border-color 0.15s, box-shadow 0.12s, transform 0.12s;
}

.g-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--kt-accent-sel, var(--kt-accent));
  transition: background 0.15s ease;
  pointer-events: none;
  z-index: 1;
}

.g-card:hover::after {
  background: var(--kt-accent);
}

.g-card:hover {
  /* Family pop: same lift as the kt-terminal cards */
  transform: translateY(-3px);
  border-color: rgba(var(--kt-accent-rgb), 0.6);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
}

.also-heading {
  font-size: 20px;
  color: #e0e0e0;
  margin: 0 0 14px 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

.terminal-body {
  padding: 0;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
}

.prompt-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.site-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
  align-self: center;
}

.site-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--kt-accent);
  margin: 0;
  /* Family heading shadow: every theme except Light */
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

p { margin: 0 0 10px 0; }
p.last { margin-bottom: 0; }

a { color: var(--kt-accent); text-decoration: none; transition: color 0.15s; }
a:hover { color: var(--kt-accent-2); text-decoration: underline; }

.section-heading {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Killer apps column: landing-page style cross-promo cards (icon + wordmark + tagline) */
.killer-apps { padding-top: 2px; }

.app-cards { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.app-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s;
}
.app-card:hover { background: color-mix(in srgb, var(--kt-accent) 10%, transparent); text-decoration: none; }
.app-icon { width: 46px; height: 46px; border-radius: 9px; flex-shrink: 0; }
.app-body { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-width: 0; }
/* Family standard wordmark height (30px), dark/light swap follows the site theme */
.app-wm { height: 30px; width: auto; display: block; max-width: 100%; object-fit: contain; object-position: left center; }
.app-wm.wm-light { display: none; }
html:not(.dark) .app-wm.wm-dark { display: none; }
html:not(.dark) .app-wm.wm-light { display: block; }
.app-tag { font-size: 12.5px; color: #999; }

/* Row 2: links card (surface comes from .g-card) */
.links-bar {
  margin-top: 24px;
}

.links-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 0;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 28px 0 0;
  min-width: 0;
}

.link-divider {
  width: 1px;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--kt-accent) 13%, transparent);
  align-self: stretch;
  margin: 0 28px 0 0;
}

.link-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 2px;
  white-space: nowrap;
}

.link-group a { font-size: 12px; white-space: nowrap; }

@media (max-width: 1050px) {
  .links-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .link-divider { display: none; }
  .link-group { padding: 0; }
}

/* Row 3: footer card */
.about-footer {
  margin-top: 24px;
}
.about-footer p { margin: 0; }

/* ── Light mode overrides ────────────────────────────────────────────────── */

/* Light mode: the card surface adapts through the theme vars (--kt-modal,
   --kt-grain-img, --kt-chrome-border), matching kt-terminal behavior */
html:not(.dark) .g-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
}
html:not(.dark) .also-heading { color: #1a1a1a; text-shadow: none; }
html:not(.dark) .terminal-body  { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) .terminal-body a { color: var(--kt-accent); }
html:not(.dark) .terminal-body a:hover { color: var(--kt-accent-2); }
html:not(.dark) .site-title { color: var(--kt-accent); text-shadow: none; }

/* Killer apps column */
html:not(.dark) .section-heading { color: rgba(0, 0, 0, 0.45); }
html:not(.dark) .app-tag  { color: rgba(0, 0, 0, 0.55); }
html:not(.dark) .app-card:hover { background: color-mix(in srgb, var(--kt-accent) 10%, transparent); }

/* Links card */
html:not(.dark) .link-divider  { background: color-mix(in srgb, var(--kt-accent) 18%, transparent); }
html:not(.dark) .link-label    { color: rgba(0, 0, 0, 0.42); }
html:not(.dark) a              { color: var(--kt-accent); }
html:not(.dark) a:hover        { color: var(--kt-accent-2); }
html:not(.dark) .link-group a  { color: var(--kt-accent); }
html:not(.dark) .link-group a:hover { color: var(--kt-accent-2); }
</style>
