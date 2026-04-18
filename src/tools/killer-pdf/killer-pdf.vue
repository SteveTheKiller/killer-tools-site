<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.body.classList.add('killer-pdf-active');
});
onUnmounted(() => {
  document.body.classList.remove('killer-pdf-active');
});

const features = [
  { title: 'View & Navigate', desc: 'High-quality bitmap rendering via PDFium. Page thumbnails, Ctrl+scroll zoom, and keyboard shortcuts for fast navigation.' },
  { title: 'Merge & Split', desc: 'Combine multiple PDFs into one or extract selected pages into a new file. Drag-and-drop page reordering in the sidebar.' },
  { title: 'Edit Text', desc: 'Double-click any line of text to edit it inline. Font matching from the original PDF preserves the look of the document.' },
  { title: 'Annotate', desc: 'Text boxes, freehand drawing, and highlight overlays with customizable colors, sizes, and opacity. Undo and clear per page.' },
  { title: 'Signatures', desc: 'Draw and save reusable signatures. Click to place them anywhere on a page, just like Acrobat. Signatures persist between sessions.' },
  { title: 'Search & Select', desc: 'Ctrl+F full-text search with highlighted results. Drag-select to copy text, or Ctrl+A to grab the whole page.' },
  { title: 'Print', desc: 'Print with annotations flattened into the output. Ctrl+P or toolbar button sends directly to the system print dialog.' },
  { title: 'Portable', desc: 'Fully self-contained EXE, ~6 MB zipped. No installer, no runtime install, no admin rights, no config files. Runs anywhere.' },
];
</script>

<template>
  <div class="killer-pdf-page">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
        Killer<span style="color: #1ea54c;">PDF</span>
      </h1>
      <div class="terminal">
        <div class="terminal-bar">
          <span class="terminal-dot" /><span class="terminal-dot" /><span class="terminal-dot" />
          <span class="terminal-title">
            ~/killerpdf
          </span>
        </div>
        <div class="terminal-body">
          <span class="t-prompt">$</span> <span class="t-cmd">killerpdf</span> <span class="t-flag">invoice.pdf</span><br>
          <br>
          <span class="t-out"><span class="t-label">view</span> high-quality rendering, thumbnails, zoom</span><br>
          <span class="t-out"><span class="t-label">edit</span> inline text editing with font matching</span><br>
          <span class="t-out"><span class="t-label">annotate</span> highlights, drawings, text boxes</span><br>
          <span class="t-out"><span class="t-label">sign</span> reusable signatures, click to place</span><br>
          <span class="t-out"><span class="t-label">merge</span> combine, split, reorder pages</span><br>
          <span class="t-out"><span class="t-label">print</span> annotations flattened into output</span><br>
          <br>
          <span class="t-out">
            No installer. No account. No subscription. No telemetry.
          </span><br>
          <span class="t-out">
            Free. Open. GPLv3. Built by a field tech who hates Adobe.
          </span><br>
          <br>
          <span class="t-prompt">$</span> <span class="t-cursor" />
        </div>
      </div>
      <a
        href="https://dl.killertools.net/KillerPDF.zip"
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
        Download for Windows (.zip)
      </a>
      <p style="margin-top: 10px; font-size: 12px; color: #a0a0a0;">
        v1.1.1 &middot; Windows 10/11 x64 &middot; ~6 MB &middot; No runtime required &middot;
        <a
          href="https://dl.killertools.net/KillerPDF-1.1.1-src.zip"
          style="color: #1ea54c;"
        >
          source (zip)
        </a>
      </p>
      <a
        href="https://github.com/SteveTheKiller/KillerPDF"
        target="_blank"
        rel="noopener"
        style="display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 10px 18px; background: #232323; border: 1px solid #1ea54c; border-radius: 4px; font-size: 13px; color: #e0e0e0; text-decoration: none;"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ea54c">
          <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.44 9.77 8.2 11.36.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" />
        </svg>
        <span>Now open source under GPLv3</span>
        <span style="color: #1ea54c; font-weight: 600;">View on GitHub &rarr;</span>
      </a>
    </div>

    <n-divider />

    <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
      What it does
    </h2>

    <div class="feature-grid">
      <n-card
        v-for="feature in features"
        :key="feature.title"
        size="small"
      >
        <template #header>
          <span style="color: #1ea54c; font-size: 13px; font-weight: 600;">{{ feature.title }}</span>
        </template>
        <span style="font-size: 12px; color: #a0a0a0; line-height: 1.5;">{{ feature.desc }}</span>
      </n-card>
    </div>

    <n-divider />

    <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
      Requirements
    </h2>

    <n-card size="small" style="max-width: 420px;">
      <p style="font-size: 13px; color: #a0a0a0; margin-bottom: 6px;">
        <strong style="color: #e0e0e0;">OS:</strong> Windows 10 or 11 (x64)
      </p>
      <p style="font-size: 13px; color: #a0a0a0;">
        <strong style="color: #e0e0e0;">Runtime:</strong> None. Everything needed is inside the EXE.
      </p>
    </n-card>
  </div>
</template>

<style scoped>
.killer-pdf-page {
  width: 100%;
}
.terminal {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  max-width: 520px;
  margin: 0 auto 24px;
  text-align: left;
  overflow: hidden;
}
.terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #151515;
  border-bottom: 1px solid #2a2a2a;
}
.terminal-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #333;
  display: inline-block;
}
.terminal-title {
  font-family: Consolas, monospace;
  font-size: 11px;
  color: #555;
  margin-left: auto;
  margin-right: auto;
}
.terminal-body {
  padding: 16px 18px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
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
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
</style>

<style>
/* Only apply when KillerPDF page is active */
body.killer-pdf-active .tool-header-compact { display: none !important; }
body.killer-pdf-active .tool-content-fullscreen { max-width: 100%; padding: 0 32px; }
body.killer-pdf-active .tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; }
</style>
