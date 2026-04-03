import { FileCode } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'YAML converter',
  path: '/yaml-converter',
  description: 'Convert YAML to JSON or TOML.',
  keywords: ['yaml', 'json', 'toml', 'convert', 'converter'],
  component: () => import('./yaml-converter.vue'),
  fullscreen: true,
  icon: FileCode,
  createdAt: new Date('2026-04-01'),
});
