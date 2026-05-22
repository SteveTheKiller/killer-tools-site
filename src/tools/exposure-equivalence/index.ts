import { Adjustments } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.exposure-equivalence.title'),
  path: '/exposure-equivalence',
  description: translate('tools.exposure-equivalence.description'),
  keywords: [
    'exposure',
    'equivalence',
    'equivalent exposure',
    'aperture',
    'shutter speed',
    'iso',
    'photography',
    'calculator',
    'ev',
    'exposure value',
    'reciprocity',
    'stops',
  ],
  component: () => import('./exposure-equivalence.vue'),
  fullscreen: true,
  icon: Adjustments,
  createdAt: new Date('2026-05-21'),
});
