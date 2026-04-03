import { World } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'WHOIS Lookup',
  path: '/whois-checker',
  description: 'Look up registration details for any domain including registrar, creation and expiry dates, nameservers, and status flags.',
  keywords: ['whois', 'domain', 'registrar', 'registration', 'expiry', 'nameserver', 'dns', 'lookup'],
  component: () => import('./whois-checker.vue'),
  fullscreen: true,
  icon: World,
  createdAt: new Date('2026-04-01'),
});
