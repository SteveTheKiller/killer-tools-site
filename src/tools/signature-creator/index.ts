import { Edit } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.signature-creator.title'),
  path: '/signature-creator',
  description: translate('tools.signature-creator.description'),
  keywords: [
    'signature',
    'sign',
    'draw',
    'canvas',
    'transparent',
    'png',
    'background',
    'remove',
    'erase',
    'image',
    'photo',
  ],
  component: () => import('./signature-creator.vue'),
  fullscreen: true,
  icon: Edit,
  createdAt: new Date('2026-05-25'),
});
