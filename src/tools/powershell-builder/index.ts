import Terminal2 from '@vicons/tabler/Terminal2';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'PowerShell Builder',
  path: '/powershell-builder',
  description: 'Pick a cmdlet, fill in the parameters, and copy your finished PowerShell command.',
  keywords: ['powershell', 'cmdlet', 'script', 'builder', 'one-liner', 'active directory', 'ad', 'windows', 'admin', 'sysadmin', 'ps', 'shell'],
  component: () => import('./powershell-builder.vue'),
  icon: Terminal2,
  createdAt: new Date('2026-04-02'),
  fullscreen: true,
});