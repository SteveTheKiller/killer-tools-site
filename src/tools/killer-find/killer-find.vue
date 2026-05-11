<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.body.classList.add('killer-find-active');
});
onUnmounted(() => {
  document.body.classList.remove('killer-find-active');
});

const features = [
  { title: 'Filename Search', desc: 'Wildcard patterns like *.log or report_*.xlsx matched against every filename in the tree. Results stream in real time with no pre-indexing.' },
  { title: 'Content Search', desc: 'Streams through files line by line without loading them into RAM. Shows matched lines with line numbers, and skips binary files automatically.' },
  { title: 'Multiple Terms', desc: 'Run several filename and content searches in a single pass. Each term is independently tracked with its own match count so you can see which patterns hit.' },
  { title: 'Include / Exclude Filters', desc: 'Semicolon-separated patterns narrow or limit the search scope by extension or directory segment — e.g. *.txt;*.log or node_modules.' },
  { title: 'Case Sensitive', desc: 'Optional toggle applies to both filename and content searches. Default is case-insensitive so you don\'t have to think about it.' },
  { title: 'Explorer Integration', desc: 'Click any result header to reveal the file in Explorer with it selected. Right-click for a context menu to open the file directly in its default app.' },
  { title: 'HTML Export', desc: 'Export results as a self-contained HTML report with matched lines, line numbers, and search metadata. Opens in any browser, no dependencies.' },
  { title: 'No Installer Required', desc: 'Single EXE, runs from anywhere. No runtime to install beyond .NET Framework 4.8, which ships with Windows 10 1903+ and Windows 11.' },
];
</script>

<template>
  <div class="killer-find-page">
    <div class="hero-wrap">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; text-align: center;">
        Killer<span style="color: #1ea54c;">Find</span>
      </h1>
      <div class="hero-columns">
        <div class="hero-terminal">
          <div class="terminal">
            <div class="terminal-bar">
              <span class="terminal-title">~/killerfind</span>
              <div class="terminal-dots">
                <span class="terminal-dot green" /><span class="terminal-dot yellow" /><span class="terminal-dot red" />
              </div>
            </div>
            <div class="terminal-body">
              <span class="t-prompt">$</span> <span class="t-cmd">killerfind</span> <span class="t-flag">C:\Users</span><br>
              <br>
              <span class="t-out"><span class="t-label">found</span> [*.log] &mdash; 142 files matched</span><br>
              <span class="t-out"><span class="t-label">found</span> [error_code] &mdash; 38 files, 91 line matches</span><br>
              <span class="t-out"><span class="t-label">searched</span> 14,203 files in 2.4s</span><br>
              <br>
              <span class="t-out">No indexing. No agent. No account. No telemetry.</span><br>
              <span class="t-out">Free. Open. GPLv3. Built by a field tech, for field techs.</span><br>
              <br>
              <span class="t-prompt">$</span> <span class="t-cursor" />
            </div>
          </div>
        </div>
        <div class="hero-cta">
          <a
            href="https://github.com/SteveTheKiller/KillerFind/releases/latest/download/KillerFind.exe"
            style="display: inline-flex; align-items: center; gap: 8px; background: #1ea54c; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 4px; text-decoration: none;"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for Windows (.exe)
          </a>
          <p class="kapp-subtitle" style="margin-top: 10px; font-size: 12px; color: #a0a0a0;">
            Windows 10/11 x64 &middot; .NET Framework 4.8
          </p>
          <div class="kapp-version" style="display: inline-block; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 3px; padding: 4px 12px; font-family: Consolas, monospace; font-size: 12px; color: #1ea54c; margin-top: 12px; white-space: nowrap;">
            <span style="color: #0C7A43; font-weight: bold;">$</span> KillerFind v0.1.1 &middot; released 5/4/2026
          </div>
          <p class="kapp-sha256" style="margin-top: 10px; font-size: 11px; color: #a0a0a0; font-family: Consolas, monospace; text-align: center; word-break: break-all; overflow-wrap: break-word; width: 100%;">
            <span style="color: #1ea54c; margin-right: 8px;">SHA256</span>42EBEB669CA823A60940D36EB1FBD0236E746C23B0D67A68981723E3DC90F4CE
          </p>
          <a
            href="https://github.com/SteveTheKiller/KillerFind"
            target="_blank"
            rel="noopener"
            class="kapp-gh-link"
            style="display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 10px 18px; background: #232323; border: 1px solid #1ea54c; border-radius: 4px; font-size: 13px; color: #e0e0e0; text-decoration: none;"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ea54c">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.44 9.77 8.2 11.36.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" />
            </svg>
            <span>Open source under GPLv3.</span>
            <span style="color: #1ea54c; font-weight: 600;">View on GitHub &rarr;</span>
          </a>
        </div>
      </div>
    </div>

    <div class="kt-divider" />

    <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
      What it does
    </h2>

    <div class="feature-grid">
      <n-card
        v-for="feature in features"
        :key="feature.title"
        size="small"
      >
        <span style="color: #1ea54c; font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">{{ feature.title }}</span>
        <span class="feature-desc" style="font-size: 12px; line-height: 1.5;">{{ feature.desc }}</span>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.killer-find-page {
  width: 100%;
}
.terminal {
  background: var(--kt-term-bg);
  border: 1px solid var(--kt-term-border);
  border-radius: 6px;
  margin: 0;
  text-align: left;
  overflow: hidden;
  transition: border-color 0.15s;
}
.terminal:hover {
  border-color: rgba(30, 165, 76, 0.6) !important;
}
.terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
  transition: background 0.1s;
}
.terminal:hover .terminal-bar {
  background: var(--kt-term-bar-hover-bg) !important;
}
.terminal-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}
.terminal-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.terminal-dot.red    { background: #ff5f57; }
.terminal-dot.yellow { background: #febc2e; }
.terminal-dot.green  { background: #28c840; }
.terminal-title {
  font-family: Consolas, monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.40);
}
.terminal-body {
  padding: 16px 18px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
  overflow-wrap: break-word;
  word-break: break-word;
}
.t-prompt { color: #0C7A43; font-weight: bold; }
.t-cmd { color: #fff; font-weight: bold; }
.t-flag { color: #1ea54c; }
.t-out { color: #a0a0a0; }
.t-label { color: #1ea54c; }
.t-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background: #1ea54c;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }
.hero-wrap {
  max-width: 1100px;
  margin: 0 auto 8px;
}
.hero-columns {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 48px;
  align-items: center;
}
.hero-terminal {
  max-width: 440px;
}
.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 900px) {
  .hero-columns { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hero-cta { width: 100%; align-items: stretch; }
  .hero-cta > a, .hero-cta > div, .hero-cta > p {
    max-width: 100% !important;
    box-sizing: border-box !important;
    justify-content: center;
  }
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  width: 100%;
}
</style>

<style>
body.killer-find-active .tool-header-compact { display: none !important; }
body.killer-find-active .tool-content-fullscreen { max-width: 100% !important; width: 100% !important; padding: 0 32px; box-sizing: border-box; }
body.killer-find-active .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; width: 100% !important; }
body.killer-find-active .killer-find-page { width: 100% !important; max-width: 100% !important; }
@media (max-width: 600px) {
  body.killer-find-active .tool-content-fullscreen { padding: 0 16px; }
}
</style>
