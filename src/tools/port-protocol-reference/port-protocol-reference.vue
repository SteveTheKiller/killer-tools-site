<script setup lang="ts">
import { portCategories } from './port-protocol-reference.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);
const filterDangerous = ref(false);
const filterProtocol = ref('');

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return portCategories
    .map(({ category, ports }) => ({
      category,
      ports: ports.filter((p) => {
        if (filterDangerous.value && !p.dangerous) {
          return false;
        }
        if (filterProtocol.value && p.protocol !== filterProtocol.value) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          String(p.port).includes(q)
          || p.service.toLowerCase().includes(q)
          || p.description.toLowerCase().includes(q)
          || p.protocol.toLowerCase().includes(q)
          || category.toLowerCase().includes(q)
          || (p.notes?.toLowerCase().includes(q) ?? false)
        );
      }),
    }))
    .filter(({ ports }) => ports.length > 0);
});

const totalVisible = computed(() => filtered.value.reduce((sum, c) => sum + c.ports.length, 0));
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div mb-4 flex flex-wrap gap-3>
      <c-input-text
        v-model:value="search"
        placeholder="Search by port, service, protocol, or description..."
        autofocus
        raw-text
        style="flex: 1; min-width: 200px;"
      />
      <div class="ppr-proto-filter">
        <button
          v-for="proto in ['', 'TCP', 'UDP', 'TCP/UDP']"
          :key="proto"
          type="button"
          class="ppr-seg-btn"
          :class="{ 'ppr-seg-btn-active': filterProtocol === proto }"
          @click="filterProtocol = proto"
        >
          {{ proto || 'All' }}
        </button>
      </div>
      <button
        type="button"
        class="kt-pill ppr-dangerous-btn"
        :class="{ 'ppr-dangerous-btn-active': filterDangerous }"
        @click="filterDangerous = !filterDangerous"
      >
        Dangerous only
      </button>
    </div>

    <div class="mb-4 text-xs op-40">
      Showing {{ totalVisible }} ports
    </div>

    <div class="ppr-grid">
      <template v-for="{ ports, category } of filtered" :key="category">
        <div
          v-for="p of ports"
          :key="`${category}-${p.port}-${p.protocol}-${p.service}`"
          class="kt-terminal ppr-card"
          :class="{ 'ppr-card-dangerous': p.dangerous }"
        >
          <div
            class="kt-terminal-bar ppr-bar"
            :class="{ 'ppr-bar-copied': copiedValue === String(p.port) }"
            :title="copiedValue === String(p.port) ? 'Copied!' : 'Click to copy port number'"
            @click="copyValue(String(p.port))"
          >
            <code class="ppr-port">{{ copiedValue === String(p.port) ? '✓ copied' : p.port }}</code>
            <div class="ppr-pills">
              <span class="ppr-proto" :class="`ppr-proto-${p.protocol === 'TCP' ? 'tcp' : p.protocol === 'UDP' ? 'udp' : 'both'}`">{{ p.protocol }}</span>
              <span v-if="p.dangerous" class="ppr-dangerous-pill">Dangerous</span>
            </div>
          </div>

          <div class="ppr-body">
            <div class="ppr-category">
              {{ category }}
            </div>
            <div class="ppr-service">
              {{ p.service }}
            </div>
            <div class="ppr-desc">
              {{ p.description }}
            </div>
            <div v-if="p.notes" class="ppr-notes">
              {{ p.notes }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.kt-terminal-bar { background: var(--kt-term-bar-bg) !important; }

.ppr-dangerous-btn {
  background: rgba(0, 0, 0, 0.35) !important;
  border-color: rgba(234, 179, 8, 0.3) !important;
  color: rgba(234, 179, 8, 0.6) !important;
}

.ppr-dangerous-btn:hover {
  background: rgba(234, 179, 8, 0.08) !important;
  border-color: rgba(234, 179, 8, 0.5) !important;
  color: #ca8a04 !important;
}

.ppr-dangerous-btn-active {
  background: rgba(234, 179, 8, 0.12) !important;
  border-color: rgba(234, 179, 8, 0.6) !important;
  color: #ca8a04 !important;
}

.ppr-proto-filter {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
}

.ppr-seg-btn {
  padding: 0 12px;
  height: 34px;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  border: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}

.ppr-seg-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.08);
  color: rgba(255, 255, 255, 0.75);
}

.ppr-seg-btn-active {
  background: rgba(var(--kt-accent-rgb), 0.15) !important;
  color: var(--kt-accent) !important;
}

/* ── Light mode overrides ── */
html:not(.dark) .ppr-proto-filter {
  background: rgba(13, 112, 51, 0.06) !important;
  border-color: rgba(13, 112, 51, 0.30) !important;
}

html:not(.dark) .ppr-seg-btn {
  color: rgba(0, 0, 0, 0.45) !important;
}

html:not(.dark) .ppr-seg-btn:hover {
  background: rgba(13, 112, 51, 0.10) !important;
  color: rgba(0, 0, 0, 0.75) !important;
}

html:not(.dark) .ppr-seg-btn-active {
  background: rgba(13, 112, 51, 0.15) !important;
  color: #0d7033 !important;
}

.ppr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

/* Dangerous cards: amber outline on the sides + bottom only, so the accent
   tab stripe stays visible along the top edge */
.ppr-card-dangerous {
  border-right-color: rgba(234, 179, 8, 0.4) !important;
  border-bottom-color: rgba(234, 179, 8, 0.4) !important;
  border-left-color: rgba(234, 179, 8, 0.4) !important;
}

/* On hover the tab stripe brightens (global kt-terminal rule), but the amber
   outline holds on the other three sides instead of going accent */
.ppr-card-dangerous:hover {
  border-right-color: rgba(234, 179, 8, 0.65) !important;
  border-bottom-color: rgba(234, 179, 8, 0.65) !important;
  border-left-color: rgba(234, 179, 8, 0.65) !important;
}

.ppr-bar {
  padding: 3px 10px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.ppr-bar-copied {
  background: rgba(var(--kt-accent-rgb), 0.22) !important;
}

.ppr-port {
  flex: 1;
  font-size: 1.35rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.94);
  letter-spacing: 0.05em;
  font-family: 'KillerScan', 'Courier New', monospace;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

html:not(.dark) .ppr-port {
  color: rgba(0, 0, 0, 0.85);
  text-shadow: none;
}

.ppr-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ppr-proto {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ppr-proto-tcp  { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
.ppr-proto-udp  { background: rgba(var(--kt-accent-rgb), 0.12);  color: var(--kt-accent); border: 1px solid rgba(var(--kt-accent-rgb), 0.3); }
.ppr-proto-both { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); }

.ppr-dangerous-pill {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  background: rgba(234,179,8,0.12);
  color: #ca8a04;
  border: 1px solid rgba(234,179,8,0.3);
}

.ppr-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ppr-category {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1px;
}

.ppr-service {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--kt-accent);
  line-height: 1.3;
}

.ppr-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.ppr-notes {
  margin-top: 4px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  line-height: 1.5;
  background: rgba(234, 179, 8, 0.08);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.2);
}
</style>
