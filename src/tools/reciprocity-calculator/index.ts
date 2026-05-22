import { Clock } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.reciprocity-calculator.title'),
  path: '/reciprocity-calculator',
  description: translate('tools.reciprocity-calculator.description'),
  keywords: [
    'reciprocity',
    'reciprocity failure',
    'film',
    'analog',
    'exposure',
    'long exposure',
    'schwarzschild',
    'ilford',
    'kodak',
    'fuji',
    'velvia',
    'hp5',
    'acros',
    'photography',
    'calculator',
  ],
  component: () => import('./reciprocity-calculator.vue'),
  fullscreen: true,
  icon: Clock,
  createdAt: new Date('2026-05-21'),
});
