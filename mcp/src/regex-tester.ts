import type { McpServer } from '@modelcontextprotocol/server';
import { RE2JS } from 're2js';
import { z } from 'zod';

export function registerRegexTester(server: McpServer) {
  server.registerTool('test_regex', {
    description: 'Match text with the KillerTools Regex Tester interface using safe RE2 syntax. Backreferences and some JavaScript features are unsupported.',
    inputSchema: {
      pattern: z.string().min(1).max(256),
      text: z.string().max(4096),
      global: z.boolean().default(true),
      ignoreCase: z.boolean().default(false),
      multiline: z.boolean().default(false),
      dotAll: z.boolean().default(true),
    },
  }, async ({ pattern, text, global, ignoreCase, multiline, dotAll }) => {
    try {
      const flags = (ignoreCase ? RE2JS.CASE_INSENSITIVE : 0)
        | (multiline ? RE2JS.MULTILINE : 0)
        | (dotAll ? RE2JS.DOTALL : 0);
      const regex = RE2JS.compile(pattern, flags);
      const matches: Array<{ index: number, match: string, groups: Array<string | undefined> }> = [];
      let truncated = false;
      for (const match of regex.matchAll(text)) {
        if (matches.length === 50) {
          truncated = true;
          break;
        }
        matches.push({ index: match.index ?? 0, match: match[0], groups: match.slice(1) });
        if (!global) {
          break;
        }
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify({ matches, truncated, syntax: 'RE2' }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid or unsupported RE2 pattern' }], isError: true };
    }
  });
}
