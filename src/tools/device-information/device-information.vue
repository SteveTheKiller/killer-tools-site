<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';

const { width, height } = useWindowSize();

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

const conn = (navigator as unknown as { connection?: NetworkInfo }).connection;

const sections = [
  {
    name: 'Screen',
    information: [
      {
        label: 'Screen size',
        value: computed(() => `${window.screen.availWidth} x ${window.screen.availHeight}`),
      },
      {
        label: 'Window size',
        value: computed(() => `${width.value} x ${height.value}`),
      },
      {
        label: 'Pixel ratio',
        value: computed(() => `${window.devicePixelRatio} dppx`),
      },
      {
        label: 'Color depth',
        value: computed(() => `${window.screen.colorDepth} bits`),
      },
      {
        label: 'Orientation',
        value: computed(() => window.screen.orientation.type),
      },
      {
        label: 'Orientation angle',
        value: computed(() => `${window.screen.orientation.angle}°`),
      },
      {
        label: 'Touch points',
        value: computed(() => navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} max` : 'None'),
      },
    ],
  },
  {
    name: 'Hardware',
    information: [
      {
        label: 'CPU cores',
        value: computed(() => navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical cores` : undefined),
      },
      {
        label: 'Device memory',
        value: computed(() => {
          const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
          return mem ? `~${mem} GB` : undefined;
        }),
      },
      {
        label: 'Platform',
        value: computed(() => navigator.platform),
      },
    ],
  },
  {
    name: 'Network',
    information: [
      {
        label: 'Online',
        value: computed(() => navigator.onLine ? 'Yes' : 'No'),
      },
      {
        label: 'Connection type',
        value: computed(() => conn?.effectiveType ?? undefined),
      },
      {
        label: 'Downlink speed',
        value: computed(() => conn?.downlink != null ? `${conn.downlink} Mbps` : undefined),
      },
      {
        label: 'Round trip time',
        value: computed(() => conn?.rtt != null ? `${conn.rtt} ms` : undefined),
      },
      {
        label: 'Data saver',
        value: computed(() => conn?.saveData != null ? (conn.saveData ? 'Enabled' : 'Disabled') : undefined),
      },
    ],
  },
  {
    name: 'Browser',
    information: [
      {
        label: 'Vendor',
        value: computed(() => navigator.vendor),
      },
      {
        label: 'Languages',
        value: computed(() => navigator.languages.join(', ')),
      },
      {
        label: 'Cookies enabled',
        value: computed(() => navigator.cookieEnabled ? 'Yes' : 'No'),
      },
      {
        label: 'PDF viewer',
        value: computed(() => navigator.pdfViewerEnabled ? 'Supported' : 'Not supported'),
      },
      {
        label: 'Do Not Track',
        value: computed(() => {
          const dnt = navigator.doNotTrack;
          if (dnt === '1') {
            return 'Enabled';
          }
          if (dnt === '0') {
            return 'Disabled';
          }
          return 'Not set';
        }),
      },
      {
        label: 'User agent',
        value: computed(() => navigator.userAgent),
      },
    ],
  },
];
</script>

<template>
  <div class="di-grid">
    <!-- Left column: Screen, Network -->
    <div class="di-col">
      <div
        v-for="{ name, information } in [sections[0], sections[2]]"
        :key="name"
        class="kt-terminal di-card"
      >
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">{{ name.toUpperCase() }}</span>
        </div>
        <template v-for="{ label, value: { value } } in information" :key="label">
          <div v-if="value !== undefined" class="di-row">
            <div class="di-label-group">
              <span class="kt-prompt">&gt;_</span>
              <span class="di-label">{{ label }}</span>
            </div>
            <span class="di-value">{{ value }}</span>
          </div>
        </template>
      </div>
    </div>
    <!-- Right column: Hardware, Browser -->
    <div class="di-col">
      <div
        v-for="{ name, information } in [sections[1], sections[3]]"
        :key="name"
        class="kt-terminal di-card"
      >
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">{{ name.toUpperCase() }}</span>
        </div>
        <template v-for="{ label, value: { value } } in information" :key="label">
          <div v-if="value !== undefined" class="di-row">
            <div class="di-label-group">
              <span class="kt-prompt">&gt;_</span>
              <span class="di-label">{{ label }}</span>
            </div>
            <span class="di-value">{{ value }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.di-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  flex: 1 1 700px;
  max-width: 1400px;
}

.di-col {
  flex: 1 1 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.di-card {
  overflow: hidden;
}

.di-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  gap: 12px;
}

.di-row:last-child {
  border-bottom: none;
}

.di-row:hover {
  background: rgba(var(--kt-accent-rgb), 0.05) !important;
}

.di-label-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.di-label {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.di-value {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: var(--kt-accent);
  text-align: right;
  word-break: break-all;
  min-width: 0;
}


html:not(.dark) .di-label {
  color: rgba(0, 0, 0, 0.55);
}

html:not(.dark) .di-value {
  color: #0d7033;
}
</style>
