<script setup lang="ts">
const features = [
  { title: 'View & Navigate', desc: 'High-quality bitmap rendering via PDFium. Page thumbnails, Ctrl+scroll zoom, and keyboard shortcuts for fast navigation.' },
  { title: 'Merge & Split', desc: 'Combine multiple PDFs into one or extract selected pages into a new file. Drag-and-drop page reordering in the sidebar.' },
  { title: 'Edit Text', desc: 'Double-click any line of text to edit it inline. Font matching from the original PDF preserves the look of the document.' },
  { title: 'Annotate', desc: 'Text boxes, freehand drawing, and highlight overlays with customizable colors, sizes, and opacity. Undo and clear per page.' },
  { title: 'Signatures', desc: 'Draw and save reusable signatures. Click to place them anywhere on a page, just like Acrobat. Signatures persist between sessions.' },
  { title: 'Search & Select', desc: 'Ctrl+F full-text search with highlighted results. Drag-select to copy text, or Ctrl+A to grab the whole page.' },
  { title: 'Print', desc: 'Print with annotations flattened into the output. Ctrl+P or toolbar button sends directly to the system print dialog.' },
  { title: 'Portable', desc: 'Single exe, ~10 MB zipped. No installer, no admin rights, no config files. Runs anywhere with the .NET 8 Desktop Runtime.' },
];
</script>

<template>
  <div class="killer-pdf-page">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
        <span style="color: #1ea54c;">Killer</span>PDF
      </h1>
      <p style="color: #a0a0a0; font-size: 15px; max-width: 520px; margin: 0 auto 24px;">
        Portable PDF editor built for field techs. View, annotate, merge, split, edit text,
        draw, sign, and print -- all from a single lightweight app.
      </p>
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
        v1.0.0 &middot; Windows 10/11 x64 &middot; ~10 MB &middot; Requires
        <a
          href="https://dotnet.microsoft.com/download/dotnet/8.0"
          target="_blank"
          rel="noopener"
          style="color: #1ea54c;"
        >
          .NET 8 Desktop Runtime
        </a>
      </p>
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
        <strong style="color: #e0e0e0;">Runtime:</strong>
        <a
          href="https://dotnet.microsoft.com/download/dotnet/8.0"
          target="_blank"
          rel="noopener"
          style="color: #1ea54c;"
        >
          .NET 8 Desktop Runtime
        </a>
      </p>
    </n-card>
  </div>
</template>

<style scoped>
.killer-pdf-page {
  width: 100%;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
</style>

<style>
/* Hide the auto-generated compact header for this tool page */
.tool-header-compact { display: none !important; }
/* Break out of the 600px flex constraint and fill the available width */
.tool-content-fullscreen { max-width: 100%; padding: 0 32px; }
.tool-content-fullscreen > * { flex: 1 1 100% !important; max-width: 100% !important; }
</style>
