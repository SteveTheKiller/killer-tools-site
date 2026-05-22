import { Flask } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.dev-calculator.title'),
  path: '/dev-calculator',
  description: translate('tools.dev-calculator.description'),
  keywords: [
    'film development',
    'darkroom',
    'developer',
    'developing',
    'temperature compensation',
    'push process',
    'pull process',
    'dilution',
    'D-76',
    'HC-110',
    'Rodinal',
    'XTOL',
    'Ilfosol',
    'DDX',
    'Microphen',
    'ID-11',
    'HP5',
    'Tri-X',
    'Delta',
    'T-MAX',
    'analog',
    'film',
    'photography',
    'calculator',
  ],
  component: () => import('./dev-calculator.vue'),
  fullscreen: true,
  icon: Flask,
  createdAt: new Date('2026-05-21'),
});
