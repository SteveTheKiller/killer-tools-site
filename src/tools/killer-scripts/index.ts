import { Terminal2 } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Killer Scripts',
  path: '/killer-scripts',
  description: 'Download PowerShell scripts for Windows administration and MSP field work.',
  keywords: ['powershell', 'scripts', 'windows', 'msp', 'sysadmin', 'download'],
  component: () => import('./killer-scripts.vue'),
  icon: Terminal2,
});
