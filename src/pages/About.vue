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

      <div class="terminal-card">
        <div class="terminal-bar">
          <span class="terminal-title">~/about</span>
          <div class="dots">
            <span class="dot green" />
            <span class="dot yellow" />
            <span class="dot red" />
          </div>
        </div>
        <div class="terminal-body">
          <div class="prompt-line">
            <span class="prompt">&gt;_</span>
            <h1 class="site-title">killer-tools</h1>
          </div>
          <p>
            Field techs don't have time for bloat. Every tool here exists because I needed it on the job and
            couldn't find something that just worked without an account, an install, or telemetry.
          </p>
          <p>
            I'm a field tech at an MSP handling networking, sysadmin work, and endpoint support.
            killer-tools started as a fork of the excellent
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
        <h2 class="section-heading" style="margin-top: 30px;"><span class="prompt">#</span> Killer Apps</h2>
        <p class="col-intro">Standalone executables for field work. No installer, no runtime, no dependencies.</p>

        <div class="app-entry">
          <div class="app-name"><a href="https://killerscan.net" target="_blank" rel="noopener">KillerScan</a></div>
          <div class="app-desc">Fast network scanner. ARP and ping discovery, port probing, vendor lookup, and automatic device classification.</div>
        </div>
        <div class="app-entry">
          <div class="app-name"><a href="https://killerpdf.net" target="_blank" rel="noopener">KillerPDF</a></div>
          <div class="app-desc">Portable PDF editor. View, annotate, merge, split, flatten, sign, and open password-protected files.</div>
        </div>
        <div class="app-entry">
          <div class="app-name"><a href="https://killerfind.net" target="_blank" rel="noopener">KillerFind</a></div>
          <div class="app-desc">Fast file search for Windows. Search by filename, wildcard, or file content across any directory.</div>
        </div>

        <div class="av-note">
          <span class="av-icon">⚠</span>
          <div>
            <strong>Windows Defender may flag these as threats.</strong>
            These are false positives. Network scanning and file system access trigger heuristic flags on new binaries. There is no telemetry, no outbound callback, and nothing written to system paths. All apps are code signed with a Certum certificate. SHA-256 hashes are provided on each tool's page.
          </div>
        </div>
      </div>

    </div>

    <!-- Row 2: full-width links bar -->
    <div class="links-bar">
      <h2 class="section-heading"><span class="prompt">#</span> Links</h2>
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

    <!-- Row 3: full-width footer -->
    <div class="about-footer">
      <h2 class="section-heading"><span class="prompt">#</span> Missing a tool? Found a bug?</h2>
      <p>
        Open a feature request or bug report in the
        <a href="https://github.com/SteveTheKiller/killer-tools-site/issues/new/choose" target="_blank" rel="noopener">issues section</a>
        on GitHub. I read them.
      </p>
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
  .killer-apps .section-heading { margin-top: 0 !important; }
}

/* Terminal card */
.terminal-card {
  background: #0e0e0e;
  border: 1px solid #1ea54c33;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 40px #1ea54c18;
  transition: border-color 0.15s;
}

.terminal-card:hover {
  border-color: rgba(30, 165, 76, 0.6);
}

.terminal-card:hover .terminal-bar {
  background: rgba(30, 165, 76, 0.14);
}

.terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #1a1a1a;
  border-bottom: 1px solid #1ea54c22;
}

.terminal-title { font-size: 12px; color: #555; }
.dots { display: flex; gap: 6px; align-items: center; }
.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green  { background: #28c840; }

.terminal-body {
  padding: 18px 24px 22px;
  line-height: 1.65;
  color: #b0b0b0;
}

.prompt-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.prompt { color: #1ea54c; font-weight: 700; }

.site-title {
  font-size: 22px;
  font-weight: 700;
  color: #1ea54c;
  margin: 0;
}

p { margin: 0 0 10px 0; }
p.last { margin-bottom: 0; }

a { color: #1ea54c; text-decoration: none; transition: color 0.15s; }
a:hover { color: #36ad6a; text-decoration: underline; }

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

/* Killer apps column */
.killer-apps { padding-top: 2px; }

.col-intro { font-size: 12px; color: #999; margin-bottom: 12px; }
.app-entry { margin-bottom: 10px; }
.app-name { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
.app-desc { font-size: 12px; color: #999; line-height: 1.5; }

.av-note {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  background: #1a1200;
  border: 1px solid #febc2e44;
  border-radius: 4px;
  font-size: 11px;
  color: #888;
  line-height: 1.55;
}
.av-icon { color: #febc2e; flex-shrink: 0; margin-top: 1px; }
.av-note strong { color: #febc2e; display: block; margin-bottom: 3px; }

/* Row 2: links bar */
.links-bar {
  margin-top: 24px;
  padding: 18px 0 16px;
  border-top: 1px solid #1ea54c22;
  border-bottom: 1px solid #1ea54c22;
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
  background: #1ea54c22;
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

/* Row 3: footer */
.about-footer {
  padding-top: 18px;
}

/* ── Light mode overrides ────────────────────────────────────────────────── */

/* Terminal card goes light to match site kt-terminal style */
html:not(.dark) .terminal-card {
  background: #cccccc;
  border-color: rgba(13, 112, 51, 0.32);
  box-shadow: none;
}
html:not(.dark) .terminal-bar {
  background: rgba(0, 0, 0, 0.08);
  border-bottom-color: rgba(0, 0, 0, 0.10);
}
html:not(.dark) .terminal-title { color: #555; }
html:not(.dark) .terminal-body  { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) .terminal-body a { color: #1a6b3a; }
html:not(.dark) .terminal-body a:hover { color: #0d7033; }
html:not(.dark) .site-title { color: #0d7033; }
html:not(.dark) .terminal-card:hover {
  border-color: rgba(13, 112, 51, 0.65);
}
html:not(.dark) .terminal-card:hover .terminal-bar {
  background: rgba(13, 112, 51, 0.18);
}

/* Killer apps column */
html:not(.dark) .col-intro    { color: rgba(0, 0, 0, 0.55); }
html:not(.dark) .app-desc     { color: rgba(0, 0, 0, 0.55); }
html:not(.dark) .section-heading { color: rgba(0, 0, 0, 0.45); }

/* Warning box — amber on amber-tinted light bg instead of near-black */
html:not(.dark) .av-note {
  background: rgba(254, 188, 46, 0.10);
  border-color: rgba(254, 188, 46, 0.45);
  color: rgba(0, 0, 0, 0.60);
}
html:not(.dark) .av-note strong { color: #7a5a00; display: block; margin-bottom: 3px; }
html:not(.dark) .av-icon        { color: #b88000; }

/* Links bar */
html:not(.dark) .links-bar     { border-top-color: rgba(13, 112, 51, 0.18); border-bottom-color: rgba(13, 112, 51, 0.18); }
html:not(.dark) .link-divider  { background: rgba(13, 112, 51, 0.18); }
html:not(.dark) .link-label    { color: rgba(0, 0, 0, 0.42); }
html:not(.dark) a              { color: #1a6b3a; }
html:not(.dark) a:hover        { color: #0d7033; }
html:not(.dark) .link-group a  { color: #1a6b3a; }
html:not(.dark) .link-group a:hover { color: #0d7033; }
html:not(.dark) .prompt        { color: rgba(13, 112, 51, 0.65); }
</style>
