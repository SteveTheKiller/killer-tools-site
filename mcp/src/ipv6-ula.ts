import type { McpServer } from '@modelcontextprotocol/server';
import { SHA1 } from 'crypto-js';
import { z } from 'zod';

export function registerIpv6Ula(server: McpServer) {
  server.registerTool('generate_ipv6_ula', {
    description: 'Generate the IPv6 unique local address ranges shown by KillerTools using a timestamp and MAC address.',
    inputSchema: {
      macAddress: z.string().regex(/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i),
      timestampMs: z.number().int().min(0).max(8_640_000_000_000_000).optional(),
    },
  }, async ({ macAddress, timestampMs }) => {
    const timestamp = timestampMs ?? Date.now();
    const hex40bit = SHA1(timestamp + macAddress).toString().slice(30);
    const prefix = `fd${hex40bit.slice(0, 2)}:${hex40bit.slice(2, 6)}:${hex40bit.slice(6)}`;
    return { content: [{ type: 'text' as const, text: JSON.stringify({
      ula48: `${prefix}::/48`,
      firstRoutable64: `${prefix}:0::/64`,
      lastRoutable64: `${prefix}:ffff::/64`,
      timestampMs: timestamp,
    }) }] };
  });
}
