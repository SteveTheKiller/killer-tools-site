import { Artboard } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ASCII Word Art Generator',
  path: '/ascii-word-art',
  description: 'Create ASCII word art text with many fonts and styles.',
  keywords: ['ascii', 'asciiart', 'text', 'drawer', 'word art', 'figlet'],
  redirectFrom: ['/ascii-text-drawer'],
  component: () => import('./ascii-text-drawer.vue'),
  fullscreen: true,
  icon: Artboard,
  createdAt: new Date('2024-03-03'),
});
