import { Activity } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerBench',
  path: '/killer-bench',
  description: 'Open-source diagnosis and repair workbench for Windows',
  keywords: ['windows', 'diagnostics', 'repair', 'maintenance', 'killerbench'],
  component: () => import('./killer-bench.vue'),
  icon: Activity,
  isNew: true,
  fullscreen: true,
  noHeader: true,
  createdAt: new Date('2026-11-02'),
});
