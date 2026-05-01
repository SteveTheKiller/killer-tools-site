<script setup lang="ts">
import { useTimestamp } from '@vueuse/core';
import { useQRCode } from '../qr-code-generator/useQRCode';
import { base32toHex, buildKeyUri, generateSecret, generateTOTP, getCounterFromTime } from './otp.service';
import { useStyleStore } from '@/stores/style.store';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';

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

const secretValidationRules = [
  {
    message: 'Secret should be a base32 string',
    validator: (value: string) => value.toUpperCase().match(/^[A-Z234567]+$/),
  },
  {
    message: 'Please set a secret',
    validator: (value: string) => value !== '',
  },
];
</script>

<template>
  <div class="otp-layout">
    <div class="otp-columns">
      <!-- LEFT: controls -->
      <div class="otp-col otp-left">
        <c-card>
          <!-- Secret input -->
          <div class="otp-section-label">
            Secret
          </div>
          <c-input-text
            v-model:value="secret"
            placeholder="Paste your TOTP secret..."
            :validation-rules="secretValidationRules"
            font-mono
          >
            <template #suffix>
              <c-tooltip tooltip="Generate a new random secret">
                <c-button circle variant="text" size="small" @click="refreshSecret">
                  <icon-mdi-refresh />
                </c-button>
              </c-tooltip>
            </template>
          </c-input-text>

          <!-- Token display -->
          <div class="otp-section-label" style="margin-top: 16px;">
            Token
          </div>

          <!-- Current OTP -->
          <div class="otp-token-frame" @click="copyCurrent(tokens.current)">
            <div class="otp-token-digits">
              {{ tokens.current }}
            </div>
            <div class="otp-token-hint">
              {{ currentCopied ? 'Copied!' : 'Click to copy' }}
            </div>
          </div>

          <!-- Progress bar -->
          <div class="otp-progress-wrap">
            <div class="otp-progress-bar" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="otp-countdown">
            >_ next in {{ String(secondsRemaining).padStart(2, '0') }}s
          </div>

          <!-- Previous / Next -->
          <div class="otp-section-label" style="margin-top: 14px;">
            Adjacent tokens
          </div>
          <div class="otp-adj-row">
            <c-tooltip :tooltip="previousCopied ? 'Copied!' : 'Copy previous token'" position="bottom">
              <button class="otp-adj-btn" @click="copyPrevious(tokens.previous)">
                <span class="otp-adj-label">Prev</span>
                <span class="otp-adj-value">{{ tokens.previous }}</span>
              </button>
            </c-tooltip>
            <c-tooltip :tooltip="nextCopied ? 'Copied!' : 'Copy next token'" position="bottom">
              <button class="otp-adj-btn" @click="copyNext(tokens.next)">
                <span class="otp-adj-label">Next</span>
                <span class="otp-adj-value">{{ tokens.next }}</span>
              </button>
            </c-tooltip>
          </div>

          <!-- Details -->
          <div class="otp-section-label" style="margin-top: 16px;">
            Details
          </div>
          <div class="otp-details-grid">
            <span class="otp-detail-key">Secret (hex)</span>
            <span class="otp-detail-val">{{ base32toHex(secret) }}</span>
            <span class="otp-detail-key">Epoch</span>
            <span class="otp-detail-val">{{ Math.floor(now / 1000) }}</span>
            <span class="otp-detail-key">Count</span>
            <span class="otp-detail-val">{{ getCounterFromTime({ now, timeStep: 30 }) }}</span>
            <span class="otp-detail-key">Padded hex</span>
            <span class="otp-detail-val">{{ getCounterFromTime({ now, timeStep: 30 }).toString(16).padStart(16, '0') }}</span>
          </div>
        </c-card>
      </div>

      <!-- RIGHT: QR preview -->
      <div class="otp-col otp-right">
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
/* ── Layout ─────────────────────────────────────────────────────── */
.otp-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.otp-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.otp-left {
  flex: 1 1 440px;
  max-width: 560px;
}

.otp-right {
  flex: 1 1 380px;
  max-width: 500px;
  align-items: center;
}

@container (max-width: 860px) {
  .otp-columns {
    flex-direction: column;
  }

  .otp-left,
  .otp-right {
    flex: 1 1 100%;
    max-width: none;
  }
}

/* ── Section labels ─────────────────────────────────────────────── */
.otp-section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  margin: 0 0 6px;
  font-weight: 500;
}

/* ── Token frame (the big OTP display) ─────────────────────────── */
.otp-token-frame {
  background: rgba(30, 165, 76, 0.06);
  border: 1px solid rgba(30, 165, 76, 0.4);
  border-radius: 10px;
  padding: 18px 20px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 0 20px rgba(30, 165, 76, 0.1), inset 0 0 30px rgba(30, 165, 76, 0.04);
}

.otp-token-frame:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.65);
  box-shadow: 0 0 28px rgba(30, 165, 76, 0.2), inset 0 0 30px rgba(30, 165, 76, 0.06);
}

.otp-token-digits {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 2.6rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: #1ea54c;
  line-height: 1;
}

.otp-token-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.5);
  letter-spacing: 0.04em;
}

/* ── Progress bar ───────────────────────────────────────────────── */
.otp-progress-wrap {
  margin-top: 10px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.otp-progress-bar {
  height: 100%;
  background: #1ea54c;
  border-radius: 2px;
  transition: width 0.05s linear;
}

.otp-countdown {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(30, 165, 76, 0.6);
  text-align: center;
  margin-top: 5px;
  letter-spacing: 0.03em;
}

/* ── Adjacent tokens ────────────────────────────────────────────── */
.otp-adj-row {
  display: flex;
  gap: 8px;
}

.otp-adj-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  font-family: inherit;
}

.otp-adj-btn:hover {
  background: rgba(30, 165, 76, 0.08);
  border-color: rgba(30, 165, 76, 0.35);
}

.otp-adj-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  font-weight: 500;
}

.otp-adj-value {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1.05rem;
  font-weight: 600;
  color: rgba(30, 165, 76, 0.75);
  letter-spacing: 0.12em;
}

/* ── Details grid ───────────────────────────────────────────────── */
.otp-details-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 0.76rem;
}

.otp-detail-key {
  opacity: 0.45;
  white-space: nowrap;
  padding-top: 1px;
}

.otp-detail-val {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.8);
  word-break: break-all;
}

/* ── QR frame (same as qr-code-generator) ──────────────────────── */
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
}

.qr-frame:hover {
  border-color: rgba(30, 165, 76, 0.7);
  box-shadow:
    0 0 0 1px rgba(30, 165, 76, 0.15),
    0 0 44px rgba(30, 165, 76, 0.28),
    inset 0 0 48px rgba(30, 165, 76, 0.08);
}

::v-deep(.qr-image) {
  width: 100%;
  aspect-ratio: 1 / 1;
}

::v-deep(.qr-image) img {
  width: 100%;
  height: auto;
  display: block;
}

.qr-caption {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(30, 165, 76, 0.75);
  letter-spacing: 0.02em;
  margin-top: 4px;
}

.qr-open-btn {
  margin-top: 4px;
}
</style>
