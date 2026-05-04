import { Key } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: translate('tools.password-generator.title'),
  path: '/password-generator',
  description: translate('tools.password-generator.description'),
  keywords: [
    'password',
    'generator',
    'passphrase',
    'diceware',
    'admin',
    'service',
    'wifi',
    'psk',
    'pin',
    'random',
    'secure',
    'token',
    'hex',
    'base64',
    'uuid',
    'pronounceable',
    'nato',
    'phonetic',
  ],
  component: () => import('./password-generator.tool.vue'),
  fullscreen: true,
  icon: Key,
  createdAt: new Date('2026-03-01'),
});
