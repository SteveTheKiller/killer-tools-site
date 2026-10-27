import { Camera } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'KillerShot',
  path: '/killer-shot',
  description: 'Encrypted screenshot album and screen capture tool. Capture a region, a window or every monitor with Print Screen, mark it up and redact it, and find it again by the text inside the picture. When a picture is not enough, record the screen to MP4 or GIF.',
  keywords: ['screenshot', 'screen capture', 'snipping tool', 'print screen', 'screen recorder', 'ocr', 'redact', 'annotate', 'encrypted', 'killershot'],
  component: () => import('./killer-shot.vue'),
  icon: Camera,
  isNew: true,
  fullscreen: true,
  noHeader: true,
  createdAt: new Date('2026-10-27'),
});
