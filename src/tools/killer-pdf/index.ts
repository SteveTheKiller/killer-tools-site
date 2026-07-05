import { FileText } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerPDF',
  path: '/killer-pdf',
  description: 'Portable open-source PDF editor for Windows. View, annotate, merge, split, flatten, open password-protected PDFs, edit text, draw, highlight, sign, and print. Install or run portable.',
  keywords: ['pdf', 'editor', 'merge', 'split', 'annotate', 'signature', 'sign', 'print', 'flatten', 'password', 'portable', 'killerpdf'],
  component: () => import('./killer-pdf.vue'),
  icon: FileText,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-04-11'),
});
