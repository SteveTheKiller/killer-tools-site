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
  <div class="k-terminal">
    <template v-for="{ name, information } in sections" :key="name">
      <div class="k-section-row">
        {{ name.toUpperCase() }}
      </div>
      <template v-for="{ label, value: { value } } in information" :key="label">
        <div v-if="value !== undefined" class="k-row">
          <span class="k-prompt">&gt;_</span>
          <span class="k-label">{{ label }}</span>
          <span class="k-value">{{ value }}</span>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.k-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  flex: 1 1 900px;
  max-width: 1400px;
}

.k-section-row {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.k-row {
  display: grid;
  grid-template-columns: auto 180px 1fr;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}

.k-row:last-child {
  border-bottom: none;
}

.k-row:hover {
  background: rgba(30, 165, 76, 0.05);
}

.k-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  flex-shrink: 0;
}

.k-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.k-value {
  color: #1ea54c;
  font-size: 0.82rem;
  word-break: break-all;
  min-width: 0;
}
</style>
