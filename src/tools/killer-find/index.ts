import { Search } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerFind',
  path: '/killer-find',
  description: 'Fast file search for Windows. Search by filename wildcard or file content across any directory. Streams results in real time, no indexing required.',
  keywords: ['search', 'find', 'file', 'content', 'grep', 'wildcard', 'filename', 'killerfind'],
  component: () => import('./killer-find.vue'),
  icon: Search,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-04-26'),
});
