import { Notes } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerNotes',
  path: '/killer-notes',
  description: 'Encrypted notepad for techs. Rich text, inline images, real tables, instant search, SQLCipher AES-256, and .knote sharing.',
  keywords: ['notes', 'notepad', 'encrypted', 'sqlite', 'sqlcipher', 'rich text', 'knote', 'killernotes'],
  component: () => import('./killer-notes.vue'),
  icon: Notes,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-07-18'),
});
