<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const activeTab = ref<'spf' | 'dmarc'>('spf');
const copiedValue = ref<string | null>(null);

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => { copiedValue.value = null; }, 1500);
}

// --- SPF ---
const spfProviders = ref<string[]>([]);
const spfCustomIps = ref('');
const spfEnforcement = ref('-all');

const spfProviderOptions = [
  { label: 'Microsoft 365', value: 'include:spf.protection.outlook.com' },
  { label: 'Google Workspace', value: 'include:_spf.google.com' },
  { label: 'SendGrid', value: 'include:sendgrid.net' },
  { label: 'Mailchimp / Mandrill', value: 'include:spf.mandrillapp.com' },
  { label: 'Mailgun', value: 'include:mailgun.org' },
  { label: 'Amazon SES', value: 'include:amazonses.com' },
  { label: 'Zoho Mail', value: 'include:zoho.com' },
  { label: 'Postmark', value: 'include:spf.mtasv.net' },
  { label: 'Proton Mail', value: 'include:_spf.protonmail.ch' },
  { label: 'Fastmail', value: 'include:spf.messagingengine.com' },
  { label: 'HubSpot', value: 'include:_spf.hubspot.com' },
  { label: 'Zendesk', value: 'include:mail.zendesk.com' },
  { label: 'Freshdesk', value: 'include:email.freshdesk.com' },
  { label: 'Salesforce', value: 'include:_spf.salesforce.com' },
  { label: 'Mimecast', value: 'include:_netblocks.mimecast.com' },
];

const spfEnforcementOptions = [
  { label: '-all (hard fail, recommended)', value: '-all' },
  { label: '~all (soft fail)', value: '~all' },
  { label: '?all (neutral, not recommended)', value: '?all' },
];

function toggleProvider(val: string) {
  const idx = spfProviders.value.indexOf(val);
  if (idx === -1) spfProviders.value.push(val);
  else spfProviders.value.splice(idx, 1);
}

const spfRecord = computed(() => {
  const parts = ['v=spf1'];
  for (const p of spfProviders.value) parts.push(p);
  const ips = spfCustomIps.value.split(/[\s,;]+/).map(ip => ip.trim()).filter(Boolean);
  for (const ip of ips) {
    if (ip.includes('/')) parts.push(ip.includes(':') ? `ip6:${ip}` : `ip4:${ip}`);
    else if (ip.includes(':')) parts.push(`ip6:${ip}`);
    else parts.push(`ip4:${ip}`);
  }
  parts.push(spfEnforcement.value);
  return parts.join(' ');
});

const spfLookupCount = computed(() => spfProviders.value.length);

// SPF enforcement dropdown
const spfEnfMenu = ref(false);
const spfEnfRef = ref<HTMLElement | null>(null);
onClickOutside(spfEnfRef, () => { spfEnfMenu.value = false; });
const spfEnfLabel = computed(() => spfEnforcementOptions.find(o => o.value === spfEnforcement.value)?.label ?? spfEnforcement.value);

// --- DMARC ---
const dmarcPolicy = ref('reject');
const dmarcSubdomainPolicy = ref('');
const dmarcPercentage = ref(100);
const dmarcRuaEmail = ref('');
const dmarcRufEmail = ref('');
const dmarcAdkim = ref('');
const dmarcAspf = ref('');

const dmarcPolicyOptions = [
  { label: 'reject (block failing mail)', value: 'reject' },
  { label: 'quarantine (send to spam)', value: 'quarantine' },
  { label: 'none (monitor only)', value: 'none' },
];

const dmarcAlignmentOptions = [
  { label: 'Relaxed (default)', value: '' },
  { label: 'Strict', value: 's' },
];

// DMARC policy dropdown
const dmarcPolMenu = ref(false);
const dmarcPolRef = ref<HTMLElement | null>(null);
onClickOutside(dmarcPolRef, () => { dmarcPolMenu.value = false; });
const dmarcPolLabel = computed(() => dmarcPolicyOptions.find(o => o.value === dmarcPolicy.value)?.label ?? dmarcPolicy.value);

// DMARC subdomain policy dropdown
const dmarcSpMenu = ref(false);
const dmarcSpRef = ref<HTMLElement | null>(null);
onClickOutside(dmarcSpRef, () => { dmarcSpMenu.value = false; });
const dmarcSpOptions = computed(() => [{ label: 'Same as main policy', value: '' }, ...dmarcPolicyOptions]);
const dmarcSpLabel = computed(() => dmarcSpOptions.value.find(o => o.value === dmarcSubdomainPolicy.value)?.label ?? 'Same as main policy');

const dmarcRecord = computed(() => {
  const parts = [`v=DMARC1; p=${dmarcPolicy.value}`];
  if (dmarcSubdomainPolicy.value) parts.push(`sp=${dmarcSubdomainPolicy.value}`);
  if (dmarcPercentage.value < 100) parts.push(`pct=${dmarcPercentage.value}`);
  if (dmarcRuaEmail.value.trim()) {
    const emails = dmarcRuaEmail.value.split(/[\s,;]+/).filter(Boolean).map(e => `mailto:${e.replace(/^mailto:/, '')}`).join(',');
    parts.push(`rua=${emails}`);
  }
  if (dmarcRufEmail.value.trim()) {
    const emails = dmarcRufEmail.value.split(/[\s,;]+/).filter(Boolean).map(e => `mailto:${e.replace(/^mailto:/, '')}`).join(',');
    parts.push(`ruf=${emails}`);
  }
  if (dmarcAdkim.value) parts.push(`adkim=${dmarcAdkim.value}`);
  if (dmarcAspf.value) parts.push(`aspf=${dmarcAspf.value}`);
  return parts.join('; ');
});
</script>

<template>
  <div class="erg-wrap">

    <!-- Tab switcher -->
    <div class="erg-tabs">
      <button
        type="button"
        class="erg-tab"
        :class="{ 'erg-tab-active': activeTab === 'spf' }"
        @click="activeTab = 'spf'"
      >
        SPF
      </button>
      <button
        type="button"
        class="erg-tab"
        :class="{ 'erg-tab-active': activeTab === 'dmarc' }"
        @click="activeTab = 'dmarc'"
      >
        DMARC
      </button>
    </div>

    <!-- ═══ SPF TAB ═══ -->
    <div v-if="activeTab === 'spf'" class="erg-terminal">

      <!-- Record output -->
      <div class="erg-record-area" @click="copyValue(spfRecord)">
        <div class="erg-record-meta">
          <span class="erg-record-label">&gt;_ TXT record on your root domain (@)</span>
          <span class="erg-copy-hint">{{ copiedValue === spfRecord ? '✓ copied' : 'click to copy' }}</span>
        </div>
        <pre class="erg-record-text">{{ spfRecord }}</pre>
        <div v-if="spfLookupCount > 8" class="erg-warn">
          ⚠ {{ spfLookupCount }} DNS lookups selected — SPF has a 10-lookup limit
        </div>
      </div>

      <!-- Mail providers -->
      <div class="erg-section-header">MAIL PROVIDERS</div>
      <div class="erg-pill-grid">
        <button
          v-for="opt in spfProviderOptions"
          :key="opt.value"
          type="button"
          class="erg-pill"
          :class="{ 'erg-pill-active': spfProviders.includes(opt.value) }"
          @click="toggleProvider(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Custom IPs -->
      <div class="erg-section-header">CUSTOM IPs OR RANGES (OPTIONAL)</div>
      <div class="erg-input-area">
        <input
          v-model="spfCustomIps"
          class="erg-input"
          placeholder="e.g. 203.0.113.5, 198.51.100.0/24"
          spellcheck="false"
        >
      </div>

      <!-- Enforcement -->
      <div class="erg-section-header">ENFORCEMENT</div>
      <div ref="spfEnfRef" class="erg-dropdown-area">
        <button
          type="button"
          class="erg-dd-btn"
          :class="{ 'erg-dd-btn-open': spfEnfMenu }"
          @click="spfEnfMenu = !spfEnfMenu"
        >
          <span class="erg-dd-label">{{ spfEnfLabel }}</span>
          <span class="erg-dd-caret">{{ spfEnfMenu ? '▴' : '▾' }}</span>
        </button>
        <div v-if="spfEnfMenu" class="erg-dd-menu">
          <button
            v-for="opt in spfEnforcementOptions"
            :key="opt.value"
            type="button"
            class="erg-dd-option"
            :class="{ 'erg-dd-option-active': spfEnforcement === opt.value }"
            @click="spfEnforcement = opt.value; spfEnfMenu = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

    </div>

    <!-- ═══ DMARC TAB ═══ -->
    <div v-else class="erg-terminal">

      <!-- Record output -->
      <div class="erg-record-area" @click="copyValue(dmarcRecord)">
        <div class="erg-record-meta">
          <span class="erg-record-label">&gt;_ TXT record on _dmarc.yourdomain.com</span>
          <span class="erg-copy-hint">{{ copiedValue === dmarcRecord ? '✓ copied' : 'click to copy' }}</span>
        </div>
        <pre class="erg-record-text">{{ dmarcRecord }}</pre>
      </div>

      <!-- Policy -->
      <div class="erg-section-header">POLICY</div>
      <div ref="dmarcPolRef" class="erg-dropdown-area">
        <button
          type="button"
          class="erg-dd-btn"
          :class="{ 'erg-dd-btn-open': dmarcPolMenu }"
          @click="dmarcPolMenu = !dmarcPolMenu"
        >
          <span class="erg-dd-label">{{ dmarcPolLabel }}</span>
          <span class="erg-dd-caret">{{ dmarcPolMenu ? '▴' : '▾' }}</span>
        </button>
        <div v-if="dmarcPolMenu" class="erg-dd-menu">
          <button
            v-for="opt in dmarcPolicyOptions"
            :key="opt.value"
            type="button"
            class="erg-dd-option"
            :class="{ 'erg-dd-option-active': dmarcPolicy === opt.value }"
            @click="dmarcPolicy = opt.value; dmarcPolMenu = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Subdomain policy -->
      <div class="erg-section-header">SUBDOMAIN POLICY (OPTIONAL)</div>
      <div ref="dmarcSpRef" class="erg-dropdown-area">
        <button
          type="button"
          class="erg-dd-btn"
          :class="{ 'erg-dd-btn-open': dmarcSpMenu }"
          @click="dmarcSpMenu = !dmarcSpMenu"
        >
          <span class="erg-dd-label">{{ dmarcSpLabel }}</span>
          <span class="erg-dd-caret">{{ dmarcSpMenu ? '▴' : '▾' }}</span>
        </button>
        <div v-if="dmarcSpMenu" class="erg-dd-menu">
          <button
            v-for="opt in dmarcSpOptions"
            :key="opt.value"
            type="button"
            class="erg-dd-option"
            :class="{ 'erg-dd-option-active': dmarcSubdomainPolicy === opt.value }"
            @click="dmarcSubdomainPolicy = opt.value; dmarcSpMenu = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Percentage -->
      <div class="erg-section-header">POLICY COVERAGE — {{ dmarcPercentage }}%</div>
      <div class="erg-slider-area">
        <input
          v-model.number="dmarcPercentage"
          type="range"
          :min="0"
          :max="100"
          :step="5"
          class="erg-slider"
        >
        <div class="erg-slider-hint">{{ dmarcPercentage }}% of failing mail will be acted on. Use less than 100% for gradual rollout.</div>
      </div>

      <!-- RUA email -->
      <div class="erg-section-header">AGGREGATE REPORT EMAIL (rua)</div>
      <div class="erg-input-area">
        <input
          v-model="dmarcRuaEmail"
          class="erg-input"
          placeholder="e.g. dmarc-reports@yourdomain.com"
          spellcheck="false"
        >
      </div>

      <!-- RUF email -->
      <div class="erg-section-header">FORENSIC REPORT EMAIL (ruf, optional)</div>
      <div class="erg-input-area">
        <input
          v-model="dmarcRufEmail"
          class="erg-input"
          placeholder="e.g. dmarc-forensic@yourdomain.com"
          spellcheck="false"
        >
      </div>

      <!-- DKIM alignment -->
      <div class="erg-section-header">DKIM ALIGNMENT</div>
      <div class="erg-pill-row">
        <button
          v-for="opt in dmarcAlignmentOptions"
          :key="opt.value"
          type="button"
          class="erg-pill"
          :class="{ 'erg-pill-active': dmarcAdkim === opt.value }"
          @click="dmarcAdkim = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- SPF alignment -->
      <div class="erg-section-header">SPF ALIGNMENT</div>
      <div class="erg-pill-row erg-pill-row-last">
        <button
          v-for="opt in dmarcAlignmentOptions"
          :key="opt.value"
          type="button"
          class="erg-pill"
          :class="{ 'erg-pill-active': dmarcAspf === opt.value }"
          @click="dmarcAspf = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Outer wrap ── */
.erg-wrap {
  flex: 1 1 900px;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  container-type: inline-size;
}

/* ── Tab switcher ── */
.erg-tabs {
  display: flex;
  gap: 6px;
}

.erg-tab {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 6px 20px;
  border-radius: 6px;
  border: 1px solid rgba(30, 165, 76, 0.25);
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.erg-tab:hover {
  border-color: rgba(30, 165, 76, 0.5);
  color: rgba(255, 255, 255, 0.7);
}

.erg-tab-active {
  background: rgba(30, 165, 76, 0.15) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

/* ── Terminal panel ── */
.erg-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Record output ── */
.erg-record-area {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.1s;
}

.erg-record-area:hover {
  background: rgba(30, 165, 76, 0.04);
}

.erg-record-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.erg-record-label {
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.55);
}

.erg-copy-hint {
  font-size: 0.68rem;
  color: rgba(30, 165, 76, 0.45);
  white-space: nowrap;
}

.erg-record-text {
  margin: 0;
  color: #1ea54c;
  font-size: 0.88rem;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.erg-warn {
  margin-top: 8px;
  font-size: 0.72rem;
  color: #f0a020;
}

/* ── Section headers ── */
.erg-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Provider pill grid ── */
.erg-pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* ── Alignment pill rows ── */
.erg-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.erg-pill-row-last {
  border-bottom: none;
}

/* ── Pills (shared) ── */
.erg-pill {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 11px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.erg-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.erg-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

/* ── Input areas ── */
.erg-input-area {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.erg-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.erg-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* ── Slider ── */
.erg-slider-area {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.erg-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(30, 165, 76, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  margin-bottom: 6px;
}

.erg-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1ea54c;
  cursor: pointer;
  border: 2px solid rgba(0, 0, 0, 0.6);
  transition: transform 0.12s;
}

.erg-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1ea54c;
  cursor: pointer;
  border: 2px solid rgba(0, 0, 0, 0.6);
}

.erg-slider:hover::-webkit-slider-thumb { transform: scale(1.2); }

.erg-slider-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.4;
}

/* ── Custom dropdowns ── */
.erg-dropdown-area {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.erg-dd-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  cursor: pointer;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.12s;
  width: 100%;
  max-width: 440px;
}

.erg-dd-btn:hover,
.erg-dd-btn-open {
  color: #1ea54c;
}

.erg-dd-label {
  flex: 1;
  text-align: left;
}

.erg-dd-caret {
  font-size: 0.7rem;
  color: rgba(30, 165, 76, 0.65);
}

.erg-dd-menu {
  position: absolute;
  top: calc(100% - 2px);
  left: 12px;
  min-width: 300px;
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.5);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 50;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.erg-dd-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.erg-dd-option:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.35);
  color: #1ea54c;
}

.erg-dd-option-active {
  background: rgba(30, 165, 76, 0.15);
  border-color: rgba(30, 165, 76, 0.55);
  color: #1ea54c;
}
</style>
