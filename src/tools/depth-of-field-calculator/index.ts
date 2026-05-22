import { Camera } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.depth-of-field-calculator.title'),
  path: '/depth-of-field-calculator',
  description: translate('tools.depth-of-field-calculator.description'),
  keywords: [
    'depth of field',
    'dof',
    'hyperfocal',
    'hyperfocal distance',
    'aperture',
    'focal length',
    'focus distance',
    'photography',
    'calculator',
    'near limit',
    'far limit',
    'circle of confusion',
    'sensor',
  ],
  component: () => import('./depth-of-field-calculator.vue'),
  fullscreen: true,
  icon: Camera,
  createdAt: new Date('2026-05-21'),
});
