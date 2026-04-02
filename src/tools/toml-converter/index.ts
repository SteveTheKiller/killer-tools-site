import { FileText } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'TOML converter',
  path: '/toml-converter',
  description: 'Convert TOML to JSON or YAML.',
  keywords: ['toml', 'json', 'yaml', 'convert', 'converter'],
  component: () => import('./toml-converter.vue'),
  icon: FileText,
  createdAt: new Date('2026-04-01'),
});
