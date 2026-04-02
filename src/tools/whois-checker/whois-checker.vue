<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';

const domain = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<any>(null);
const copiedValue = ref<string | null>(null);

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

function cleanDomain(input: string) {
  return input.trim().toLowerCase()
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

async function runLookup() {
  const d = cleanDomain(domain.value);
  if (!d) {
    return;
  }
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} — domain may not exist or TLD is unsupported.`);
    }
    const data = await res.json();
    result.value = data;
  }
  catch (e: any) {
    error.value = e.message ?? 'Lookup failed.';
  }
  finally {
    loading.value = false;
  }
}

const statusDescriptions: Record<string, string> = {
  'active': 'Domain is active and operational.',
  'inactive': 'Domain is inactive.',
  'client delete prohibited': 'Registrar has locked the domain against deletion.',
  'client transfer prohibited': 'Registrar has locked the domain against transfer to another registrar.',
  'client update prohibited': 'Registrar has locked the domain against updates.',
  'client hold': 'Registrar has placed the domain on hold — DNS may not resolve.',
  'server delete prohibited': 'Registry has locked the domain against deletion.',
  'server transfer prohibited': 'Registry has locked the domain against transfer.',
  'server update prohibited': 'Registry has locked the domain against updates.',
  'server hold': 'Registry has placed the domain on hold — DNS may not resolve.',
  'pending create': 'Domain creation is pending.',
  'pending delete': 'Domain is pending deletion and may be released soon.',
  'pending renew': 'Domain renewal is pending.',
  'pending restore': 'Domain restoration from deletion is pending.',
  'pending transfer': 'Domain transfer to another registrar is pending.',
  'pending update': 'Domain update is pending.',
  'redemption period': 'Domain has expired and is in redemption — registrant can still recover it.',
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

const expiryDate = computed(() => getEvent(result.value?.events, 'expiration'));
const expiryDays = computed(() => daysUntil(expiryDate.value));

const expiryAlertType = computed(() => {
  if (expiryDays.value === null) {
    return null;
  }
  if (expiryDays.value < 0) {
    return 'error';
  }
  if (expiryDays.value < 30) {
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
  if (!result.value) {
    return [];
  }
  return [
    { label: 'Registrar', value: getRegistrar(result.value.entities) },
    { label: 'Registrar IANA ID', value: getRegistrarIanaId(result.value.entities) },
    { label: 'Created', value: formatDate(getEvent(result.value.events, 'registration')) },
    { label: 'Updated', value: formatDate(getEvent(result.value.events, 'last changed')) },
    { label: 'Expires', value: formatDate(getEvent(result.value.events, 'expiration')) },
  ].filter(r => r.value);
});

const contacts = computed(() => {
  if (!result.value?.entities) {
    return [];
  }
  return ['registrant', 'administrative', 'technical', 'abuse']
    .map(role => getContact(result.value.entities, role))
    .filter((c): c is Contact => c !== null);
});

const dnssec = computed(() => {
  const s = result.value?.secureDNS;
  if (!s) {
    return null;
  }
  return {
    signed: s.delegationSigned === true,
    dsCount: s.dsData?.length ?? 0,
    keyCount: s.keyData?.length ?? 0,
  };
});

const remarks = computed(() => {
  const boilerplate = ['status codes', 'rdds inaccuracy complaint form', 'terms of use'];
  return (result.value?.remarks ?? []).filter((r: any) => {
    const title = r.title?.toLowerCase() ?? '';
    return !boilerplate.some(b => title.includes(b));
  });
});
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <div mb-6 flex gap-3>
      <c-input-text
        v-model:value="domain"
        placeholder="Enter a domain (e.g. thekiller.net)"
        style="flex: 1;"
        raw-text
        @keyup.enter="runLookup"
      />
      <c-button :disabled="loading || !domain.trim()" @click="runLookup">
        {{ loading ? 'Looking up...' : 'Lookup' }}
      </c-button>
    </div>

    <n-alert v-if="error" type="error" mb-4>
      {{ error }}
    </n-alert>

    <!-- Skeleton loading state -->
    <template v-if="loading">
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
          <c-card>
            <div class="skeleton-line" style="width: 30%; height: 18px; margin-bottom: 16px;" />
            <div class="grid grid-cols-1 gap-8px">
              <div v-for="i in 4" :key="i" class="rounded p-2" style="background: rgba(255,255,255,0.05)">
                <div class="skeleton-line" style="width: 20%; height: 10px; margin-bottom: 6px;" />
                <div class="skeleton-line" :style="`width: ${60 + (i * 9) % 25}%; height: 12px;`" />
              </div>
            </div>
          </c-card>
        </div>
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <c-card>
            <div class="skeleton-line" style="width: 35%; height: 18px; margin-bottom: 16px;" />
            <div v-for="i in 3" :key="i" class="mb-1 rounded p-2" style="background: rgba(255,255,255,0.05)">
              <div class="skeleton-line" :style="`width: ${50 + (i * 11) % 35}%; height: 12px;`" />
            </div>
          </c-card>
          <c-card>
            <div class="skeleton-line" style="width: 25%; height: 18px; margin-bottom: 16px;" />
            <div class="grid grid-cols-1 gap-8px">
              <div v-for="i in 4" :key="i" class="rounded p-2" style="background: rgba(255,255,255,0.05)">
                <div class="skeleton-line" style="width: 40%; height: 10px; margin-bottom: 6px;" />
                <div class="skeleton-line" :style="`width: ${45 + (i * 13) % 40}%; height: 10px;`" />
              </div>
            </div>
          </c-card>
        </div>
      </div>
    </template>

    <template v-if="result">
      <!-- Expiry warning banner -->
      <n-alert v-if="expiryAlertType" :type="expiryAlertType" mb-4>
        {{ expiryAlertMessage }}
      </n-alert>

      <div class="grid grid-cols-1 gap-16px lg:grid-cols-2">
        <!-- Left: Registration + Contacts -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <!-- Registration Details -->
          <c-card>
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">{{ result.ldhName ?? domain }}</span>
              <n-tag v-if="expiryDays !== null" :type="expiryTagType" size="small">
                {{ expiryLabel }}
              </n-tag>
            </div>
            <div class="grid grid-cols-1 gap-8px">
              <div
                v-for="row in registrationRows"
                :key="row.label"
                flex items-center justify-between gap-2
                class="rounded p-2"
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

          <!-- Contacts -->
          <c-card v-if="contacts.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Contacts</span>
            </div>
            <div class="grid grid-cols-1 gap-12px">
              <div
                v-for="contact in contacts"
                :key="contact.role"
              >
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
                    class="rounded p-2"
                    style="background: rgba(255,255,255,0.05)"
                  >
                    <div style="min-width: 0;">
                      <div class="mb-0.5 text-xs op-50">
                        {{ field.label }}
                      </div>
                      <a
                        v-if="field.label === 'Email'"
                        :href="`mailto:${field.value}`"
                        class="text-xs text-primary font-mono"
                        style="overflow-wrap: break-word; word-break: normal; text-decoration: none;"
                      >{{ field.value }}</a>
                      <a
                        v-else-if="field.label === 'Phone'"
                        :href="`tel:${field.value}`"
                        class="text-xs text-primary font-mono"
                        style="overflow-wrap: break-word; word-break: normal; text-decoration: none;"
                      >{{ field.value }}</a>
                      <div
                        v-else
                        class="text-xs font-mono"
                        style="overflow-wrap: break-word; word-break: normal;"
                      >
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
        </div>

        <!-- Right: Nameservers + DNSSEC + Status + Remarks -->
        <div class="grid grid-cols-1 gap-16px" style="align-content: start;">
          <!-- Nameservers -->
          <c-card v-if="result.nameservers?.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Nameservers</span>
            </div>
            <div
              v-for="(ns, i) in result.nameservers"
              :key="i"
              flex items-center justify-between
              class="mb-1 rounded p-2 text-xs font-mono"
              style="background: rgba(255,255,255,0.05)"
            >
              <span>{{ ns.ldhName }}</span>
              <c-button circle variant="text" style="width:20px;height:20px;" @click="copyValue(ns.ldhName)">
                <n-icon size="12" :component="copiedValue === ns.ldhName ? Check : Copy" />
              </c-button>
            </div>
          </c-card>

          <!-- DNSSEC -->
          <c-card v-if="dnssec">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">DNSSEC</span>
              <n-tag :type="dnssec.signed ? 'success' : 'warning'" size="small">
                {{ dnssec.signed ? 'Signed' : 'Unsigned' }}
              </n-tag>
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

          <!-- Status Flags -->
          <c-card v-if="result.status?.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Status</span>
            </div>
            <div class="grid grid-cols-1 gap-8px">
              <div
                v-for="(s, i) in result.status"
                :key="i"
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div mb-1 flex items-center gap-2>
                  <n-tag :type="statusType(s)" size="small">
                    {{ s }}
                  </n-tag>
                </div>
                <div v-if="statusDescriptions[s.toLowerCase()]" class="text-xs op-50">
                  {{ statusDescriptions[s.toLowerCase()] }}
                </div>
              </div>
            </div>
          </c-card>

          <!-- Remarks -->
          <c-card v-if="remarks.length">
            <div mb-3 flex items-center justify-between>
              <span class="text-lg font-bold">Remarks</span>
            </div>
            <div class="grid grid-cols-1 gap-8px">
              <div
                v-for="(remark, i) in remarks"
                :key="i"
                class="rounded p-2"
                style="background: rgba(255,255,255,0.05)"
              >
                <div v-if="remark.title" class="mb-1 text-xs font-semibold">
                  {{ remark.title }}
                </div>
                <div
                  v-for="(line, j) in remark.description"
                  :key="j"
                  class="text-xs op-70"
                  style="overflow-wrap: break-word; word-break: normal;"
                >
                  {{ line }}
                </div>
              </div>
            </div>
          </c-card>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton-line {
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
