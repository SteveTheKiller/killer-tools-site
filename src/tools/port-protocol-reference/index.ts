import { Router } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Port & Protocol Reference',
  path: '/port-protocol-reference',
  description: 'Common network ports and protocols with security notes and dangerous port flags.',
  keywords: ['port', 'protocol', 'tcp', 'udp', 'network', 'firewall', 'service', 'smtp', 'rdp', 'ssh', 'dns', 'http', 'ftp', 'snmp'],
  component: () => import('./port-protocol-reference.vue'),
  fullscreen: true,
  icon: Router,
  createdAt: new Date('2026-03-31'),
});
