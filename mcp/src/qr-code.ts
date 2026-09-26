import type { McpServer } from '@modelcontextprotocol/server';
import QRCode from 'qrcode';
import { z } from 'zod';
import { buildWifiQRText, EAPMethods, EAPPhase2Methods, wifiEncryptions } from '../../src/tools/qr-code-generator/useQRCode';

const color = z.string().regex(/^#[0-9a-f]{6}$/i);

export function registerQrCode(server: McpServer) {
  server.registerTool('generate_qr_code', {
    description: 'Generate a QR code as SVG for text or Wi-Fi using KillerTools QR code logic. Wi-Fi credentials are part of the encoded output.',
    inputSchema: {
      mode: z.enum(['text', 'wifi']),
      text: z.string().min(1).max(1024).optional(),
      wifi: z.object({
        ssid: z.string().min(1).max(128),
        password: z.string().max(128).default(''),
        encryption: z.enum(wifiEncryptions).default('WPA'),
        eapMethod: z.enum(EAPMethods).nullable().default(null),
        isHiddenSSID: z.boolean().default(false),
        eapAnonymous: z.boolean().default(false),
        eapIdentity: z.string().max(128).default(''),
        eapPhase2Method: z.enum(EAPPhase2Methods).nullable().default(null),
      }).optional(),
      foreground: color.default('#000000'),
      background: color.default('#ffffff'),
      errorCorrectionLevel: z.enum(['low', 'medium', 'quartile', 'high']).default('medium'),
    },
  }, async ({ mode, text, wifi, foreground, background, errorCorrectionLevel }) => {
    const value = mode === 'text' ? text : wifi ? buildWifiQRText(wifi) : undefined;
    if (!value) {
      return { content: [{ type: 'text' as const, text: 'Missing or invalid QR content' }], isError: true };
    }
    try {
      const svg = await QRCode.toString(value, {
        type: 'svg',
        width: 256,
        margin: 2,
        color: { dark: foreground, light: background },
        errorCorrectionLevel,
      });
      if (svg.length > 65_536) {
        throw new Error('QR output is too large');
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify({ svg }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Unable to generate QR code within output limit' }], isError: true };
    }
  });
}
