import { Activity } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerScan',
  path: '/killer-scan',
  description: 'Fast network scanner for field techs. ARP + ping discovery, port probing, vendor lookup, and automatic device classification.',
  keywords: ['network', 'scanner', 'scan', 'ping', 'arp', 'port', 'subnet', 'device', 'killerscan'],
  component: () => import('./killer-scan.vue'),
  icon: Activity,
  isNew: true,
  fullscreen: true,
  noHeader: true,
  createdAt: new Date('2026-04-08'),
});
