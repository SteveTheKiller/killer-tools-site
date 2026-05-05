<script setup lang="ts">
import { AlertTriangle, Check, Copy, Loader, X } from '@vicons/tabler';

const domain = ref('');
const loading = ref(false);

// ---- Helpers ----
const copiedValue = ref<string | null>(null);
function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

// =====================================================================
// WHOIS (RDAP)
// =====================================================================
const whoisLoading = ref(false);
const whoisError = ref('');
const whoisResult = ref<any>(null);

function cleanDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return dateStr;
  }
  return d.toUTCString().replace(' GMT', ' UTC');
}

function daysUntil(dateStr: string | undefined) {
  if (!dateStr) {
    return null;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getEvent(events: any[], action: string): string | undefined {
  const ev = events?.find((e: any) => e.eventAction === action);
  return ev?.eventDate;
}

function vcardGet(vcardArray: any[], field: string): string {
  const vcard = vcardArray?.[1];
  if (!vcard) {
    return '';
  }
  const entry = vcard.find((v: any) => v[0] === field);
  if (!entry) {
    return '';
  }
  return Array.isArray(entry[3]) ? entry[3].join(' ') : (entry[3] ?? '');
}

interface Contact {
  role: string
  name: string
  org: string
  email: string
  phone: string
}

function getContact(entities: any[], role: string): Contact | null {
  if (!entities) {
    return null;
  }
  let entity = entities.find((e: any) => e.roles?.includes(role));
  if (!entity && role === 'abuse') {
    const registrar = entities.find((e: any) => e.roles?.includes('registrar'));
    entity = registrar?.entities?.find((e: any) => e.roles?.includes('abuse'));
  }
  if (!entity?.vcardArray) {
    return null;
  }
  const name = vcardGet(entity.vcardArray, 'fn');
  const org = vcardGet(entity.vcardArray, 'org');
  const email = vcardGet(entity.vcardArray, 'email');
  const phone = vcardGet(entity.vcardArray, 'tel');
  if (!name && !org && !email && !phone) {
    return null;
  }
  return { role, name, org, email, phone };
}

function getRegistrar(entities: any[]): string {
  if (!entities) {
    return '';
  }
  const reg = entities.find((e: any) => e.roles?.includes('registrar'));
  if (!reg) {
    return '';
  }
  return vcardGet(reg.vcardArray, 'fn') || reg.handle || '';
}

function getRegistrarIanaId(entities: any[]): string {
  if (!entities) {
    return '';
  }
  const reg = entities.find((e: any) => e.roles?.includes('registrar'));
  if (!reg) {
    return '';
  }
  const id = reg.publicIds?.find((p: any) => p.type === 'IANA Registrar ID');
  return id?.identifier ?? '';
}

const statusDescriptions: Record<string, string> = {
  'active': 'Domain is active and operational.',
  'inactive': 'Domain is inactive.',
  'client delete prohibited': 'Registrar has locked the domain against deletion.',
  'client transfer prohibited': 'Registrar has locked the domain against transfer to another registrar.',
  'client update prohibited': 'Registrar has locked the domain against updates.',
  'client hold': 'Registrar has placed the domain on hold -- DNS may not resolve.',
  'server delete prohibited': 'Registry has locked the domain against deletion.',
  'server transfer prohibited': 'Registry has locked the domain against transfer.',
  'server update prohibited': 'Registry has locked the domain against updates.',
  'server hold': 'Registry has placed the domain on hold -- DNS may not resolve.',
  'pending create': 'Domain creation is pending.',
  'pending delete': 'Domain is pending deletion and may be released soon.',
  'pending renew': 'Domain renewal is pending.',
  'pending restore': 'Domain restoration from deletion is pending.',
  'pending transfer': 'Domain transfer to another registrar is pending.',
  'pending update': 'Domain update is pending.',
  'redemption period': 'Domain has expired and is in redemption -- registrant can still recover it.',
  'renew period': 'Domain is in the renewal grace period after registration.',
  'auto renew period': 'Domain is in the auto-renewal grace period.',
  'transfer period': 'Domain is in the transfer grace period.',
};

function statusType(s: string): 'success' | 'warning' | 'error' | 'default' {
  const lower = s.toLowerCase();
  if (lower === 'active') {
    return 'success';
  }
  if (lower.includes('pending') || lower.includes('hold') || lower === 'inactive') {
    return 'warning';
  }
  if (lower === 'redemption period' || lower === 'pending delete') {
    return 'error';
  }
  return 'default';
}

const expiryDate = computed(() => getEvent(whoisResult.value?.events, 'expiration'));
const expiryDays = computed(() => daysUntil(expiryDate.value));

const expiryAlertType = computed(() => {
  if (expiryDays.value === null) {
    return null;
  }
  if (expiryDays.value < 0 || expiryDays.value < 30) {
    return 'error';
  }
  if (expiryDays.value < 90) {
    return 'warning';
  }
  return null;
});

const expiryAlertMessage = computed(() => {
  if (expiryDays.value === null) {
    return '';
  }
  if (expiryDays.value < 0) {
    return `This domain expired ${Math.abs(expiryDays.value)} days ago and may be available for registration.`;
  }
  return `This domain expires in ${expiryDays.value} days. Renewal should be arranged promptly.`;
});

const expiryTagType = computed(() => {
  if (expiryDays.value === null) {
    return 'default';
  }
  if (expiryDays.value < 0 || expiryDays.value < 30) {
    return 'error';
  }
  if (expiryDays.value < 90) {
    return 'warning';
  }
  return 'success';
});

const expiryLabel = computed(() => {
  if (expiryDays.value === null) {
    return '';
  }
  if (expiryDays.value < 0) {
    return `Expired ${Math.abs(expiryDays.value)}d ago`;
  }
  return `${expiryDays.value}d remaining`;
});

const registrationRows = computed(() => {
  if (!whoisResult.value) {
    return [];
  }
  return [
    { label: 'Registrar', value: getRegistrar(whoisResult.value.entities) },
    { label: 'Registrar IANA ID', value: getRegistrarIanaId(whoisResult.value.entities) },
    { label: 'Created', value: formatDate(getEvent(whoisResult.value.events, 'registration')) },
    { label: 'Updated', value: formatDate(getEvent(whoisResult.value.events, 'last changed')) },
    { label: 'Expires', value: formatDate(getEvent(whoisResult.value.events, 'expiration')) },
  ].filter(r => r.value);
});

const contacts = computed(() => {
  if (!whoisResult.value?.entities) {
    return [];
  }
  return ['registrant', 'administrative', 'technical', 'abuse']
    .map(role => getContact(whoisResult.value.entities, role))
    .filter((c): c is Contact => c !== null);
});

const dnssec = computed(() => {
  const s = whoisResult.value?.secureDNS;
  if (!s) {
    return null;
  }
  return { signed: s.delegationSigned === true, dsCount: s.dsData?.length ?? 0, keyCount: s.keyData?.length ?? 0 };
});

const remarks = computed(() => {
  const boilerplate = ['status codes', 'rdds inaccuracy complaint form', 'terms of use'];
  return (whoisResult.value?.remarks ?? []).filter((r: any) => {
    const title = r.title?.toLowerCase() ?? '';
    return !boilerplate.some(b => title.includes(b));
  });
});

// =====================================================================
// Email DNS
// =====================================================================
interface DnsResult {
  status: 'pass' | 'fail' | 'warn' | 'loading'
  value: string[]
  raw?: string
}

const emailChecked = ref(false);
const emailResults = ref<{ mx: DnsResult, spf: DnsResult, dkim: DnsResult, dmarc: DnsResult }>({
  mx: { status: 'loading', value: [] },
  spf: { status: 'loading', value: [] },
  dkim: { status: 'loading', value: [] },
  dmarc: { status: 'loading', value: [] },
});

async function dnsQuery(name: string, type: string): Promise<string[]> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { Accept: 'application/dns-json' } },
  );
  const data = await res.json();
  if (!data.Answer) {
    return [];
  }
  return data.Answer.map((a: { data: string }) => a.data.replace(/"/g, '').trim());
}

async function checkMx(d: string) {
  try {
    const records = await dnsQuery(d, 'MX');
    if (records.length === 0) {
      emailResults.value.mx = { status: 'fail', value: [], raw: 'No MX records found.' };
    }
    else {
      const sorted = records.sort((a, b) => {
        const pa = Number.parseInt(a.split(' ')[0]);
        const pb = Number.parseInt(b.split(' ')[0]);
        return pa - pb;
      });
      emailResults.value.mx = { status: 'pass', value: sorted };
    }
  }
  catch {
    emailResults.value.mx = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function checkSpf(d: string) {
  try {
    const records = await dnsQuery(d, 'TXT');
    const spf = records.find(r => r.startsWith('v=spf1'));
    if (!spf) {
      emailResults.value.spf = { status: 'fail', value: [], raw: 'No SPF record found.' };
      return;
    }
    const issues: string[] = [];
    if (spf.includes('+all')) {
      issues.push('Warning: +all is dangerous -- allows any server to send mail as this domain.');
    }
    if (spf.includes('?all')) {
      issues.push('Warning: ?all is neutral -- provides no protection.');
    }
    emailResults.value.spf = { status: issues.length > 0 ? 'warn' : 'pass', value: issues, raw: spf };
  }
  catch {
    emailResults.value.spf = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function checkDkim(d: string) {
  const selectors = ['selector1', 'selector2', 'google', 'default', 'k1', 'mail', 'dkim', 'smtp', 'email'];
  try {
    const found: string[] = [];
    await Promise.all(selectors.map(async (sel) => {
      const records = await dnsQuery(`${sel}._domainkey.${d}`, 'TXT');
      const dkim = records.find(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='));
      if (dkim) {
        found.push(`${sel}: ${dkim}`);
      }
    }));
    if (found.length === 0) {
      emailResults.value.dkim = {
        status: 'warn',
        value: [],
        raw: 'No DKIM records found for common selectors. Custom selectors may still exist.',
      };
    }
    else {
      emailResults.value.dkim = { status: 'pass', value: found };
    }
  }
  catch {
    emailResults.value.dkim = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function checkDmarc(d: string) {
  try {
    const records = await dnsQuery(`_dmarc.${d}`, 'TXT');
    const dmarc = records.find(r => r.startsWith('v=DMARC1'));
    if (!dmarc) {
      emailResults.value.dmarc = {
        status: 'fail',
        value: [],
        raw: 'No DMARC record found. Domain is unprotected against spoofing.',
      };
      return;
    }
    const issues: string[] = [];
    const dmarcTags = Object.fromEntries(
      dmarc.split(';').map(t => t.trim()).filter(Boolean).map((t) => {
        const eq = t.indexOf('=');
        return [t.slice(0, eq).trim(), t.slice(eq + 1).trim()];
      }),
    );
    if (dmarcTags.p === 'none') {
      issues.push('Warning: p=none -- monitor only, no enforcement. Emails will not be rejected.');
    }
    if (!dmarc.includes('rua=')) {
      issues.push('Warning: No aggregate report address (rua=). You will not receive DMARC reports.');
    }
    emailResults.value.dmarc = { status: issues.length > 0 ? 'warn' : 'pass', value: issues, raw: dmarc };
  }
  catch {
    emailResults.value.dmarc = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

const emailStatusIcon = { pass: Check, fail: X, warn: AlertTriangle, loading: Loader };
const emailStatusColor: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  pass: 'success',
  fail: 'error',
  warn: 'warning',
  loading: 'default',
};
const emailStatusLabel: Record<string, string> = {
  pass: 'Pass',
  fail: 'Fail',
  warn: 'Warning',
  loading: 'Checking...',
};

const overallEmailStatus = computed(() => {
  if (!emailChecked.value) {
    return null;
  }
  const statuses = Object.values(emailResults.value).map(r => r.status);
  if (statuses.includes('fail')) {
    return 'fail';
  }
  if (statuses.includes('warn')) {
    return 'warn';
  }
  return 'pass';
});

const overallEmailMessage: Record<string, string> = {
  pass: 'All email checks passed. This domain is well configured for email.',
  fail: 'One or more critical records are missing. This domain may be vulnerable to spoofing.',
  warn: 'Some records exist but have configuration issues worth reviewing.',
};

// =====================================================================
// Combined lookup
// =====================================================================
async function runWhois(d: string) {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} -- domain may not exist or TLD is unsupported.`);
    }
    whoisResult.value = await res.json();
  }
  catch (e: any) {
    whoisError.value = e.message ?? 'Lookup failed.';
  }
  finally {
    whoisLoading.value = false;
  }
}

async function runEmailChecks(d: string) {
  try {
    await Promise.all([checkMx(d), checkSpf(d), checkDkim(d), checkDmarc(d)]);
  }
  catch {
    // individual checks handle their own errors
  }
  emailChecked.value = true;
}

async function runLookup() {
  const d = cleanDomain(domain.value);
  if (!d) {
    return;
  }

  loading.value = true;
  whoisLoading.value = true;
  whoisError.value = '';
  whoisResult.value = null;
  emailChecked.value = false;
  emailResults.value = {
    mx: { status: 'loading', value: [] },
    spf: { status: 'loading', value: [] },
    dkim: { status: 'loading', value: [] },
    dmarc: { status: 'loading', value: [] },
  };

  await Promise.allSettled([runWhois(d), runEmailChecks(d)]);
  loading.value = false;
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <!-- Shared domain input -->
    <div mb-6 flex gap-3>
      <c-input-text
        v-model:value="domain"
        placeholder="Enter a domain (e.g. killertools.net)"
        style="flex: 1;"
        raw-text
        autofocus
        @keyup.enter="runLookup"
      />
      <c-button :disabled="loading || !domain.trim()" @click="runLookup">
        {{ loading ? 'Looking up...' : 'Lookup' }}
      </c-button>
    </div>

    <!-- Alerts -->
    <div v-if="whoisError" class="kt-alert kt-alert-error" style="margin-bottom: 16px;">
      {{ whoisError }}
    </div>
    <div v-if="emailChecked && overallEmailStatus === 'fail'" class="kt-alert kt-alert-error" style="margin-bottom: 16px;">
      {{ overallEmailMessage.fail }}
    </div>
    <div
      v-if="whoisResult && expiryAlertType"
      class="kt-alert"
      :class="`kt-alert-${expiryAlertType}`"
      style="margin-bottom: 16px;"
    >
      {{ expiryAlertMessage }}
    </div>

    <!-- Loading skeleton -->
    <template v-if="whoisLoading">
      <div class="grid grid-cols-1 gap-16px lg:grid-cols-2">
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <c-card>
            <div class="skeleton-line" style="width: 40%; height: 22px; margin-bottom: 16px;" />
            <div class="grid grid-cols-1 gap-8px">
              <div v-for="i in 5" :key="i" class="rounded p-2" style="background: rgba(255,255,255,0.05)">
                <div class="skeleton-line" style="width: 30%; height: 10px; margin-bottom: 6px;" />
                <div class="skeleton-line" :style="`width: ${55 + (i * 7) % 30}%; height: 12px;`" />
              </div>
            </div>
          </c-card>
        </div>
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <c-card v-for="i in 4" :key="i">
            <div class="skeleton-line" style="width: 35%; height: 18px; margin-bottom: 16px;" />
            <div v-for="j in 2" :key="j" class="mb-1 rounded p-2" style="background: rgba(255,255,255,0.05)">
              <div class="skeleton-line" :style="`width: ${50 + (j * 11) % 35}%; height: 12px;`" />
            </div>
          </c-card>
        </div>
      </div>
    </template>

    <!-- ============================================================= -->
    <!-- Two-column results: WHOIS left, Email DNS right                -->
    <!-- ============================================================= -->
    <div v-if="whoisResult || emailChecked" class="grid grid-cols-1 gap-12px lg:grid-cols-2">
      <!-- LEFT: WHOIS -->
      <div v-if="whoisResult" class="grid grid-cols-1 gap-12px" style="align-content: start;">
        <!-- Registration -->
        <c-card>
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              {{ whoisResult.ldhName ?? domain }}
            </span>
            <span v-if="expiryDays !== null" class="kt-tag" :class="`kt-tag-${expiryTagType}`">{{ expiryLabel }}</span>
          </div>
          <div class="grid grid-cols-1 gap-2px">
            <div
              v-for="row in registrationRows"
              :key="row.label"
              flex items-center justify-between gap-2
              class="rounded p-1.5 px-2"
              style="background: rgba(255,255,255,0.05)"
            >
              <div style="min-width: 0;">
                <div class="mb-0.5 text-xs op-50">
                  {{ row.label }}
                </div>
                <div class="text-xs font-mono" style="overflow-wrap: break-word; word-break: normal;">
                  {{ row.value }}
                </div>
              </div>
              <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(row.value)">
                <n-icon size="12" :component="copiedValue === row.value ? Check : Copy" />
              </c-button>
            </div>
          </div>
        </c-card>

        <!-- DNSSEC -->
        <c-card v-if="dnssec">
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              DNSSEC
            </span>
            <span class="kt-tag" :class="dnssec.signed ? 'kt-tag-success' : 'kt-tag-warning'">{{ dnssec.signed ? 'Signed' : 'Unsigned' }}</span>
          </div>
          <div class="text-xs op-70">
            <template v-if="dnssec.signed">
              Delegation is signed.
              <span v-if="dnssec.dsCount"> {{ dnssec.dsCount }} DS record{{ dnssec.dsCount !== 1 ? 's' : '' }}.</span>
              <span v-if="dnssec.keyCount"> {{ dnssec.keyCount }} key record{{ dnssec.keyCount !== 1 ? 's' : '' }}.</span>
            </template>
            <template v-else>
              This domain is not protected by DNSSEC. DNS responses cannot be cryptographically verified.
            </template>
          </div>
        </c-card>

        <!-- Status -->
        <c-card v-if="whoisResult.status?.length">
          <div mb-2>
            <span class="text-lg font-bold">
              Status
            </span>
          </div>
          <div class="grid grid-cols-1 gap-2px">
            <div v-for="(s, i) in whoisResult.status" :key="i" class="rounded p-1.5 px-2" style="background: rgba(255,255,255,0.05)">
              <div mb-1>
                <span class="kt-tag" :class="`kt-tag-${statusType(s)}`">{{ s }}</span>
              </div>
              <div v-if="statusDescriptions[s.toLowerCase()]" class="text-xs op-50">
                {{ statusDescriptions[s.toLowerCase()] }}
              </div>
            </div>
          </div>
        </c-card>

        <!-- Contacts -->
        <c-card v-if="contacts.length">
          <div mb-2>
            <span class="text-lg font-bold">
              Contacts
            </span>
          </div>
          <div class="grid grid-cols-1 gap-6px">
            <div v-for="contact in contacts" :key="contact.role">
              <div class="mb-1 text-xs font-bold font-mono uppercase op-60">
                {{ contact.role }}
              </div>
              <div class="grid grid-cols-1 gap-8px">
                <div
                  v-for="field in [
                    { label: 'Name', value: contact.name },
                    { label: 'Organization', value: contact.org },
                    { label: 'Email', value: contact.email },
                    { label: 'Phone', value: contact.phone },
                  ].filter(f => f.value && f.value !== 'REDACTED FOR PRIVACY' && !f.value.toLowerCase().includes('redacted'))"
                  :key="field.label"
                  flex items-center justify-between gap-2
                  class="rounded p-1.5 px-2"
                  style="background: rgba(255,255,255,0.05)"
                >
                  <div style="min-width: 0;">
                    <div class="mb-0.5 text-xs op-50">
                      {{ field.label }}
                    </div>
                    <a v-if="field.label === 'Email'" :href="`mailto:${field.value}`" class="text-xs text-primary font-mono" style="text-decoration: none;">
                      {{ field.value }}
                    </a>
                    <a v-else-if="field.label === 'Phone'" :href="`tel:${field.value}`" class="text-xs text-primary font-mono" style="text-decoration: none;">
                      {{ field.value }}
                    </a>
                    <div v-else class="text-xs font-mono" style="overflow-wrap: break-word;">
                      {{ field.value }}
                    </div>
                  </div>
                  <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(field.value)">
                    <n-icon size="12" :component="copiedValue === field.value ? Check : Copy" />
                  </c-button>
                </div>
              </div>
            </div>
          </div>
        </c-card>

        <!-- Remarks -->
        <c-card v-if="remarks.length">
          <div mb-2>
            <span class="text-lg font-bold">
              Remarks
            </span>
          </div>
          <div class="grid grid-cols-1 gap-8px">
            <div v-for="(remark, i) in remarks" :key="i" class="rounded p-2" style="background: rgba(255,255,255,0.05)">
              <div v-if="remark.title" class="mb-1 text-xs font-semibold">
                {{ remark.title }}
              </div>
              <div v-for="(line, j) in remark.description" :key="j" class="text-xs op-70" style="overflow-wrap: break-word;">
                {{ line }}
              </div>
            </div>
          </div>
        </c-card>
      </div>

      <!-- RIGHT: Email DNS -->
      <div v-if="emailChecked || loading" class="grid grid-cols-1 gap-12px" style="align-content: start;">
        <!-- Nameservers -->
        <c-card v-if="whoisResult?.nameservers?.length">
          <div mb-2>
            <span class="text-lg font-bold">
              Nameservers
            </span>
          </div>
          <div
            v-for="(ns, i) in whoisResult.nameservers"
            :key="i"
            flex items-center justify-between
            class="mb-0.5 rounded p-1.5 px-2 text-xs font-mono"
            style="background: rgba(255,255,255,0.05)"
          >
            <span>{{ ns.ldhName }}</span>
            <c-button circle variant="text" style="width:20px;height:20px;" @click="copyValue(ns.ldhName)">
              <n-icon size="12" :component="copiedValue === ns.ldhName ? Check : Copy" />
            </c-button>
          </div>
        </c-card>

        <!-- MX -->
        <c-card>
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              MX Records
            </span>
            <span class="kt-tag" :class="`kt-tag-${emailStatusColor[emailResults.mx.status]}`">{{ emailStatusLabel[emailResults.mx.status] }}</span>
          </div>
          <div v-if="emailResults.mx.value.length > 0">
            <div
              v-for="(record, i) in emailResults.mx.value"
              :key="i"
              flex items-center justify-between
              class="mb-0.5 rounded p-1.5 px-2 text-xs font-mono"
              style="background: rgba(255,255,255,0.05)"
            >
              <span>{{ record }}</span>
              <c-button circle variant="text" style="width:20px;height:20px;" @click="copyValue(record)">
                <n-icon size="12" :component="copiedValue === record ? Check : Copy" />
              </c-button>
            </div>
          </div>
          <div v-else-if="emailResults.mx.raw" class="text-xs op-70">
            {{ emailResults.mx.raw }}
          </div>
        </c-card>

        <!-- SPF -->
        <c-card>
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              SPF Record
            </span>
            <span class="kt-tag" :class="`kt-tag-${emailStatusColor[emailResults.spf.status]}`">{{ emailStatusLabel[emailResults.spf.status] }}</span>
          </div>
          <div
            v-if="emailResults.spf.raw && emailResults.spf.raw !== 'DNS lookup failed.' && emailResults.spf.raw !== 'No SPF record found.'"
            flex items-start justify-between gap-2
            class="mb-1 rounded p-1.5 px-2 text-xs font-mono"
            style="background: rgba(255,255,255,0.05); overflow-wrap: break-word;"
          >
            <span>{{ emailResults.spf.raw }}</span>
            <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(emailResults.spf.raw ?? '')">
              <n-icon size="12" :component="copiedValue === emailResults.spf.raw ? Check : Copy" />
            </c-button>
          </div>
          <div v-else-if="emailResults.spf.raw" class="mb-2 text-xs op-70">
            {{ emailResults.spf.raw }}
          </div>
          <div v-for="(issue, i) in emailResults.spf.value" :key="i" class="text-warning mb-1 text-xs">
            {{ issue }}
          </div>
        </c-card>

        <!-- DKIM -->
        <c-card>
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              DKIM Records
            </span>
            <span class="kt-tag" :class="`kt-tag-${emailStatusColor[emailResults.dkim.status]}`">{{ emailStatusLabel[emailResults.dkim.status] }}</span>
          </div>
          <div v-if="emailResults.dkim.value.length > 0">
            <div
              v-for="(record, i) in emailResults.dkim.value"
              :key="i"
              class="mb-0.5 rounded p-1.5 px-2 text-xs font-mono"
              style="background: rgba(255,255,255,0.05); overflow-wrap: break-word;"
            >
              {{ record }}
            </div>
          </div>
          <div v-else-if="emailResults.dkim.raw" class="text-xs op-70">
            {{ emailResults.dkim.raw }}
          </div>
        </c-card>

        <!-- DMARC -->
        <c-card>
          <div mb-2 flex items-center justify-between>
            <span class="text-lg font-bold">
              DMARC Record
            </span>
            <span class="kt-tag" :class="`kt-tag-${emailStatusColor[emailResults.dmarc.status]}`">{{ emailStatusLabel[emailResults.dmarc.status] }}</span>
          </div>
          <div
            v-if="emailResults.dmarc.raw && emailResults.dmarc.raw !== 'DNS lookup failed.' && emailResults.dmarc.raw !== 'No DMARC record found. Domain is unprotected against spoofing.'"
            flex items-start justify-between gap-2
            class="mb-1 rounded p-1.5 px-2 text-xs font-mono"
            style="background: rgba(255,255,255,0.05); overflow-wrap: break-word;"
          >
            <span>{{ emailResults.dmarc.raw }}</span>
            <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(emailResults.dmarc.raw ?? '')">
              <n-icon size="12" :component="copiedValue === emailResults.dmarc.raw ? Check : Copy" />
            </c-button>
          </div>
          <div v-else-if="emailResults.dmarc.raw" class="mb-2 text-xs op-70">
            {{ emailResults.dmarc.raw }}
          </div>
          <div v-for="(issue, i) in emailResults.dmarc.value" :key="i" class="mb-1 text-xs" style="color: var(--warning-color, #f0a020)">
            {{ issue }}
          </div>
        </c-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-line {
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
