import { ClipboardList } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Windows Event Lookup',
  path: '/windows-event-lookup',
  description: 'Look up Windows Event IDs with descriptions, severity levels, and common causes.',
  keywords: ['windows', 'event', 'log', 'event id', 'security', 'system', 'application', 'evtx', 'audit', 'msp'],
  component: () => import('./windows-event-lookup.vue'),
  fullscreen: true,
  icon: ClipboardList,
  createdAt: new Date('2026-03-31'),
});
