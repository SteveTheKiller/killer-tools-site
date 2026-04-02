import { MailOpened } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Email Header Parser',
  path: '/email-header-parser',
  description: 'Paste raw email headers to extract sender info, trace the delivery hop chain, and view SPF, DKIM, and DMARC authentication results.',
  keywords: ['email', 'header', 'parser', 'received', 'spf', 'dkim', 'dmarc', 'phishing', 'spam', 'trace', 'ip', 'authentication', 'forensics'],
  component: () => import('./email-header-parser.vue'),
  icon: MailOpened,
  createdAt: new Date('2026-04-01'),
});
