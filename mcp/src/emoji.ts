import type { McpServer } from '@modelcontextprotocol/server';
import emojiKeywords from 'emojilib';
import Fuse from 'fuse.js';
import emojiUnicodeData from 'unicode-emoji-json';
import { z } from 'zod';

const emojis = Object.entries(emojiUnicodeData).map(([emoji, info]) => ({
  emoji,
  name: info.name,
  group: info.group,
  keywords: emojiKeywords[emoji as keyof typeof emojiKeywords] ?? [],
  codePoint: `U+${emoji.codePointAt(0)?.toString(16).toUpperCase()}`,
}));

const search = new Fuse(emojis, {
  keys: ['group', { name: 'name', weight: 3 }, 'keywords', 'codePoint', 'emoji'],
  threshold: 0.3,
  useExtendedSearch: true,
  isCaseSensitive: false,
});

export function registerEmoji(server: McpServer) {
  server.registerTool('search_emoji', {
    description: 'Find emoji characters by name, group, keyword, or Unicode code point using the KillerTools emoji catalog.',
    inputSchema: {
      query: z.string().trim().min(1).max(80),
      limit: z.number().int().min(1).max(30).default(10),
    },
  }, async ({ query, limit }) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(search.search(query, { limit }).map(({ item }) => item)) }],
  }));
}
