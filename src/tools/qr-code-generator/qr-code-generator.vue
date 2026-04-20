<script setup lang="ts">
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { computed, ref } from 'vue';
import {
  type EAPMethod,
  EAPMethods,
  type EAPPhase2Method,
  EAPPhase2Methods,
  type WifiEncryption,
  buildWifiQRText,
  useQRCode,
} from './useQRCode';
import { useDownloadFileFromBase64Refs } from '@/composable/downloadBase64';

type Mode = 'text' | 'wifi';

const mode = ref<Mode>('text');

// Text / URL input
const text = ref('https://killertools.net');

// Wi-Fi inputs
const ssid = ref('');
const wifiPassword = ref('');
const encryption = ref<WifiEncryption>('WPA');
const isHiddenSSID = ref(false);
const eapMethod = ref<EAPMethod | null>(null);
const eapAnonymous = ref(false);
const eapIdentity = ref('');
const eapPhase2Method = ref<EAPPhase2Method | null>(null);

// Shared QR options
const foreground = ref('#1ea54cff');
const background = ref('#0a0a0aff');
const errorCorrectionLevel = ref<QRCodeErrorCorrectionLevel>('medium');

const encryptionOptions: Array<{ label: string; value: WifiEncryption }> = [
  { label: 'WPA/WPA2', value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: 'No password', value: 'nopass' },
  { label: 'WPA2-EAP', value: 'WPA2-EAP' },
];

const errorLevels: Array<{ label: string; value: QRCodeErrorCorrectionLevel }> = [
  { label: 'Low (~7%)', value: 'low' },
  { label: 'Medium (~15%)', value: 'medium' },
  { label: 'Quartile (~25%)', value: 'quartile' },
  { label: 'High (~30%)', value: 'high' },
];

const qrText = computed(() => {
  if (mode.value === 'text') {
    return text.value;
  }
  return buildWifiQRText({
    ssid: ssid.value,
    password: wifiPassword.value,
    encryption: encryption.value,
    eapMethod: eapMethod.value,
    isHiddenSSID: isHiddenSSID.value,
    eapAnonymous: eapAnonymous.value,
    eapIdentity: eapIdentity.value,
    eapPhase2Method: eapPhase2Method.value,
  });
});

const { qrcode } = useQRCode({
  text: qrText,
  color: {
    background,
    foreground,
  },
  errorCorrectionLevel,
  options: { width: 1024, margin: 2 },
});

const downloadFilename = computed(() => (mode.value === 'wifi' ? 'wifi-qr.png' : 'qr-code.png'));
const { download } = useDownloadFileFromBase64Refs({
  source: qrcode,
  filename: downloadFilename,
});

function applyTheme(fg: string, bg: string) {
  foreground.value = fg;
  background.value = bg;
}

const caption = computed(() => {
  if (mode.value === 'wifi') {
    return '>_ scan to join';
  }
  return '>_ scan to open';
});
</script>

<template>
  <div class="qrg-layout">
    <div class="qrg-columns">
      <!-- LEFT: controls -->
      <div class="qrg-col qrg-left">
        <c-card>
          <div class="qrg-section-label">
            Type
          </div>
          <div class="qrg-pill-row">
            <button
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': mode === 'text' }"
              @click="mode = 'text'"
            >
              Text / URL
            </button>
            <button
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': mode === 'wifi' }"
              @click="mode = 'wifi'"
            >
              Wi-Fi
            </button>
          </div>

          <!-- ── Text / URL mode ── -->
          <template v-if="mode === 'text'">
            <div class="qrg-section-label">
              Text or URL
            </div>
            <c-input-text
              v-model:value="text"
              multiline
              rows="2"
              autosize
              placeholder="Your link or text..."
            />
          </template>

          <!-- ── Wi-Fi mode ── -->
          <template v-if="mode === 'wifi'">
            <div class="qrg-section-label">
              Encryption
            </div>
            <div class="qrg-pill-row">
              <button
                v-for="enc in encryptionOptions"
                :key="enc.value"
                type="button"
                class="qrg-pill"
                :class="{ 'qrg-pill-active': encryption === enc.value }"
                @click="encryption = enc.value"
              >
                {{ enc.label }}
              </button>
            </div>

            <div class="qrg-section-label">
              SSID
            </div>
            <c-input-text
              v-model:value="ssid"
              placeholder="Network name..."
              autosize
              rows="1"
            />

            <div v-if="encryption !== 'nopass'" class="qrg-section-label">
              Password
            </div>
            <c-input-text
              v-if="encryption !== 'nopass'"
              v-model:value="wifiPassword"
              type="password"
              placeholder="Network password..."
              autosize
              rows="1"
            />

            <div class="qrg-section-label">
              Options
            </div>
            <div class="qrg-pill-row">
              <button
                type="button"
                class="qrg-pill"
                :class="{ 'qrg-pill-active': isHiddenSSID }"
                @click="isHiddenSSID = !isHiddenSSID"
              >
                Hidden SSID
              </button>
              <button
                v-if="encryption === 'WPA2-EAP'"
                type="button"
                class="qrg-pill"
                :class="{ 'qrg-pill-active': eapAnonymous }"
                @click="eapAnonymous = !eapAnonymous"
              >
                Anonymous identity
              </button>
            </div>

            <!-- EAP-specific fields -->
            <template v-if="encryption === 'WPA2-EAP'">
              <div class="qrg-section-label">
                EAP method
              </div>
              <c-select
                v-model:value="eapMethod"
                searchable
                :options="EAPMethods.map((m) => ({ label: m, value: m }))"
              />

              <div class="qrg-section-label">
                EAP phase 2
              </div>
              <c-select
                v-model:value="eapPhase2Method"
                :options="EAPPhase2Methods.map((m) => ({ label: m, value: m }))"
              />

              <div v-if="!eapAnonymous" class="qrg-section-label">
                EAP identity
              </div>
              <c-input-text
                v-if="!eapAnonymous"
                v-model:value="eapIdentity"
                placeholder="Your EAP identity..."
                autosize
                rows="1"
              />
            </template>
          </template>

          <!-- Shared: theme / colors / error correction -->
          <div class="qrg-section-label">
            Theme
          </div>
          <div class="qrg-pill-row">
            <button
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': foreground === '#1ea54cff' && background === '#0a0a0aff' }"
              @click="applyTheme('#1ea54cff', '#0a0a0aff')"
            >
              Terminal
            </button>
            <button
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': foreground === '#000000ff' && background === '#ffffffff' }"
              @click="applyTheme('#000000ff', '#ffffffff')"
            >
              Classic
            </button>
            <button
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': foreground === '#ffffffff' && background === '#000000ff' }"
              @click="applyTheme('#ffffffff', '#000000ff')"
            >
              Inverted
            </button>
          </div>

          <div class="qrg-section-label">
            Colors
          </div>
          <n-form label-width="110" label-placement="left">
            <n-form-item label="Foreground:">
              <n-color-picker v-model:value="foreground" :modes="['hex']" />
            </n-form-item>
            <n-form-item label="Background:">
              <n-color-picker v-model:value="background" :modes="['hex']" />
            </n-form-item>
          </n-form>

          <div class="qrg-section-label">
            Error correction
          </div>
          <div class="qrg-pill-row">
            <button
              v-for="level in errorLevels"
              :key="level.value"
              type="button"
              class="qrg-pill"
              :class="{ 'qrg-pill-active': errorCorrectionLevel === level.value }"
              @click="errorCorrectionLevel = level.value"
            >
              {{ level.label }}
            </button>
          </div>
        </c-card>
      </div>

      <!-- RIGHT: QR preview -->
      <div class="qrg-col qrg-right">
        <div v-if="qrcode" class="qr-frame">
          <n-image :src="qrcode" class="qr-image" />
        </div>
        <div v-else class="qr-frame qr-frame-empty">
          <span class="qr-empty-hint">
            {{ mode === 'wifi' ? 'Enter an SSID to generate a Wi-Fi QR' : 'Enter text or a URL' }}
          </span>
        </div>
        <div v-if="qrcode" class="qr-caption">
          {{ caption }}
        </div>
        <c-button v-if="qrcode" class="qr-download" @click="download">
          Download PNG
        </c-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.qrg-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 900px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  container-type: inline-size;
}

.qrg-columns {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.qrg-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qrg-left {
  flex: 1 1 440px;
  max-width: 560px;
}

.qrg-right {
  flex: 1 1 420px;
  max-width: 560px;
  align-items: center;
}

@container (max-width: 900px) {
  .qrg-columns {
    flex-direction: column;
  }

  .qrg-left,
  .qrg-right {
    flex: 1 1 100%;
    max-width: none;
  }
}

/* ── Section labels + pill rows (matches password generator) ────── */
.qrg-section-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  margin: 10px 0 6px;
  font-weight: 500;
}

.qrg-section-label:first-child {
  margin-top: 0;
}

.qrg-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 2px;
}

.qrg-pill {
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 3px 11px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.qrg-pill:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.4);
  color: #1ea54c;
}

.qrg-pill-active {
  background: rgba(30, 165, 76, 0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

/* ── Terminal-framed QR code ─────────────────────────────────────── */
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
  max-width: 500px;
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

.qr-frame-empty {
  border-style: dashed;
}

.qr-empty-hint {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(30, 165, 76, 0.55);
  text-align: center;
  padding: 0 24px;
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

.qr-download {
  margin-top: 4px;
}
</style>
