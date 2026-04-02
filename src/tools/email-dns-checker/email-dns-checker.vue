<script setup lang="ts">
import { AlertTriangle, Check, Copy, Loader, X } from '@vicons/tabler';

const domain = ref('');
const loading = ref(false);
const checked = ref(false);

interface DnsResult {
  status: 'pass' | 'fail' | 'warn' | 'loading'
  value: string[]
  raw?: string
}

const results = ref<{
  mx: DnsResult
  spf: DnsResult
  dkim: DnsResult
  dmarc: DnsResult
}>({
  mx: { status: 'loading', value: [] },
  spf: { status: 'loading', value: [] },
  dkim: { status: 'loading', value: [] },
  dmarc: { status: 'loading', value: [] },
});

const copiedValue = ref<string | null>(null);

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

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
      results.value.mx = { status: 'fail', value: [], raw: 'No MX records found.' };
    }
    else {
      const sorted = records.sort((a, b) => {
        const pa = Number.parseInt(a.split(' ')[0]);
        const pb = Number.parseInt(b.split(' ')[0]);
        return pa - pb;
      });
      results.value.mx = { status: 'pass', value: sorted };
    }
  }
  catch {
    results.value.mx = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function checkSpf(d: string) {
  try {
    const records = await dnsQuery(d, 'TXT');
    const spf = records.find(r => r.startsWith('v=spf1'));
    if (!spf) {
      results.value.spf = { status: 'fail', value: [], raw: 'No SPF record found.' };
      return;
    }
    const issues: string[] = [];
    if (spf.includes('+all')) {
      issues.push('⚠ +all is dangerous — allows any server to send mail as this domain.');
    }
    if (spf.includes('?all')) {
      issues.push('⚠ ?all is neutral — provides no protection.');
    }
    const status = issues.length > 0 ? 'warn' : 'pass';
    results.value.spf = { status, value: issues, raw: spf };
  }
  catch {
    results.value.spf = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
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
      results.value.dkim = {
        status: 'warn',
        value: [],
        raw: 'No DKIM records found for common selectors. Custom selectors may still exist.',
      };
    }
    else {
      results.value.dkim = { status: 'pass', value: found };
    }
  }
  catch {
    results.value.dkim = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function checkDmarc(d: string) {
  try {
    const records = await dnsQuery(`_dmarc.${d}`, 'TXT');
    const dmarc = records.find(r => r.startsWith('v=DMARC1'));
    if (!dmarc) {
      results.value.dmarc = { status: 'fail', value: [], raw: 'No DMARC record found. Domain is unprotected against spoofing.' };
      return;
    }
    const issues: string[] = [];
    if (dmarc.includes('p=none')) {
      issues.push('⚠ p=none — monitor only, no enforcement. Emails will not be rejected.');
    }
    if (!dmarc.includes('rua=')) {
      issues.push('⚠ No aggregate report address (rua=). You will not receive DMARC reports.');
    }
    const status = issues.length > 0 ? 'warn' : 'pass';
    results.value.dmarc = { status, value: issues, raw: dmarc };
  }
  catch {
    results.value.dmarc = { status: 'fail', value: [], raw: 'DNS lookup failed.' };
  }
}

async function runChecks() {
  const d = domain.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!d) {
    return;
  }
  loading.value = true;
  checked.value = false;
  results.value = {
    mx: { status: 'loading', value: [] },
    spf: { status: 'loading', value: [] },
    dkim: { status: 'loading', value: [] },
    dmarc: { status: 'loading', value: [] },
  };
  await Promise.all([checkMx(d), checkSpf(d), checkDkim(d), checkDmarc(d)]);
  loading.value = false;
  checked.value = true;
}

const statusIcon = {
  pass: Check,
  fail: X,
  warn: AlertTriangle,
  loading: Loader,
};

const statusColor: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  pass: 'success',
  fail: 'error',
  warn: 'warning',
  loading: 'default',
};

const statusLabel: Record<string, string> = {
  pass: 'Pass',
  fail: 'Fail',
  warn: 'Warning',
  loading: 'Checking...',
};

const overallStatus = computed(() => {
  if (!checked.value) {
    return null;
  }
  const statuses = Object.values(results.value).map(r => r.status);
  if (statuses.includes('fail')) {
    return 'fail';
  }
  if (statuses.includes('warn')) {
    return 'warn';
  }
  return 'pass';
});

const overallMessage: Record<string, string> = {
  pass: 'All checks passed. This domain is well configured for email.',
  fail: 'One or more critical records are missing. This domain may be vulnerable to spoofing.',
  warn: 'Some records exist but have configuration issues worth reviewing.',
};
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <div mb-6 flex gap-3>
      <c-input-text
        v-model:value="domain"
        placeholder="Enter a domain (e.g. thekiller.net)"
        style="flex: 1;"
        raw-text
        @keyup.enter="runChecks"
      />
      <c-button :disabled="loading || !domain.trim()" @click="runChecks">
        {{ loading ? 'Checking...' : 'Check' }}
      </c-button>
    </div>

    <!-- Overall result -->
    <n-alert
      v-if="checked && overallStatus"
      :type="overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'"
      mb-6
    >
      {{ overallMessage[overallStatus] }}
    </n-alert>

    <!-- Result cards -->
    <div class="grid grid-cols-1 gap-16px md:grid-cols-2">
      <!-- MX -->
      <c-card>
        <div mb-3 flex items-center justify-between>
          <span class="text-lg font-bold">MX Records</span>
          <n-tag v-if="checked || loading" :type="statusColor[results.mx.status]" size="small">
            <n-icon :component="statusIcon[results.mx.status]" mr-1 />
            {{ statusLabel[results.mx.status] }}
          </n-tag>
        </div>
        <div class="mb-3 text-xs op-60">
          Mail exchange servers for this domain
        </div>
        <div v-if="results.mx.value.length > 0">
          <div
            v-for="(record, i) in results.mx.value"
            :key="i"
            flex items-center justify-between
            class="mb-1 rounded p-2 text-xs font-mono"
            style="background: rgba(255,255,255,0.05)"
          >
            <span>{{ record }}</span>
            <c-button circle variant="text" style="width:20px;height:20px;" @click="copyValue(record)">
              <n-icon size="12" :component="copiedValue === record ? Check : Copy" />
            </c-button>
          </div>
        </div>
        <div v-else-if="results.mx.raw" class="text-xs op-70">
          {{ results.mx.raw }}
        </div>
      </c-card>

      <!-- SPF -->
      <c-card>
        <div mb-3 flex items-center justify-between>
          <span class="text-lg font-bold">SPF Record</span>
          <n-tag v-if="checked || loading" :type="statusColor[results.spf.status]" size="small">
            <n-icon :component="statusIcon[results.spf.status]" mr-1 />
            {{ statusLabel[results.spf.status] }}
          </n-tag>
        </div>
        <div class="mb-3 text-xs op-60">
          Defines which servers are allowed to send email for this domain
        </div>
        <div
          v-if="results.spf.raw && results.spf.raw !== 'DNS lookup failed.' && results.spf.raw !== 'No SPF record found.'"
          flex items-start justify-between gap-2
          class="mb-2 rounded p-2 text-xs font-mono"
          style="background: rgba(255,255,255,0.05); overflow-wrap: break-word; word-break: normal;"
        >
          <span>{{ results.spf.raw }}</span>
          <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(results.spf.raw ?? '')">
            <n-icon size="12" :component="copiedValue === results.spf.raw ? Check : Copy" />
          </c-button>
        </div>
        <div v-else-if="results.spf.raw" class="mb-2 text-xs op-70">
          {{ results.spf.raw }}
        </div>
        <div v-for="(issue, i) in results.spf.value" :key="i" class="text-warning mb-1 text-xs">
          {{ issue }}
        </div>
      </c-card>

      <!-- DKIM -->
      <c-card>
        <div mb-3 flex items-center justify-between>
          <span class="text-lg font-bold">DKIM Records</span>
          <n-tag v-if="checked || loading" :type="statusColor[results.dkim.status]" size="small">
            <n-icon :component="statusIcon[results.dkim.status]" mr-1 />
            {{ statusLabel[results.dkim.status] }}
          </n-tag>
        </div>
        <div class="mb-3 text-xs op-60">
          Checks common selectors: selector1, selector2, google, default, and more
        </div>
        <div v-if="results.dkim.value.length > 0">
          <div
            v-for="(record, i) in results.dkim.value"
            :key="i"
            class="mb-1 rounded p-2 text-xs font-mono"
            style="background: rgba(255,255,255,0.05); overflow-wrap: break-word; word-break: normal;"
          >
            {{ record }}
          </div>
        </div>
        <div v-else-if="results.dkim.raw" class="text-xs op-70">
          {{ results.dkim.raw }}
        </div>
      </c-card>

      <!-- DMARC -->
      <c-card>
        <div mb-3 flex items-center justify-between>
          <span class="text-lg font-bold">DMARC Record</span>
          <n-tag v-if="checked || loading" :type="statusColor[results.dmarc.status]" size="small">
            <n-icon :component="statusIcon[results.dmarc.status]" mr-1 />
            {{ statusLabel[results.dmarc.status] }}
          </n-tag>
        </div>
        <div class="mb-3 text-xs op-60">
          Domain-based Message Authentication, Reporting, and Conformance policy
        </div>
        <div
          v-if="results.dmarc.raw && results.dmarc.raw !== 'DNS lookup failed.' && results.dmarc.raw !== 'No DMARC record found. Domain is unprotected against spoofing.'"
          flex items-start justify-between gap-2
          class="mb-2 rounded p-2 text-xs font-mono"
          style="background: rgba(255,255,255,0.05); overflow-wrap: break-word; word-break: normal;"
        >
          <span>{{ results.dmarc.raw }}</span>
          <c-button circle variant="text" style="width:20px;height:20px;flex-shrink:0;" @click="copyValue(results.dmarc.raw ?? '')">
            <n-icon size="12" :component="copiedValue === results.dmarc.raw ? Check : Copy" />
          </c-button>
        </div>
        <div v-else-if="results.dmarc.raw" class="mb-2 text-xs op-70">
          {{ results.dmarc.raw }}
        </div>
        <div v-for="(issue, i) in results.dmarc.value" :key="i" class="mb-1 text-xs" style="color: var(--warning-color, #f0a020)">
          {{ issue }}
        </div>
      </c-card>
    </div>
  </div>
</template>
