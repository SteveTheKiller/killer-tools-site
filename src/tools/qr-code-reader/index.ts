import { Qrcode } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.qrcode-reader.title'),
  path: '/qrcode-reader',
  description: translate('tools.qrcode-reader.description'),
  keywords: ['qr', 'qrcode', 'reader', 'scan', 'image', 'local', 'wifi'],
  component: () => import('./qr-code-reader.vue'),
  fullscreen: true,
  icon: Qrcode,
  createdAt: new Date('2026-10-18'),
});
