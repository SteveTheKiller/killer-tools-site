import { BuildingSkyscraper } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'M365 License SKU Decoder',
  path: '/m365-sku-decoder',
  description: 'Decode Microsoft 365 license SKU strings and GUIDs to their product names.',
  keywords: ['microsoft', 'm365', 'office', 'license', 'sku', 'guid', 'intune', 'azure', 'exchange', 'teams', 'defender', 'o365'],
  component: () => import('./m365-sku-decoder.vue'),
  fullscreen: true,
  icon: BuildingSkyscraper,
  createdAt: new Date('2026-03-31'),
});
