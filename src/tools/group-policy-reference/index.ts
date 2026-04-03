import { Shield } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Group Policy Reference',
  path: '/group-policy-reference',
  description: 'Search common Windows Group Policy settings by name, GPO path, registry key, or description.',
  keywords: ['group policy', 'gpo', 'registry', 'security', 'hardening', 'windows', 'active directory', 'bitlocker', 'defender', 'firewall', 'powershell', 'rdp', 'smb', 'telemetry', 'audit'],
  component: () => import('./group-policy-reference.vue'),
  fullscreen: true,
  icon: Shield,
  createdAt: new Date('2026-03-31'),
});
