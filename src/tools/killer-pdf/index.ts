import { FileText } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerPDF',
  path: '/killer-pdf',
  description: 'Portable PDF editor for field techs. View, annotate, merge, split, reorder, edit text, draw, highlight, sign, and print.',
  keywords: ['pdf', 'editor', 'merge', 'split', 'annotate', 'signature', 'sign', 'print', 'killerpdf'],
  component: () => import('./killer-pdf.vue'),
  icon: FileText,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-04-11'),
});
