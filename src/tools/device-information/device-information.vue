<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';

const { width, height } = useWindowSize();
const { t } = useI18n();

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

const conn = (navigator as unknown as { connection?: NetworkInfo }).connection;

const sections = [
  {
    name: 'tools.device-information.ui.screen',
    information: [
      {
        label: 'tools.device-information.ui.screenSize',
        value: computed(() => `${window.screen.availWidth} x ${window.screen.availHeight}`),
      },
      {
        label: 'tools.device-information.ui.windowSize',
        value: computed(() => `${width.value} x ${height.value}`),
      },
      {
        label: 'tools.device-information.ui.pixelRatio',
        value: computed(() => `${window.devicePixelRatio} dppx`),
      },
      {
        label: 'tools.device-information.ui.colorDepth',
        value: computed(() => `${window.screen.colorDepth} bits`),
      },
      {
        label: 'tools.device-information.ui.orientation',
        value: computed(() => window.screen.orientation.type),
      },
      {
        label: 'tools.device-information.ui.orientationAngle',
        value: computed(() => `${window.screen.orientation.angle}°`),
      },
      {
        label: 'tools.device-information.ui.touchPoints',
        value: computed(() => navigator.maxTouchPoints > 0 ? t('tools.device-information.ui.maxTouchPoints', { count: navigator.maxTouchPoints }) : t('tools.device-information.ui.none')),
      },
    ],
  },
  {
    name: 'tools.device-information.ui.hardware',
    information: [
      {
        label: 'tools.device-information.ui.cpuCores',
        value: computed(() => navigator.hardwareConcurrency ? t('tools.device-information.ui.logicalCores', { count: navigator.hardwareConcurrency }) : undefined),
      },
      {
        label: 'tools.device-information.ui.deviceMemory',
        value: computed(() => {
          const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
          return mem ? `~${mem} GB` : undefined;
        }),
      },
      {
        label: 'tools.device-information.ui.platform',
        value: computed(() => navigator.platform),
      },
    ],
  },
  {
    name: 'tools.device-information.ui.network',
    information: [
      {
        label: 'tools.device-information.ui.online',
        value: computed(() => navigator.onLine ? t('tools.device-information.ui.yes') : t('tools.device-information.ui.no')),
      },
      {
        label: 'tools.device-information.ui.connectionType',
        value: computed(() => conn?.effectiveType ?? undefined),
      },
      {
        label: 'tools.device-information.ui.downlinkSpeed',
        value: computed(() => conn?.downlink != null ? `${conn.downlink} Mbps` : undefined),
      },
      {
        label: 'tools.device-information.ui.roundTripTime',
        value: computed(() => conn?.rtt != null ? `${conn.rtt} ms` : undefined),
      },
      {
        label: 'tools.device-information.ui.dataSaver',
        value: computed(() => conn?.saveData != null ? (conn.saveData ? t('tools.device-information.ui.enabled') : t('tools.device-information.ui.disabled')) : undefined),
      },
    ],
  },
  {
    name: 'tools.device-information.ui.browser',
    information: [
      {
        label: 'tools.device-information.ui.vendor',
        value: computed(() => navigator.vendor),
      },
      {
        label: 'tools.device-information.ui.languages',
        value: computed(() => navigator.languages.join(', ')),
      },
      {
        label: 'tools.device-information.ui.cookiesEnabled',
        value: computed(() => navigator.cookieEnabled ? t('tools.device-information.ui.yes') : t('tools.device-information.ui.no')),
      },
      {
        label: 'tools.device-information.ui.pdfViewer',
        value: computed(() => navigator.pdfViewerEnabled ? t('tools.device-information.ui.supported') : t('tools.device-information.ui.notSupported')),
      },
      {
        label: 'tools.device-information.ui.doNotTrack',
        value: computed(() => {
          const dnt = navigator.doNotTrack;
          if (dnt === '1') {
            return t('tools.device-information.ui.enabled');
          }
          if (dnt === '0') {
            return t('tools.device-information.ui.disabled');
          }
          return t('tools.device-information.ui.notSet');
        }),
      },
      {
        label: 'tools.device-information.ui.userAgent',
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
          <span class="kt-terminal-bar-title">{{ t(name).toUpperCase() }}</span>
        </div>
        <template v-for="{ label, value: { value } } in information" :key="label">
          <div v-if="value !== undefined" class="di-row">
            <div class="di-label-group">
              <span class="kt-prompt">&gt;_</span>
              <span class="di-label">{{ t(label) }}</span>
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
          <span class="kt-terminal-bar-title">{{ t(name).toUpperCase() }}</span>
        </div>
        <template v-for="{ label, value: { value } } in information" :key="label">
          <div v-if="value !== undefined" class="di-row">
            <div class="di-label-group">
              <span class="kt-prompt">&gt;_</span>
              <span class="di-label">{{ t(label) }}</span>
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
