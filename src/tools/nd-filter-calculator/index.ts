import { Aperture } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.nd-filter-calculator.title'),
  path: '/nd-filter-calculator',
  description: translate('tools.nd-filter-calculator.description'),
  keywords: [
    'nd filter',
    'neutral density',
    'exposure',
    'long exposure',
    'shutter speed',
    'photography',
    'film',
    'analog',
    'calculator',
    'stops',
  ],
  component: () => import('./nd-filter-calculator.vue'),
  fullscreen: true,
  icon: Aperture,
  createdAt: new Date('2026-05-21'),
});
