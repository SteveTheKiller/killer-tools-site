import { Shield } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Group Policy Reference',
  path: '/group-policy-reference',
  description: 'Search and browse common Windows Group Policy settings by name, GPO path, registry key, or description. Includes default and recommended hardening values.',
  keywords: ['group policy', 'gpo', 'registry', 'security', 'hardening', 'windows', 'active directory', 'bitlocker', 'defender', 'firewall', 'powershell', 'rdp', 'smb', 'telemetry', 'audit'],
  component: () => import('./group-policy-reference.vue'),
  icon: Shield,
  createdAt: new Date('2026-03-31'),
});
