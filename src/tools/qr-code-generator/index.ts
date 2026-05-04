import { Qrcode } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.qrcode-generator.title'),
  path: '/qrcode-generator',
  description: translate('tools.qrcode-generator.description'),
  keywords: [
    'qr',
    'qrcode',
    'code',
    'generator',
    'square',
    'color',
    'link',
    'url',
    'wifi',
    'wi-fi',
    'ssid',
    'psk',
    'wpa',
    'wep',
    'eap',
    'low',
    'medium',
    'quartile',
    'high',
    'transparent',
  ],
  component: () => import('./qr-code-generator.vue'),
  fullscreen: true,
  icon: Qrcode,
  createdAt: new Date('2026-03-01'),
});
