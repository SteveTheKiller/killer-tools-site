<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';

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

interface Hop {
  from: string
  by: string
  ip: string
  timestamp: string
  delay: string
}

interface AuthResult {
  protocol: string
  result: string
  detail: string
}

interface ParsedHeaders {
  fields: { label: string, value: string }[]
  hops: Hop[]
  auth: AuthResult[]
  spamScore: string | null
  spamStatus: string | null
  scl: string | null
  sclLabel: string
  senderMismatch: boolean
  sendingService: string
}

const result = ref<ParsedHeaders | null>(null);

function getHeader(lines: string[], name: string): string {
  const lower = name.toLowerCase();
  const found = lines.find((l: string) => l.toLowerCase().startsWith(`${lower}:`));
  return found ? found.slice(name.length + 1).trim() : '';
}

function getAllHeaders(lines: string[], name: string): string[] {
  const lower = name.toLowerCase();
  return lines
    .filter((l: string) => l.toLowerCase().startsWith(`${lower}:`))
    .map((l: string) => l.slice(name.length + 1).trim());
}

function extractIp(text: string): string {
  const match = text.match(/\[(\d{1,3}(?:\.\d{1,3}){3})\]/);
  if (match) {
    return match[1];
  }
  const bare = text.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  return bare ? bare[1] : '';
}

function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1].trim() : str.trim();
}

function extractDomain(email: string): string {
  const at = email.lastIndexOf('@');
  return at >= 0 ? email.slice(at + 1).toLowerCase() : '';
}

function getSclLabel(scl: string): string {
  const n = Number.parseInt(scl);
  if (Number.isNaN(n)) {
    return '';
  }
  if (n === -1) {
    return 'Trusted / Bypass';
  }
  if (n <= 1) {
    return 'Not Spam';
  }
  if (n <= 4) {
    return 'Low Suspicion';
  }
  if (n <= 6) {
    return 'Spam';
  }
  return 'High Confidence Spam';
}

function detectSendingService(lines: string[]): string {
  const received = getAllHeaders(lines, 'Received').join(' ').toLowerCase();
  const feedbackId = getHeader(lines, 'Feedback-ID').toLowerCase();
  const xMailer = getHeader(lines, 'X-Mailer').toLowerCase();
  if (getHeader(lines, 'X-SES-Outgoing') || received.includes('amazonses.com')) {
    return 'Amazon SES';
  }
  if (getHeader(lines, 'X-SG-ID') || getHeader(lines, 'X-Sendgrid-ID') || received.includes('sendgrid.net')) {
    return 'SendGrid';
  }
  if (feedbackId.includes('mailchimp') || received.includes('mailchimp.com')) {
    return 'Mailchimp';
  }
  if (feedbackId.includes('salesforce') || received.includes('exacttarget.com') || received.includes('salesforce.com')) {
    return 'Salesforce Marketing Cloud';
  }
  if (received.includes('sendinblue.com') || received.includes('brevo.com')) {
    return 'Brevo (Sendinblue)';
  }
  if (received.includes('constantcontact.com')) {
    return 'Constant Contact';
  }
  if (received.includes('hubspot.com')) {
    return 'HubSpot';
  }
  if (received.includes('smtp.gmail.com') || received.includes('google.com')) {
    return 'Google Workspace / Gmail';
  }
  if (getHeader(lines, 'X-MS-Exchange-Organization-SCL') || received.includes('protection.outlook.com') || received.includes('outlook.com')) {
    return 'Microsoft 365 / Exchange';
  }
  if (received.includes('zoho.com')) {
    return 'Zoho Mail';
  }
  if (received.includes('protonmail.ch') || received.includes('proton.me')) {
    return 'Proton Mail';
  }
  if (xMailer.includes('apple mail')) {
    return 'Apple Mail';
  }
  return '';
}

function parseReceivedHops(receivedHeaders: string[]): Hop[] {
  const hops: Hop[] = [];
  const dates: (Date | null)[] = [];

  for (const raw of receivedHeaders) {
    const dateMatch = raw.match(/;(.+)$/);
    const dateStr = dateMatch ? dateMatch[1].trim() : '';
    const date = dateStr ? new Date(dateStr) : null;
    dates.push(date);

    const fromMatch = raw.match(/from\s+([^\s(]+)/i);
    const byMatch = raw.match(/by\s+([^\s(]+)/i);

    hops.push({
      from: fromMatch ? fromMatch[1] : '',
      by: byMatch ? byMatch[1] : '',
      ip: extractIp(raw),
      timestamp: dateStr,
      delay: '',
    });
  }

  for (let i = 0; i < hops.length - 1; i++) {
    const curr = dates[i];
    const next = dates[i + 1];
    if (curr && next) {
      const diff = Math.round((curr.getTime() - next.getTime()) / 1000);
      hops[i].delay = diff >= 0 ? `+${diff}s` : `${diff}s`;
    }
  }

  return hops;
}

function parseAuthResults(lines: string[]): AuthResult[] {
  const authHeaders = getAllHeaders(lines, 'Authentication-Results');
  const results: AuthResult[] = [];

  for (const header of authHeaders) {
    const protocols = ['spf', 'dkim', 'dmarc', 'arc'];
    for (const proto of protocols) {
      const rx = new RegExp(`${proto}=([a-z]+)([^;]*)`, 'gi');
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = rx.exec(header)) !== null) {
        results.push({
          protocol: proto.toUpperCase(),
          result: match[1].toLowerCase(),
          detail: match[2].trim().replace(/\s+/g, ' '),
        });
      }
    }
  }

  return results;
}

function parseHeaders() {
  const raw = rawHeaders.value.trim();
  if (!raw) {
    return;
  }

  const unfolded = raw.replace(/\r?\n[ \t]+/g, ' ');
  const lines = unfolded.split(/\r?\n/).filter((l: string) => l.includes(':'));

  const fromRaw = getHeader(lines, 'From');
  const senderRaw = getHeader(lines, 'Sender');
  const fromDomain = extractDomain(extractEmail(fromRaw));
  const senderDomain = extractDomain(extractEmail(senderRaw));
  const senderMismatch = !!(senderRaw && fromDomain && senderDomain && fromDomain !== senderDomain);

  const sclRaw = getHeader(lines, 'X-MS-Exchange-Organization-SCL') || null;
  const sendingService = detectSendingService(lines);

  const fields: { label: string, value: string }[] = [
    { label: 'From', value: fromRaw },
    { label: 'Sender', value: senderRaw },
    { label: 'To', value: getHeader(lines, 'To') },
    { label: 'Delivered-To', value: getHeader(lines, 'Delivered-To') || getHeader(lines, 'X-Forwarded-To') },
    { label: 'Reply-To', value: getHeader(lines, 'Reply-To') },
    { label: 'Return-Path', value: getHeader(lines, 'Return-Path') },
    { label: 'Subject', value: getHeader(lines, 'Subject') },
    { label: 'Date', value: getHeader(lines, 'Date') },
    { label: 'Message-ID', value: getHeader(lines, 'Message-ID') },
    { label: 'Sending Service', value: sendingService },
    { label: 'X-Originating-IP', value: getHeader(lines, 'X-Originating-IP') || getHeader(lines, 'X-Sender-IP') },
    { label: 'X-Mailer', value: getHeader(lines, 'X-Mailer') },
    { label: 'MIME-Version', value: getHeader(lines, 'MIME-Version') },
  ].filter(f => f.value);

  const receivedRaw = getAllHeaders(lines, 'Received');
  const hops = parseReceivedHops(receivedRaw);
  const auth = parseAuthResults(lines);

  const spamScore = getHeader(lines, 'X-Spam-Score') || getHeader(lines, 'X-Spam-Level') || null;
  const spamStatus = getHeader(lines, 'X-Spam-Status') || null;

  result.value = {
    fields,
    hops,
    auth,
    spamScore,
    spamStatus,
    scl: sclRaw,
    sclLabel: sclRaw ? getSclLabel(sclRaw) : '',
    senderMismatch,
    sendingService,
  };
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
        Paste raw email headers below.
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
        <button type="button" class="kt-pill kt-pill-active" :disabled="!rawHeaders.trim()" @click="parseHeaders">
          Parse Headers
        </button>
      </div>
    </template>

    <template v-if="parsed && result">
      <div mb-4 flex justify-end>
        <c-button variant="text" @click="reset">
          ← Parse Another
        </c-button>
      </div>

      <div class="grid grid-cols-1 gap-16px lg:grid-cols-2">
        <!-- Left: Message Details + Delivery Hops -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">

          <!-- Message Details -->
          <div class="ehp-terminal">
            <div class="ehp-terminal-bar">
              <span class="ehp-terminal-title">Message Details</span>
            </div>
            <div v-if="result.senderMismatch" class="kt-alert kt-alert-warning" style="margin: 8px 12px; font-size: 0.75rem;">
              Sender domain differs from From domain — possible spoofing or delegated sending.
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
              <span class="ehp-terminal-title">Delivery Hops</span>
              <span class="ehp-terminal-sub">oldest first</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-for="(hop, i) in [...result.hops].reverse()" :key="i" class="ehp-hop">
                <div class="ehp-hop-num">{{ String(i + 1).padStart(2, '0') }}</div>
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
              <span class="ehp-terminal-title">Authentication Results</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-for="group in groupedAuth" :key="group.protocol" class="ehp-auth-group">
                <div class="ehp-section-header">{{ group.protocol }}</div>
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
              <span class="ehp-terminal-title">Spam Analysis</span>
            </div>
            <div class="ehp-terminal-body">
              <div v-if="result.scl" class="ehp-row">
                <span class="ehp-label">SCL</span>
                <span class="ehp-value">{{ result.scl }} — {{ result.sclLabel }}</span>
              </div>
              <div v-if="result.spamScore" class="ehp-row">
                <span class="ehp-label">Spam Score</span>
                <span class="ehp-value">{{ result.spamScore }}</span>
              </div>
              <div v-if="result.spamStatus" class="ehp-row">
                <span class="ehp-label">Spam Status</span>
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
/* ── Terminal chrome ── */
.ehp-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ehp-terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(30, 165, 76, 0.15);
}

.ehp-terminal-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1ea54c;
  letter-spacing: 0.02em;
}

.ehp-terminal-sub {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.3);
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
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}
.ehp-row:last-child { border-bottom: none; }
.ehp-row:hover { background: rgba(30, 165, 76, 0.05); }

.ehp-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  white-space: nowrap;
  padding-top: 1px;
}

.ehp-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.82);
  word-break: break-all;
  line-height: 1.45;
}

/* ── Delivery Hops ── */
.ehp-hop {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  font-size: 0.72rem;
  line-height: 1.5;
}
.ehp-hop:last-child { border-bottom: none; }

.ehp-hop-num {
  font-size: 0.68rem;
  color: rgba(30, 165, 76, 0.35);
  text-align: right;
  padding-top: 1px;
  user-select: none;
}

.ehp-hop-content {
  min-width: 0;
}

.ehp-hop-line {
  color: rgba(255, 255, 255, 0.72);
  overflow-wrap: break-word;
  word-break: normal;
  margin-bottom: 2px;
}

.ehp-hop-key {
  color: rgba(30, 165, 76, 0.55);
  margin-right: 5px;
}

.ehp-hop-ip {
  color: rgba(255, 255, 255, 0.3);
}

.ehp-hop-ts {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.28);
  margin-top: 3px;
}

.ehp-hop-delay {
  color: rgba(255, 255, 255, 0.22);
}

/* ── Auth Results ── */
.ehp-auth-group {
  border-bottom: 1px solid rgba(30, 165, 76, 0.1);
}
.ehp-auth-group:last-child { border-bottom: none; }

.ehp-section-header {
  padding: 5px 12px 3px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.ehp-auth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(30, 165, 76, 0.07);
}

.ehp-auth-entry {
  background: rgba(0, 0, 0, 0.55);
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
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.5;
  min-width: 0;
}

@media (max-width: 600px) {
  .ehp-auth-grid { grid-template-columns: 1fr; }
}
</style>
