import { Photo } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'GIF Search',
  path: '/gif-search',
  description: 'Search Giphy for reaction GIFs. Click any result to copy the URL.',
  keywords: ['gif', 'giphy', 'reaction', 'meme', 'image', 'search', 'animate'],
  component: () => import('./gif-search.vue'),
  fullscreen: true,
  icon: Photo,
  createdAt: new Date('2026-05-02'),
});
