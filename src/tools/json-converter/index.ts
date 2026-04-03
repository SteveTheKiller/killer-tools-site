import { Braces } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JSON converter',
  path: '/json-converter',
  description: 'Convert JSON to YAML or TOML.',
  keywords: ['json', 'yaml', 'toml', 'convert', 'converter'],
  component: () => import('./json-converter.vue'),
  fullscreen: true,
  icon: Braces,
  createdAt: new Date('2026-04-01'),
});
