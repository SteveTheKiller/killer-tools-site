import { Terminal2 } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerShell',
  path: '/killer-shell',
  description: 'Free shell for power users. A file browser, a terminal and a text editor share one window, one tab strip and one set of keys. Single portable Windows exe, no installer.',
  keywords: ['shell', 'browser', 'explorer', 'terminal', 'powershell', 'cmd', 'editor', 'tabs', 'search', 'find', 'file', 'content', 'grep', 'wildcard', 'filename', 'killershell', 'killerfind'],
  component: () => import('./killer-shell.vue'),
  icon: Terminal2,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-07-27'),
});
