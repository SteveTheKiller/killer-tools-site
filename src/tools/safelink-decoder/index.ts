import { Mailbox } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Outlook Safelink decoder',
  path: '/safelink-decoder',
  description: 'Unwrap Microsoft Defender SafeLinks to reveal the original destination URL.',
  keywords: ['outlook', 'safelink', 'decoder'],
  component: () => import('./safelink-decoder.vue'),
  fullscreen: true,
  icon: Mailbox,
  createdAt: new Date('2024-03-11'),
});
