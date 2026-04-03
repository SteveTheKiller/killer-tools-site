import { ShieldCheck } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Email DNS Checker',
  path: '/email-dns-checker',
  description: 'Check MX, SPF, DKIM, and DMARC records for any domain. Validates email authentication configuration and flags common misconfigurations.',
  keywords: ['email', 'dns', 'mx', 'spf', 'dkim', 'dmarc', 'mail', 'domain', 'spoofing', 'deliverability', 'exchange', 'm365'],
  component: () => import('./email-dns-checker.vue'),
  fullscreen: true,
  icon: ShieldCheck,
  createdAt: new Date('2026-03-31'),
});
