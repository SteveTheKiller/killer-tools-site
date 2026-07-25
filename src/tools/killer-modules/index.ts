import { Puzzle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Killer Modules',
  path: '/killer-modules',
  description: 'PowerShell modules for Windows administration and MSP field work. Install from the PowerShell Gallery.',
  keywords: ['powershell', 'modules', 'module', 'windows', 'msp', 'sysadmin', 'gallery', 'install-module'],
  component: () => import('./killer-modules.vue'),
  fullscreen: true,
  icon: Puzzle,
  isNew: true,
  createdAt: new Date('2026-07-25'),
});
