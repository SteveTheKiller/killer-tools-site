import { Bug } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Windows Error Code Lookup',
  path: '/windows-error-codes',
  description: 'Look up Windows error codes by hex or decimal — system errors, BSOD stop codes, WMI, RPC, MSI installer, and more.',
  keywords: ['windows', 'error', 'code', 'hex', 'bsod', 'stop code', 'wmi', 'rpc', 'msi', 'installer', '0x', 'dcom', 'hresult'],
  component: () => import('./windows-error-codes.vue'),
  fullscreen: true,
  icon: Bug,
  createdAt: new Date('2026-03-31'),
});
