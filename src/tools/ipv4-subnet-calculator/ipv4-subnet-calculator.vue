<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@vicons/tabler';
import { useStorage } from '@vueuse/core';
import { Netmask } from 'netmask';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { convertBase } from '../integer-base-converter/integer-base-converter.model';
import { ipv4ToInt, ipv4ToIpv6, isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';
import { getIPClass } from './ipv4-subnet-calculator.models';

const ip = useStorage('ipv4-subnet-calculator:ip', '192.168.0.1/24');

const getNetworkInfo = (address: string) => new Netmask(address.trim());

const networkInfo = computed(() => withDefaultOnError(() => getNetworkInfo(ip.value), undefined));

const ipValidationRules = [
  {
    message: 'We cannot parse this address, check the format',
    validator: (value: string) => isNotThrowing(() => getNetworkInfo(value.trim())),
  },
];

function isPrivateIP(base: string): boolean {
  const parts = base.split('.').map(Number);
  if (parts[0] === 10) {
    return true;
  }
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }
  if (parts[0] === 192 && parts[1] === 168) {
    return true;
  }
  if (parts[0] === 169 && parts[1] === 254) {
    return true;
  }
  if (parts[0] === 127) {
    return true;
  }
  return false;
}

const _usableHosts = computed(() => {
  if (!networkInfo.value) {
    return null;
  }
  const size = networkInfo.value.size;
  if (size <= 2) {
    return size === 2 ? 0 : 1;
  }
  return size - 2;
});

const isPrivate = computed(() => {
  if (!networkInfo.value) {
    return null;
  }
  return isPrivateIP(networkInfo.value.base);
});

const sections: {
  label: string
  getValue: (blocks: Netmask) => string | undefined
  undefinedFallback?: string
}[] = [
  {
    label: 'Netmask',
    getValue: block => block.toString(),
  },
  {
    label: 'Network address',
    getValue: ({ base }) => base,
  },
  {
    label: 'Network mask',
    getValue: ({ mask }) => mask,
  },
  {
    label: 'Network mask in binary',
    getValue: ({ bitmask }) => ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.') ?? '',
  },
  {
    label: 'CIDR notation',
    getValue: ({ bitmask }) => `/${bitmask}`,
  },
  {
    label: 'Wildcard mask',
    getValue: ({ hostmask }) => hostmask,
  },
  {
    label: 'Network size',
    getValue: ({ size }) => String(size),
  },
  {
    label: 'First address',
    getValue: ({ first }) => first,
  },
  {
    label: 'Last address',
    getValue: ({ last }) => last,
  },
  {
    label: 'Broadcast address',
    getValue: ({ broadcast }) => broadcast,
    undefinedFallback: 'No broadcast address with this mask',
  },
  {
    label: 'IP class',
    getValue: ({ base: ip }) => getIPClass({ ip }),
    undefinedFallback: 'Unknown class type',
  },
];

const cheatSheet = [
  { cidr: '/1', mask: '128.0.0.0', hosts: '2,147,483,646' },
  { cidr: '/2', mask: '192.0.0.0', hosts: '1,073,741,822' },
  { cidr: '/3', mask: '224.0.0.0', hosts: '536,870,910' },
  { cidr: '/4', mask: '240.0.0.0', hosts: '268,435,454' },
  { cidr: '/5', mask: '248.0.0.0', hosts: '134,217,726' },
  { cidr: '/6', mask: '252.0.0.0', hosts: '67,108,862' },
  { cidr: '/7', mask: '254.0.0.0', hosts: '33,554,430' },
  { cidr: '/8', mask: '255.0.0.0', hosts: '16,777,214' },
  { cidr: '/9', mask: '255.128.0.0', hosts: '8,388,606' },
  { cidr: '/10', mask: '255.192.0.0', hosts: '4,194,302' },
  { cidr: '/11', mask: '255.224.0.0', hosts: '2,097,150' },
  { cidr: '/12', mask: '255.240.0.0', hosts: '1,048,574' },
  { cidr: '/13', mask: '255.248.0.0', hosts: '524,286' },
  { cidr: '/14', mask: '255.252.0.0', hosts: '262,142' },
  { cidr: '/15', mask: '255.254.0.0', hosts: '131,070' },
  { cidr: '/16', mask: '255.255.0.0', hosts: '65,534' },
  { cidr: '/17', mask: '255.255.128.0', hosts: '32,766' },
  { cidr: '/18', mask: '255.255.192.0', hosts: '16,382' },
  { cidr: '/19', mask: '255.255.224.0', hosts: '8,190' },
  { cidr: '/20', mask: '255.255.240.0', hosts: '4,094' },
  { cidr: '/21', mask: '255.255.248.0', hosts: '2,046' },
  { cidr: '/22', mask: '255.255.252.0', hosts: '1,022' },
  { cidr: '/23', mask: '255.255.254.0', hosts: '510' },
  { cidr: '/24', mask: '255.255.255.0', hosts: '254' },
  { cidr: '/25', mask: '255.255.255.128', hosts: '126' },
  { cidr: '/26', mask: '255.255.255.192', hosts: '62' },
  { cidr: '/27', mask: '255.255.255.224', hosts: '30' },
  { cidr: '/28', mask: '255.255.255.240', hosts: '14' },
  { cidr: '/29', mask: '255.255.255.248', hosts: '6' },
  { cidr: '/30', mask: '255.255.255.252', hosts: '2' },
  { cidr: '/31', mask: '255.255.255.254', hosts: '2 (P2P)' },
  { cidr: '/32', mask: '255.255.255.255', hosts: '1 (host)' },
];

const currentBitmask = computed(() => networkInfo.value?.bitmask ?? null);

// Address converter — works off the bare IP, ignoring any CIDR suffix
const bareIp = computed(() => ip.value.trim().split('/')[0]);
const bareIpValid = computed(() => isValidIpv4({ ip: bareIp.value }));

const addressRepresentations = computed(() => {
  if (!bareIpValid.value) {
    return [];
  }
  const dec = ipv4ToInt({ ip: bareIp.value });
  return [
    { label: 'Decimal', value: String(dec) },
    { label: 'Hexadecimal', value: convertBase({ fromBase: 10, toBase: 16, value: String(dec) }).toUpperCase() },
    { label: 'Binary', value: convertBase({ fromBase: 10, toBase: 2, value: String(dec) }) },
    { label: 'IPv6', value: ipv4ToIpv6({ ip: bareIp.value }) },
    { label: 'IPv6 (short)', value: ipv4ToIpv6({ ip: bareIp.value, prefix: '::ffff:' }) },
  ];
});

// Interactive bit map — 32 squares representing the IP, split at prefix
const ipBits = computed((): number[] => {
  if (!bareIpValid.value) {
    return Array.from<number>({ length: 32 }).fill(0);
  }
  const dec = ipv4ToInt({ ip: bareIp.value });
  return Array.from({ length: 32 }, (_, i) => (dec >> (31 - i)) & 1);
});

function setPrefix(bit: number) {
  const prefix = bit + 1;
  const base = bareIpValid.value ? bareIp.value : '192.168.0.0';
  ip.value = `${base}/${prefix}`;
}

function onSliderChange(val: number) {
  const base = bareIpValid.value ? bareIp.value : '192.168.0.0';
  ip.value = `${base}/${val}`;
}

const showCheatSheet = ref(false);
const copiedLabel = ref<string | null>(null);
async function copyValue(label: string, value: string) {
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value);
  copiedLabel.value = label;
  setTimeout(() => {
    if (copiedLabel.value === label) {
      copiedLabel.value = null;
    }
  }, 2000);
}

function switchToBlock({ count = 1 }: { count?: number }) {
  const next = networkInfo.value?.next(count);
  if (next) {
    ip.value = next.toString();
  }
}

const rangeBar = computed(() => {
  const info = networkInfo.value;
  if (!info) {
    return null;
  }
  const size = info.size;
  const cidr = info.bitmask;
  // Always give network+broadcast at least 5% so they're visible
  const minPct = Math.max(1 / size * 100, cidr >= 30 ? 33 : 6);
  const hostPct = Math.max(0, 100 - minPct * 2);
  return {
    netPct: minPct,
    hostPct,
    bcastPct: minPct,
    network: info.base,
    first: info.first,
    last: info.last,
    broadcast: info.broadcast ?? '—',
    hosts: Math.max(0, size - 2),
    cidr,
  };
});
</script>

<template>
  <div class="sc-layout">
    <!-- Main content -->
    <div class="sc-main">
      <c-input-text
        v-model:value="ip"
        label="An IPv4 address with or without mask"
        placeholder="192.168.0.0/24"
        :validation-rules="ipValidationRules"
        autofocus
        mb-3
      />

      <!-- Bitmap + range bar: shared terminal card -->
      <div v-if="bareIpValid || rangeBar" class="k-terminal sc-viz-terminal" mb-3>
        <div class="k-terminal-bar sc-viz-bar">
          <span class="k-terminal-bar-title">BIT MAP</span>
          <span class="viz-legend">
            <span class="viz-legend-net" /> Network
            <span class="viz-legend-host" /> Host
          </span>
        </div>

        <!-- Interactive bit map + CIDR slider -->
        <div v-if="bareIpValid" class="viz-wrap">
          <div class="bit-map">
            <template v-for="(octetStart, oi) in [0, 8, 16, 24]" :key="oi">
              <div class="bit-octet">
                <button
                  v-for="i in 8"
                  :key="i"
                  type="button"
                  class="bit-sq"
                  :class="(octetStart + i - 1) < (currentBitmask ?? 0) ? 'bit-net' : 'bit-host'"
                  :title="`Set prefix to /${octetStart + i}`"
                  @click="setPrefix(octetStart + i - 1)"
                >
                  {{ ipBits[octetStart + i - 1] }}
                </button>
              </div>
              <span v-if="oi < 3" class="bit-dot">·</span>
            </template>
          </div>
          <div class="slider-row">
            <span class="slider-label">/1</span>
            <input
              type="range"
              min="1"
              max="32"
              :value="currentBitmask ?? 24"
              class="cidr-slider"
              :style="`--val: ${currentBitmask ?? 24}`"
              @input="onSliderChange(+($event.target as HTMLInputElement).value)"
            >
            <span class="slider-label">/32</span>
            <span class="slider-val">/{{ currentBitmask ?? 24 }}</span>
          </div>
        </div>

        <!-- Host range bar -->
        <div v-if="rangeBar" class="range-bar-wrap">
          <div class="range-bar">
            <div class="rb-seg rb-net" :style="`width:${rangeBar.netPct}%`" />
            <div class="rb-seg rb-hosts" :style="`width:${rangeBar.hostPct}%`" />
            <div class="rb-seg rb-bcast" :style="`width:${rangeBar.bcastPct}%`" />
          </div>
          <div class="rb-labels">
            <div class="rb-lbl rb-lbl-net">
              <span class="rb-lbl-tag">network</span>
              <code class="rb-lbl-addr">{{ rangeBar.network }}</code>
            </div>
            <div class="rb-lbl rb-lbl-hosts">
              <span class="rb-lbl-tag">{{ rangeBar.hosts.toLocaleString() }} hosts</span>
              <code v-if="rangeBar.hosts > 0" class="rb-lbl-addr rb-lbl-range">{{ rangeBar.first }} – {{ rangeBar.last }}</code>
            </div>
            <div class="rb-lbl rb-lbl-bcast">
              <span class="rb-lbl-tag">broadcast</span>
              <code class="rb-lbl-addr">{{ rangeBar.broadcast }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Unified terminal output -->
      <div v-if="networkInfo" class="k-terminal">
        <!-- Terminal header bar -->
        <div class="k-terminal-bar">
          <span class="k-status-dot" :class="isPrivate ? 'k-status-private' : 'k-status-public'" />
          <span class="k-status-label">{{ isPrivate ? 'Private' : 'Public' }} IP</span>
          <span class="k-terminal-bar-title">SUBNET DETAIL</span>
        </div>

        <!-- Two-column body -->
        <div class="k-terminal-body">
          <!-- Left: Subnet Info -->
          <div class="k-col">
            <div class="k-section-row">
              SUBNET INFO
            </div>
            <div
              v-for="{ getValue, label, undefinedFallback } in sections"
              :key="label"
              class="k-row"
            >
              <span class="k-prompt">&gt;_</span>
              <span class="k-label">{{ label }}</span>
              <code class="k-value">
                <template v-if="getValue(networkInfo)">{{ getValue(networkInfo) }}</template>
                <span v-else class="k-fallback">{{ undefinedFallback }}</span>
              </code>
              <button
                v-if="getValue(networkInfo)"
                type="button"
                class="k-copy"
                title="Copy"
                @click="copyValue(label, getValue(networkInfo) ?? '')"
              >
                <span v-if="copiedLabel === label">✓</span>
                <icon-mdi-content-copy v-else />
              </button>
              <span v-else class="k-copy-placeholder" />
            </div>
          </div>

          <!-- Divider -->
          <div class="k-col-divider" />

          <!-- Right: Address Representations -->
          <div class="k-col">
            <div class="k-section-row">
              ADDRESS REPRESENTATIONS
            </div>
            <template v-if="bareIpValid">
              <div
                v-for="{ label, value } in addressRepresentations"
                :key="label"
                class="k-row"
              >
                <span class="k-prompt">&gt;_</span>
                <span class="k-label">{{ label }}</span>
                <code class="k-value">{{ value }}</code>
                <button
                  type="button"
                  class="k-copy"
                  title="Copy"
                  @click="copyValue(label, value)"
                >
                  <span v-if="copiedLabel === label">✓</span>
                  <icon-mdi-content-copy v-else />
                </button>
              </div>
            </template>
            <div v-else class="k-fallback" style="padding: 10px 12px; font-size: 0.75rem;">
              Enter a valid IPv4 address to see representations
            </div>
          </div>
        </div>
      </div>

      <!-- Prev / Next block nav -->
      <div v-if="networkInfo" class="k-nav-row">
        <button type="button" class="kt-nav-btn" @click="switchToBlock({ count: -1 })">
          <n-icon :component="ArrowLeft" />
          Previous block
        </button>
        <button type="button" class="kt-nav-btn" @click="switchToBlock({ count: 1 })">
          Next block
          <n-icon :component="ArrowRight" />
        </button>
      </div>
    </div>

    <!-- Cheat Sheet drawer -->
    <div class="cs-wrap" :class="{ 'cs-open': showCheatSheet }">
      <button
        type="button"
        class="cs-toggle"
        :class="{ 'cs-toggle-open': showCheatSheet }"
        :title="showCheatSheet ? 'Collapse Cheat Sheet' : 'Subnet Cheat Sheet'"
        @click="showCheatSheet = !showCheatSheet"
      >
        <span class="cs-chev">{{ showCheatSheet ? '›' : '‹' }}</span>
      </button>
      <div v-show="showCheatSheet" class="cs-panel">
        <div mb-3 class="k-section-label" style="font-size:0.8rem;">
          Subnet Cheat Sheet
        </div>
        <div class="cs-grid">
          <button
            v-for="row in cheatSheet"
            :key="row.cidr"
            type="button"
            class="cs-card"
            :class="currentBitmask !== null && String(currentBitmask) === row.cidr.replace('/', '') ? 'cs-card-active' : ''"
            @click="onSliderChange(+row.cidr.replace('/', ''))"
          >
            <div class="cs-card-top">
              <span class="cs-card-cidr">{{ row.cidr }}</span>
              <span class="cs-card-hosts">{{ row.hosts }} hosts</span>
            </div>
            <span class="cs-card-mask">{{ row.mask }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Explicit terminal colors — same values used across all tools */
.k-terminal { background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important; background-size: 256px 256px !important; }
.k-terminal-bar { background: var(--kt-term-bar-bg) !important; }
.k-row { background: transparent !important; }
.k-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

/* ── Root layout ── */
.sc-layout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1 1 900px;
  max-width: 1400px;
  width: 100%;
  container-type: inline-size;
}

.sc-main {
  flex: 1 1 0;
  min-width: 0;
}

.k-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

/* ── Unified terminal output ── */
.k-terminal {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  container-type: inline-size;
}

.k-terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--kt-term-bar-bg) !important;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.2);
}

.k-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.k-status-private { background: var(--kt-accent); box-shadow: 0 0 5px rgba(var(--kt-accent-rgb), 0.6); }
.k-status-public  { background: #e0a020; box-shadow: 0 0 5px rgba(224, 160, 32, 0.6); }

.k-status-label {
  font-size: 0.7rem;
  font-weight: 600;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.5);
  margin-right: auto;
}

.k-terminal-bar-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.k-terminal-body {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
}

.k-col {
  min-width: 0;
}

.k-col-divider {
  width: 1px;
  background: rgba(var(--kt-accent-rgb), 0.15);
  align-self: stretch;
}

@container (max-width: 750px) {
  .k-terminal-body {
    grid-template-columns: 1fr;
  }
  .k-col-divider {
    display: none;
  }
  .k-col + .k-col {
    border-top: 1px solid rgba(var(--kt-accent-rgb), 0.15);
  }
}

.k-nav-row {
  gap: 8px;
  display: flex;
  justify-content: space-between;
  margin-top: 8px;

.kt-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 32px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 6px;
  color: var(--kt-accent);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.kt-nav-btn:hover {
  background: rgba(0, 0, 0, 0.50);
  border-color: rgba(var(--kt-accent-rgb), 0.6);
}
}

.k-section-row {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
  padding: 5px 12px 3px;
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.k-row {
  display: grid;
  grid-template-columns: auto minmax(0, 130px) 1fr auto;
  align-items: start;
  gap: 10px;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  transition: background 0.1s;
}

.k-row:last-child {
  border-bottom: none;
}

.k-row:hover {
  background: rgba(var(--kt-accent-rgb), 0.05) !important;
}

.k-prompt {
  color: rgba(var(--kt-accent-rgb), 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  flex-shrink: 0;
}

.k-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: normal;
  word-break: break-word;
}

.k-value {
  color: var(--kt-accent);
  font-size: 0.8rem;
  word-break: break-all;
  min-width: 0;
}

.k-fallback {
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
  font-size: 0.75rem;
}

.k-copy {
  background: transparent !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 4px;
  color: rgba(var(--kt-accent-rgb), 0.65);
  cursor: pointer;
  padding: 2px 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-weight: 700;
  flex-shrink: 0;
}

.k-copy:hover {
  background: rgba(var(--kt-accent-rgb), 0.12);
  border-color: rgba(var(--kt-accent-rgb), 0.7);
  color: var(--kt-accent);
}

.k-copy-placeholder {
  width: 26px;
  display: inline-block;
  flex-shrink: 0;
}

/* ── Cheat sheet drawer ── */
.cs-wrap {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  flex-shrink: 0;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 80px);
  gap: 8px;
}

.cs-toggle {
  flex-shrink: 0;
  width: 24px;
  min-height: 120px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  gap: 8px;
  transition: background 0.15s, color 0.15s, border-color 0.15s, width 0.15s;
  align-self: stretch;
}

.cs-toggle:not(.cs-toggle-open) {
  width: 44px;
  min-height: 180px;
  background: rgba(0,0,0,0.35);
  border-color: rgba(var(--kt-accent-rgb), 0.35);
  color: var(--kt-accent);
  padding: 6px 0 18px;
}

.cs-toggle:hover {
  background: rgba(0,0,0,0.50);
  color: var(--kt-accent);
  border-color: rgba(var(--kt-accent-rgb), 0.6);
}

.cs-chev {
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 700;
}

.cs-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
}

.cs-panel {
  width: 360px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  border-radius: 8px;
  padding: 14px;
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(255,255,255,0.08);
}

.cs-panel::-webkit-scrollbar { width: 4px; }
.cs-panel::-webkit-scrollbar-track { background: transparent !important; }
.cs-panel::-webkit-scrollbar-thumb { background: rgba(var(--kt-accent-rgb), 0.35); border-radius: 4px; }
.cs-panel::-webkit-scrollbar-thumb:hover { background: var(--kt-accent); }

.cs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.cs-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  background: var(--kt-term-bar-bg);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.12s, background 0.12s;
  width: 100%;
}

.cs-card:hover {
  border-color: rgba(var(--kt-accent-rgb), 0.5);
  background: rgba(var(--kt-accent-rgb), 0.08);
}

.cs-card-active {
  border-color: var(--kt-accent) !important;
  background: rgba(var(--kt-accent-rgb), 0.12) !important;
}

.cs-card-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.cs-card-cidr {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--kt-accent);
}

.cs-card-hosts {
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
}

.cs-card-mask {
  font-size: 0.62rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Bit map & slider ── */
/* ── Host range bar ── */
.range-bar-wrap {
  padding: 12px 14px;
  border-top: 1px solid rgba(var(--kt-accent-rgb), 0.15);
}

.range-bar {
  display: flex;
  height: 32px;
  border-radius: 5px;
  overflow: hidden;
  gap: 2px;
}

.rb-seg {
  border-radius: 3px;
  transition: width 0.25s ease;
}

.rb-net {
  background: rgba(30, 165, 76, 0.22);
  border: 1px solid rgba(30, 165, 76, 0.5);
}

.rb-hosts {
  background: rgba(30, 165, 76, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.7);
}

.rb-bcast {
  background: rgba(224, 160, 32, 0.25);
  border: 1px solid rgba(224, 160, 32, 0.55);
}

.rb-labels {
  display: grid;
  grid-template-columns: auto 1fr auto;
  margin-top: 7px;
  gap: 4px;
}

.rb-lbl {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rb-lbl-net { align-items: flex-start; }
.rb-lbl-hosts { align-items: center; }
.rb-lbl-bcast { align-items: flex-end; }

.rb-lbl-tag {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
}

.rb-lbl-net .rb-lbl-tag { color: rgba(30, 165, 76, 0.75); }
.rb-lbl-hosts .rb-lbl-tag { color: #4dd07a; }
.rb-lbl-bcast .rb-lbl-tag { color: rgba(224, 160, 32, 0.8); }

.rb-lbl-addr {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
}

.rb-lbl-net .rb-lbl-addr { color: rgba(30, 165, 76, 0.85); }
.rb-lbl-hosts .rb-lbl-addr { color: rgba(255, 255, 255, 0.55); }
.rb-lbl-bcast .rb-lbl-addr { color: rgba(224, 160, 32, 0.7); }

.rb-lbl-range { font-size: 0.65rem; }

@container (max-width: 560px) {
  .rb-lbl-addr { display: none; }
}

.sc-viz-terminal {
  margin-bottom: 14px;
}

.sc-viz-bar {
  justify-content: space-between;
}

.viz-wrap {
  padding: 12px 14px;
}

.viz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.viz-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
}

/* Bitmap/range-bar palette: semantic green for network bits (vs amber host
   bits), deliberately NOT theme-accent - avoids confusion across themes */
.viz-legend-net {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: #1ea54c;
}

.viz-legend-host {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: rgba(224, 160, 32, 0.25);
  border: 1px solid rgba(224, 160, 32, 0.6);
}

.bit-map {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.bit-octet {
  display: flex;
  gap: 3px;
}

.bit-dot {
  color: rgba(255,255,255,0.3);
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 1px;
}

.bit-sq {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bit-net {
  background: rgba(30, 165, 76, 0.85);
  border-color: #1ea54c;
  color: #000;
}

.bit-net:hover {
  background: #1ea54c;
  transform: scale(1.12);
}

.bit-host {
  background: rgba(224, 160, 32, 0.12);
  border-color: rgba(224, 160, 32, 0.4);
  color: rgba(224, 160, 32, 0.8);
}

.bit-host:hover {
  background: rgba(224, 160, 32, 0.28);
  border-color: rgba(224, 160, 32, 0.75);
  transform: scale(1.12);
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  font-family: monospace;
  white-space: nowrap;
}

.slider-val {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--kt-accent);
  min-width: 36px;
}

.cidr-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--kt-accent) calc((var(--val, 24) - 1) / 31 * 100%),
    rgba(var(--kt-accent-rgb), 0.2) calc((var(--val, 24) - 1) / 31 * 100%)
  );
  outline: none;
  cursor: pointer;
}

.cidr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--kt-accent);
  border: 2px solid #000;
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(var(--kt-accent-rgb), 0.3);
}

.cidr-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--kt-accent);
  border: 2px solid #000;
  cursor: pointer;
}

/* ── Cheat sheet: stack + always show when layout is too narrow for side-by-side ── */
@media (max-width: 1300px) {
  .sc-layout {
    flex-direction: column;
    align-items: stretch;
  }

  .cs-wrap {
    width: 100%;
    flex-direction: column;
    position: static;
    max-height: none;
    align-items: stretch;
  }

  /* No point collapsing the cheat sheet when it's already stacked below */
  .cs-toggle {
    display: none !important;
  }

  .cs-panel {
    display: block !important;
    width: 100%;
    max-height: none !important;
  }
}
</style>
