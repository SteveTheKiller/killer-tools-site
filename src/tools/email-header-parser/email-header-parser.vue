<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import type { ParsedHeaders } from './email-header-parser.service';
import { parseRawHeaders } from './email-header-parser.service';

const { t } = useI18n();
const rawHeaders = ref('');
const parsed = ref(false);
const copiedValue = ref<string | null>(null);

function softBreak(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped.replace(/([+.@=/_-])/g, '$1<wbr>');
}

function splitAuthDetail(detail: string): string[] {
  return detail
    .split(/\s+(?=smtp\.|header\.|policy\.|pkix\.|body\.|dkim=|spf=|dmarc=|arc=|from=|fromdomain=|dkdomain=|spfdomain=|i=|d=|s=|b=|p=)/)
    .map(s => s.trim())
    .filter(Boolean);
}

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

const result = ref<ParsedHeaders | null>(null);

function parseHeaders() {
  if (!rawHeaders.value.trim()) {
    return;
  }
  result.value = parseRawHeaders(rawHeaders.value);
  parsed.value = true;
}

function reset() {
  rawHeaders.value = '';
  result.value = null;
  parsed.value = false;
}

function authStatusType(r: string): 'success' | 'error' | 'warning' | 'default' {
  if (r === 'pass') {
    return 'success';
  }
  if (r === 'fail' || r === 'reject') {
    return 'error';
  }
  if (r === 'softfail' || r === 'neutral' || r === 'temperror' || r === 'permerror') {
    return 'warning';
  }
  return 'default';
}

const protocolOrder = ['DMARC', 'SPF', 'DKIM', 'ARC'];

const groupedAuth = computed(() => {
  if (!result.value?.auth) {
    return [];
  }
  const groups: Record<string, typeof result.value.auth> = {};
  for (const a of result.value.auth) {
    if (!groups[a.protocol]) {
      groups[a.protocol] = [];
    }
    groups[a.protocol].push(a);
  }
  return protocolOrder
    .filter(p => groups[p])
    .map(p => ({ protocol: p, entries: groups[p] }))
    .concat(
      Object.keys(groups)
        .filter(p => !protocolOrder.includes(p))
        .map(p => ({ protocol: p, entries: groups[p] })),
    );
});
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <template v-if="!parsed">
      <div class="mb-2 text-xs op-60">
        {{ t('tools.email-header-parser.ui.pasteHint') }}
      </div>
      <c-input-text
        v-model:value="rawHeaders"
        placeholder="Received: from mail.example.com...&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: ..."
        :rows="12"
        multiline
        autofocus
        mb-4
      />
      <div flex justify-end gap-3>
        <button type="button" class="kt-search-btn" style="width: 140px;" :disabled="!rawHeaders.trim()" @click="parseHeaders">
          {{ t('tools.email-header-parser.ui.parseButton') }}
        </button>
      </div>
    </template>

    <template v-if="parsed && result">
      <div mb-4 flex justify-end>
        <button type="button" class="kt-search-btn" style="width: 150px;" @click="reset">
          ← {{ t('tools.email-header-parser.ui.parseAnother') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-16px lg:grid-cols-2">
        <!-- Left: Message Details + Delivery Hops -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <!-- Message Details -->
          <div class="ehp-terminal">
            <div class="ehp-terminal-bar">
              <span class="ehp-terminal-title">{{ t('tools.email-header-parser.ui.messageDetails') }}</span>
            </div>
            <div v-if="result.senderMismatch" class="kt-alert kt-alert-warning" style="margin: 8px 12px; font-size: 0.75rem;">
              {{ t('tools.email-header-parser.ui.senderMismatch') }}
            </div>
            <div class="ehp-terminal-body">
              <div v-for="field in result.fields" :key="field.label" class="ehp-row">
                <span class="ehp-label">{{ field.label }}</span>
                <span class="ehp-value">{{ field.value }}</span>
                <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(field.value)">
                  <n-icon size="12" :component="copiedValue === field.value ? Check : Copy" />
                </c-button>
              </div>
            </div>
          </div>

          <!-- Delivery Hops -->
          <div v-if="result.hops.length" class="ehp-terminal">
            <div class="ehp-terminal-bar">
              <span class="ehp-terminal-title">{{ t('tools.email-header-parser.ui.deliveryHops') }}</span>
              <span class="ehp-terminal-sub">{{ t('tools.email-header-parser.ui.oldestFirst') }}</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-for="(hop, i) in [...result.hops].reverse()" :key="i" class="ehp-hop">
                <div class="ehp-hop-num">
                  {{ String(i + 1).padStart(2, '0') }}
                </div>
                <div class="ehp-hop-content">
                  <div v-if="hop.from" class="ehp-hop-line">
                    <span class="ehp-hop-key">From:</span>
                    <span v-html="softBreak(hop.from)" />
                    <span v-if="hop.ip" class="ehp-hop-ip"> [{{ hop.ip }}]</span>
                  </div>
                  <div v-if="hop.by" class="ehp-hop-line">
                    <span class="ehp-hop-key">By:</span>
                    <span v-html="softBreak(hop.by)" />
                  </div>
                  <div v-if="hop.timestamp || hop.delay" class="ehp-hop-ts">
                    <span v-if="hop.timestamp">{{ hop.timestamp }}</span>
                    <span v-if="hop.delay" class="ehp-hop-delay"> {{ hop.delay }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Auth Results + Spam -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <!-- Authentication Results -->
          <div v-if="result.auth.length" class="ehp-terminal">
            <div class="ehp-terminal-bar">
              <span class="ehp-terminal-title">{{ t('tools.email-header-parser.ui.authResults') }}</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-for="group in groupedAuth" :key="group.protocol" class="ehp-auth-group">
                <div class="ehp-section-header">
                  {{ group.protocol }}
                </div>
                <div class="ehp-auth-grid">
                  <div v-for="(a, i) in group.entries" :key="i" class="ehp-auth-entry">
                    <div class="ehp-auth-entry-inner">
                      <div class="ehp-auth-detail">
                        <div
                          v-for="(seg, si) in splitAuthDetail(a.detail)"
                          :key="si"
                          style="overflow-wrap: break-word; word-break: normal; padding-left: 0.75em; text-indent: -0.75em;"
                          v-html="softBreak(seg)"
                        />
                      </div>
                      <span class="kt-tag" :class="`kt-tag-${authStatusType(a.result)}`" style="flex-shrink: 0;">{{ a.result }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Spam Analysis -->
          <div v-if="result.spamScore || result.spamStatus || result.scl" class="ehp-terminal">
            <div class="ehp-terminal-bar">
              <span class="ehp-terminal-title">{{ t('tools.email-header-parser.ui.spamAnalysis') }}</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-if="result.scl" class="ehp-row">
                <span class="ehp-label">SCL</span>
                <span class="ehp-value">{{ result.scl }} — {{ result.sclLabel }}</span>
              </div>
              <div v-if="result.spamScore" class="ehp-row">
                <span class="ehp-label">{{ t('tools.email-header-parser.ui.spamScore') }}</span>
                <span class="ehp-value">{{ result.spamScore }}</span>
              </div>
              <div v-if="result.spamStatus" class="ehp-row">
                <span class="ehp-label">{{ t('tools.email-header-parser.ui.spamStatus') }}</span>
                <span class="ehp-value" style="word-break: break-word;">{{ result.spamStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Card chrome (family recipe: grained surface, no bar divider) ── */
.ehp-terminal {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ehp-terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 2px;
  background: transparent;
  border-bottom: none;
}

/* Card heading voice comes from the universal *-terminal-title rule in
   kt-terminal.css (killer font, white, 1.05rem) */

.ehp-terminal-sub {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
}

.ehp-terminal-body {
  padding: 4px 0;
}

/* ── Detail rows ── */
.ehp-row {
  display: grid;
  grid-template-columns: 130px 1fr auto;
  align-items: start;
  gap: 10px;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  transition: background 0.1s;
  background: transparent !important;
}
.ehp-row:last-child { border-bottom: none; }
.ehp-row:hover { background: rgba(var(--kt-accent-rgb), 0.05) !important; }

.ehp-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  padding-top: 1px;
}

.ehp-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.92);
  word-break: break-all;
  line-height: 1.45;
}

/* ── Delivery Hops ── */
.ehp-hop {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.07);
  font-size: 0.72rem;
  line-height: 1.5;
}
.ehp-hop:last-child { border-bottom: none; }

.ehp-hop-num {
  font-size: 0.68rem;
  color: rgba(var(--kt-accent-rgb), 0.7);
  text-align: right;
  padding-top: 1px;
  user-select: none;
}

.ehp-hop-content {
  min-width: 0;
}

.ehp-hop-line {
  color: rgba(255, 255, 255, 0.88);
  overflow-wrap: break-word;
  word-break: normal;
  margin-bottom: 2px;
}

.ehp-hop-key {
  color: var(--kt-accent);
  margin-right: 5px;
}

.ehp-hop-ip {
  color: rgba(255, 255, 255, 0.55);
}

.ehp-hop-ts {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
}

.ehp-hop-delay {
  color: rgba(255, 255, 255, 0.4);
}

/* ── Auth Results ── */
.ehp-auth-group {
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.1);
}
.ehp-auth-group:last-child { border-bottom: none; }

.ehp-section-header {
  padding: 5px 12px 3px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  background: var(--kt-term-bar-bg);
  border-bottom: 1px solid var(--kt-term-bar-border);
}

.ehp-auth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(var(--kt-accent-rgb), 0.07);
}

.ehp-auth-entry {
  background: var(--kt-term-bg, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  padding: 8px 10px;
  overflow: hidden;
}

.ehp-auth-entry-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.ehp-auth-detail {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.5;
  min-width: 0;
}

@media (max-width: 600px) {
  .ehp-auth-grid { grid-template-columns: 1fr; }
}
</style>
