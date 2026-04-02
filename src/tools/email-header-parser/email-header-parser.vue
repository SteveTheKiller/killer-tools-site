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
  fields: { label: string; value: string }[]
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
    const dateMatch = raw.match(/;\s*(.+)$/);
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

  const fields: { label: string; value: string }[] = [
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
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <template v-if="!parsed">
      <div class="mb-2 text-xs op-60">
        Paste raw email headers below — in most email clients: View Source, Show Original, or View Message Headers
      </div>
      <c-input-text
        v-model:value="rawHeaders"
        placeholder="Received: from mail.example.com...&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: ..."
        :rows="12"
        multiline
        mb-4
      />
      <div flex justify-end gap-3>
        <c-button :disabled="!rawHeaders.trim()" @click="parseHeaders">
          Parse Headers
        </c-button>
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
          <c-card>
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Message Details</span>
            </div>
            <n-alert v-if="result.senderMismatch" type="warning" mb-3>
              <span class="text-xs">Sender domain differs from From domain — possible spoofing or delegated sending.</span>
            </n-alert>
            <div class="grid grid-cols-1 gap-8px">
              <div
                v-for="field in result.fields"
                :key="field.label"
                flex items-start justify-between gap-2
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div style="min-width: 0;">
                  <div class="mb-0.5 text-xs op-50">
                    {{ field.label }}
                  </div>
                  <div class="text-xs font-mono" style="overflow-wrap: break-word; word-break: normal;">
                    {{ field.value }}
                  </div>
                </div>
                <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(field.value)">
                  <n-icon size="12" :component="copiedValue === field.value ? Check : Copy" />
                </c-button>
              </div>
            </div>
          </c-card>

          <c-card v-if="result.hops.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Delivery Hops</span>
              <span class="text-xs op-50">oldest first</span>
            </div>
            <div
              v-for="(hop, i) in [...result.hops].reverse()"
              :key="i"
              mb-3
            >
              <div
                class="rounded p-2 text-xs font-mono"
                style="background: rgba(255,255,255,0.05); overflow: hidden;"
              >
                <div style="float: right; margin-left: 8px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                  <span v-if="hop.delay" class="op-40">{{ hop.delay }}</span>
                  <n-tag size="small" type="default">
                    Hop {{ i + 1 }}
                  </n-tag>
                </div>
                <div v-if="hop.from" class="mb-1" style="overflow-wrap: break-word; word-break: normal;">
                  <span class="op-50">From: </span><span v-html="softBreak(hop.from)" />
                  <span v-if="hop.ip" class="op-50"> [{{ hop.ip }}]</span>
                </div>
                <div v-if="hop.by" class="mb-1" style="overflow-wrap: break-word; word-break: normal;">
                  <span class="op-50">By: </span><span v-html="softBreak(hop.by)" />
                </div>
                <div v-if="hop.timestamp" class="op-40">
                  {{ hop.timestamp }}
                </div>
              </div>
            </div>
          </c-card>
        </div>

        <!-- Right: Auth Results + Spam -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <c-card v-if="result.auth.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Authentication Results</span>
            </div>
            <div class="grid grid-cols-1 gap-12px">
              <div
                v-for="group in groupedAuth"
                :key="group.protocol"
              >
                <div class="mb-1 text-xs font-bold tracking-wider font-mono uppercase op-60">
                  {{ group.protocol }}
                </div>
                <div class="grid grid-cols-1 gap-8px sm:grid-cols-2">
                  <div
                    v-for="(a, i) in group.entries"
                    :key="i"
                    class="rounded p-2"
                    style="background: rgba(255,255,255,0.05); overflow: hidden;"
                  >
                    <n-tag :type="authStatusType(a.result)" size="small" style="float: right; margin-left: 8px; margin-bottom: 2px;">
                      {{ a.result }}
                    </n-tag>
                    <div class="text-xs font-mono op-50">
                      <div
                        v-for="(seg, si) in splitAuthDetail(a.detail)"
                        :key="si"
                        style="overflow-wrap: break-word; word-break: normal; padding-left: 0.75em; text-indent: -0.75em;"
                        v-html="softBreak(seg)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </c-card>

          <c-card v-if="result.spamScore || result.spamStatus || result.scl">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Spam Analysis</span>
            </div>
            <div class="grid grid-cols-1 gap-8px">
              <div
                v-if="result.scl"
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div class="mb-0.5 text-xs op-50">
                  M365 Spam Confidence Level (SCL)
                </div>
                <div class="text-xs font-mono">
                  {{ result.scl }} — {{ result.sclLabel }}
                </div>
              </div>
              <div
                v-if="result.spamScore"
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div class="mb-0.5 text-xs op-50">
                  Spam Score
                </div>
                <div class="text-xs font-mono">
                  {{ result.spamScore }}
                </div>
              </div>
              <div
                v-if="result.spamStatus"
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div class="mb-0.5 text-xs op-50">
                  Spam Status
                </div>
                <div class="text-xs font-mono" style="overflow-wrap: break-word; word-break: normal;">
                  {{ result.spamStatus }}
                </div>
              </div>
            </div>
          </c-card>
        </div>
      </div>
    </template>
  </div>
</template>
