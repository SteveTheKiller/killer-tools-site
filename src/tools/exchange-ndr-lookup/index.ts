import { Mail } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Exchange NDR Lookup',
  path: '/exchange-ndr-lookup',
  description: 'Look up Exchange and M365 non-delivery report codes with cause and fix.',
  keywords: ['exchange', 'ndr', 'bounce', 'non-delivery', 'email', 'smtp', 'error', 'm365', 'office 365', 'mail flow', '5.7.1', '4.4.7', 'spam', 'spf', 'dmarc'],
  component: () => import('./exchange-ndr-lookup.vue'),
  icon: Mail,
  createdAt: new Date('2026-03-31'),
});
