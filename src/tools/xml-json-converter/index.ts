import { ArrowsRightLeft } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'XML ↔ JSON converter',
  path: '/xml-json-converter',
  description: 'Bidirectional XML and JSON converter. Edit either side and the other updates automatically.',
  keywords: ['xml', 'json', 'convert', 'converter', 'bidirectional'],
  component: () => import('./xml-json-converter.vue'),
  icon: ArrowsRightLeft,
  createdAt: new Date('2026-04-01'),
});
