<script setup lang="ts">
import { useTimestamp } from '@vueuse/core';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { useStyleStore } from '@/stores/style.store';
import { useQRCode } from '../qr-code-generator/useQRCode';
import { base32toHex, buildKeyUri, generateSecret, generateTOTP, getCounterFromTime } from './otp.service';

const now = useTimestamp();
const interval = computed(() => (now.value / 1000) % 30);
const styleStore = useStyleStore();

const secret = ref(generateSecret());

function refreshSecret() {
  secret.value = generateSecret();
}

const [tokens] = computedRefreshable(
  () => ({
    previous: generateTOTP({ key: secret.value, now: now.value - 30000 }),
    current: generateTOTP({ key: secret.value, now: now.value }),
    next: generateTOTP({ key: secret.value, now: now.value + 30000 }),
  }),
  { throttle: 500 },
);

const keyUri = computed(() => buildKeyUri({ secret: secret.value }));

const { qrcode } = useQRCode({
  text: keyUri,
  color: {
    background: computed(() => (styleStore.isDarkTheme ? '#0a0a0aff' : '#ffffffff')),
    foreground: computed(() => (styleStore.isDarkTheme ? '#1ea54cff' : '#000000ff')),
  },
  options: { width: 512, margin: 2 },
});

const { copy: copyCurrent, isJustCopied: currentCopied } = useCopy({ createToast: false });
const { copy: copyPrevious, isJustCopied: previousCopied } = useCopy({ createToast: false });
const { copy: copyNext, isJustCopied: nextCopied } = useCopy({ createToast: false });

const secondsRemaining = computed(() => Math.floor(30 - interval.value));
const progressPercent = computed(() => (100 * interval.value) / 30);

const _secretValidationRules = [
  {
    message: 'Secret should be a base32 string',
    validator: (value: string) => value.toUpperCase().match(/^[A-Z2-7]+$/),
  },
  {
    message: 'Please set a secret',
    validator: (value: string) => value !== '',
  },
];

const details = computed(() => [
  { label: 'Secret (hex)', value: base32toHex(secret.value) },
  { label: 'Epoch', value: String(Math.floor(now.value / 1000)) },
  { label: 'Count', value: String(getCounterFromTime({ now: now.value, timeStep: 30 })) },
  { label: 'Padded hex', value: getCounterFromTime({ now: now.value, timeStep: 30 }).toString(16).padStart(16, '0') },
]);
</script>

<template>
  <div class="otp-layout">
    <div class="otp-columns">
      <!-- LEFT: terminal panel -->
      <div class="otp-left">
        <div class="otp-terminal">
          <!-- SECRET input -->
          <div class="otp-input-area">
            <label class="otp-field-label">Secret</label>
            <div class="otp-input-row">
              <input
                v-model="secret"
                class="otp-input"
                spellcheck="false"
                autocomplete="off"
                placeholder="Paste your TOTP secret..."
              >
              <button class="otp-refresh-btn" title="Generate new secret" @click="refreshSecret">
                <icon-mdi-refresh />
              </button>
            </div>
          </div>

          <!-- TOKEN section header -->
          <div class="otp-section-header">
            TOKEN
          </div>

          <!-- Big token display -->
          <div class="otp-token-frame" @click="copyCurrent(tokens.current)">
            <div class="otp-token-digits">
              {{ tokens.current }}
            </div>
            <div class="otp-token-hint">
              {{ currentCopied ? '✓ copied' : 'click to copy' }}
            </div>
          </div>

          <!-- Progress bar -->
          <div class="otp-progress-wrap">
            <div class="otp-progress-bar" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="otp-countdown">
            >_ next in {{ String(secondsRemaining).padStart(2, '0') }}s
          </div>

          <!-- ADJACENT TOKENS -->
          <div class="otp-section-header">
            ADJACENT TOKENS
          </div>

          <div class="otp-row" @click="copyPrevious(tokens.previous)">
            <span class="otp-prompt">>_</span>
            <span class="otp-label">Prev</span>
            <span class="otp-value">{{ tokens.previous }}</span>
            <span class="otp-copy" :class="{ 'otp-copy-done': previousCopied }">
              <span v-if="previousCopied">✓</span>
              <icon-mdi-content-copy v-else />
            </span>
          </div>
          <div class="otp-row" @click="copyNext(tokens.next)">
            <span class="otp-prompt">>_</span>
            <span class="otp-label">Next</span>
            <span class="otp-value">{{ tokens.next }}</span>
            <span class="otp-copy" :class="{ 'otp-copy-done': nextCopied }">
              <span v-if="nextCopied">✓</span>
              <icon-mdi-content-copy v-else />
            </span>
          </div>

          <!-- DETAILS -->
          <div class="otp-section-header">
            DETAILS
          </div>

          <div v-for="detail in details" :key="detail.label" class="otp-row otp-row-detail">
            <span class="otp-prompt">>_</span>
            <span class="otp-label">{{ detail.label }}</span>
            <span class="otp-value otp-value-sm">{{ detail.value }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: QR panel -->
      <div class="otp-right">
        <div v-if="qrcode" class="qr-frame">
          <n-image :src="qrcode" class="qr-image" preview-disabled />
        </div>
        <div class="qr-caption">
          >_ scan to authenticate
        </div>
        <c-button :href="keyUri" target="_blank" class="qr-open-btn">
          Open Key URI in new tab
        </c-button>
      </div>

    </div>
  </div>
</template>

<style scoped lang="less">
/* ── Layout ── */
.otp-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 900px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  container-type: inline-size;
}

.otp-columns {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.otp-left {
  flex: 1 1 440px;
  max-width: 560px;
  min-width: 0;
}

.otp-right {
  flex: 1 1 380px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

@container (max-width: 860px) {
  .otp-columns { flex-direction: column; }
  .otp-left, .otp-right { flex: 1 1 100%; max-width: none; }
}

/* ── Terminal panel ── */
.otp-terminal {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Secret input area ── */
.otp-input-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.otp-field-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.otp-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.otp-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  min-width: 0;
  &::placeholder { color: rgba(255, 255, 255, 0.2); }
}

.otp-refresh-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(30, 165, 76, 0.5);
  padding: 2px 4px;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  transition: color 0.12s;
  flex-shrink: 0;
  &:hover { color: #1ea54c; }
}

/* ── Section headers ── */
.otp-section-header {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  padding: 5px 12px 3px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* ── Token display ── */
.otp-token-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 16px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  &:hover { background: rgba(30, 165, 76, 0.04); }
}

.otp-token-digits {
  font-size: 2.8rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: #1ea54c;
  line-height: 1;
}

.otp-token-hint {
  font-size: 0.7rem;
  color: rgba(30, 165, 76, 0.45);
  letter-spacing: 0.04em;
}

/* ── Progress + countdown ── */
.otp-progress-wrap {
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.otp-progress-bar {
  height: 100%;
  background: #1ea54c;
  transition: width 0.05s linear;
}

.otp-countdown {
  font-size: 0.73rem;
  color: rgba(30, 165, 76, 0.55);
  text-align: center;
  padding: 5px 12px 6px;
  letter-spacing: 0.03em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* ── Rows (adjacent + details) ── */
.otp-row {
  display: grid;
  grid-template-columns: auto 110px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  cursor: pointer;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(30, 165, 76, 0.05); }
}

.otp-row-detail {
  cursor: default;
  &:hover { background: transparent; }
}

.otp-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
}

.otp-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  white-space: nowrap;
}

.otp-value {
  color: #1ea54c;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  min-width: 0;
}

.otp-value-sm {
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0;
  word-break: break-all;
  color: rgba(30, 165, 76, 0.8);
}

.otp-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.4);
  transition: color 0.12s;
  flex-shrink: 0;
}

.otp-row:hover .otp-copy { color: rgba(30, 165, 76, 0.8); }

.otp-copy-done { color: #1ea54c !important; }

/* ── QR panel ── */
.qr-frame {
  background: #0a0a0a;
  border: 1px solid rgba(30, 165, 76, 0.45);
  border-radius: 12px;
  padding: 18px;
  box-shadow:
    0 0 0 1px rgba(30, 165, 76, 0.08),
    0 0 32px rgba(30, 165, 76, 0.18),
    inset 0 0 48px rgba(30, 165, 76, 0.05);
  width: 100%;
  max-width: 420px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  &:hover {
    border-color: rgba(30, 165, 76, 0.7);
    box-shadow:
      0 0 0 1px rgba(30, 165, 76, 0.15),
      0 0 44px rgba(30, 165, 76, 0.28),
      inset 0 0 48px rgba(30, 165, 76, 0.08);
  }
}

::v-deep(.qr-image) { width: 100%; aspect-ratio: 1 / 1; }
::v-deep(.qr-image) img { width: 100%; height: auto; display: block; }

.qr-caption {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(30, 165, 76, 0.75);
  letter-spacing: 0.02em;
}
</style>
