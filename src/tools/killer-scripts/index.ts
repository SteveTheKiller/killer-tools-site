import Activity from '@vicons/tabler/Activity';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Killer Scripts',
  path: '/killer-scripts',
  description: 'PowerShell scripts for Windows administration and MSP field work.',
  keywords: ['powershell', 'scripts', 'windows', 'msp', 'sysadmin', 'download'],
  component: () => import('./killer-scripts.vue'),
  fullscreen: true,
  headerLink: { label: 'GitHub ↗', href: 'https://github.com/SteveTheKiller/killer-scripts' },
  icon: Activity,
});
