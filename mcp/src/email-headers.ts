import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { parseRawHeaders } from '../../src/tools/email-header-parser/email-header-parser.service';

export function registerEmailHeaders(server: McpServer) {
  server.registerTool('parse_email_headers', {
    description: 'Parse message headers, delivery hops, authentication results, and spam signals using KillerTools. Input may contain private addresses.',
    inputSchema: { headers: z.string().trim().min(1).max(16_384) },
  }, async ({ headers }) => {
    const parsed = parseRawHeaders(headers);
    const text = JSON.stringify(parsed);
    return text.length > 32_768
      ? { content: [{ type: 'text' as const, text: 'Parsed headers are too large' }], isError: true }
      : { content: [{ type: 'text' as const, text }] };
  });
}
