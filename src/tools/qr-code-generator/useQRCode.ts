import { type MaybeRef, get } from '@vueuse/core';
import QRCode, { type QRCodeErrorCorrectionLevel, type QRCodeToDataURLOptions } from 'qrcode';
import { isRef, ref, watch } from 'vue';

export function useQRCode({
  text,
  color: { background, foreground },
  errorCorrectionLevel,
  options,
}: {
  text: MaybeRef<string>
  color: { foreground: MaybeRef<string>; background: MaybeRef<string> }
  errorCorrectionLevel?: MaybeRef<QRCodeErrorCorrectionLevel>
  options?: QRCodeToDataURLOptions
}) {
  const qrcode = ref('');

  watch(
    [text, background, foreground, errorCorrectionLevel].filter(isRef),
    async () => {
      if (get(text)) {
        qrcode.value = await QRCode.toDataURL(get(text).trim(), {
          color: {
            dark: get(foreground),
            light: get(background),
            ...options?.color,
          },
          errorCorrectionLevel: get(errorCorrectionLevel) ?? 'M',
          ...options,
        });
      }
      else {
        qrcode.value = '';
      }
    },
    { immediate: true },
  );

  return { qrcode };
}

// ── Wi-Fi QR helpers ───────────────────────────────────────────────

export const wifiEncryptions = ['nopass', 'WPA', 'WEP', 'WPA2-EAP'] as const;
export type WifiEncryption = typeof wifiEncryptions[number];

// https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol
export const EAPMethods = [
  'MD5', 'POTP', 'GTC', 'TLS', 'IKEv2', 'SIM', 'AKA', 'AKA\'',
  'TTLS', 'PWD', 'LEAP', 'PSK', 'FAST', 'TEAP', 'EKE', 'NOOB', 'PEAP',
] as const;
export type EAPMethod = typeof EAPMethods[number];

export const EAPPhase2Methods = ['None', 'MSCHAPV2'] as const;
export type EAPPhase2Method = typeof EAPPhase2Methods[number];

function escapeWifiString(str: string) {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

export interface WifiQRParams {
  ssid: string
  password: string
  encryption: WifiEncryption
  eapMethod: EAPMethod | null
  isHiddenSSID: boolean
  eapAnonymous: boolean
  eapIdentity: string
  eapPhase2Method: EAPPhase2Method | null
}

export function buildWifiQRText(params: WifiQRParams): string {
  const {
    ssid,
    password,
    encryption,
    eapMethod,
    isHiddenSSID,
    eapAnonymous,
    eapIdentity,
    eapPhase2Method,
  } = params;

  if (!ssid) {
    return '';
  }

  const hiddenSuffix = isHiddenSSID ? 'H:true;' : '';

  if (encryption === 'nopass') {
    return `WIFI:S:${escapeWifiString(ssid)};;${hiddenSuffix}`;
  }

  if (encryption !== 'WPA2-EAP' && password) {
    return `WIFI:S:${escapeWifiString(ssid)};T:${encryption};P:${escapeWifiString(password)};${hiddenSuffix}`;
  }

  if (encryption === 'WPA2-EAP' && password && eapMethod) {
    if (!eapIdentity && !eapAnonymous) {
      return '';
    }
    if (eapMethod === 'PEAP' && !eapPhase2Method) {
      return '';
    }
    const identity = eapAnonymous ? 'A:anon' : `I:${escapeWifiString(eapIdentity)}`;
    const phase2 = eapPhase2Method && eapPhase2Method !== 'None' ? `PH2:${eapPhase2Method};` : '';
    return `WIFI:S:${escapeWifiString(ssid)};T:WPA2-EAP;P:${escapeWifiString(password)};E:${eapMethod};${phase2}${identity};${hiddenSuffix}`;
  }

  return '';
}
