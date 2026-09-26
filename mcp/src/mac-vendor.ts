import type { McpServer } from '@modelcontextprotocol/server';
import db from 'oui-data';
import { z } from 'zod';

export function registerMacVendor(server: McpServer) {
  server.registerTool('lookup_mac_vendor', {
    description: 'Look up a MAC address prefix in the same local OUI catalog used by KillerTools.',
    inputSchema: { macAddress: z.string().min(6).max(24).regex(/^[0-9a-f.:-]+$/i) },
  }, async ({ macAddress }) => {
    const cleaned = macAddress.replace(/[.:-]/g, '').toUpperCase();
    if (cleaned.length < 6 || cleaned.length > 12 || cleaned.length % 2 !== 0) {
      return { content: [{ type: 'text' as const, text: 'Invalid MAC address' }], isError: true };
    }
    const prefix = cleaned.slice(0, 6);
    const details = (db as Record<string, string>)[prefix] ?? null;
    return { content: [{ type: 'text' as const, text: JSON.stringify({ prefix, details }) }] };
  });
}
