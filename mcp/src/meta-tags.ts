import type { McpServer } from '@modelcontextprotocol/server';
import { generateMeta } from '@it-tools/oggen';
import { z } from 'zod';
import { image, ogSchemas, twitter, website } from '../../src/tools/meta-tag-generator/og-schemas';

const types = ['website', 'article', 'book', 'profile', 'music.song', 'music.album', 'music.playlist', 'music.radio_station', 'video.movie', 'video.episode', 'video.tv_show', 'video.other'] as const;

export function registerMetaTags(server: McpServer) {
  server.registerTool('generate_meta_tags', {
    description: 'Generate Open Graph and Twitter meta tags using the KillerTools Meta Tag Generator.',
    inputSchema: {
      type: z.enum(types).default('website'),
      fields: z.record(z.string().max(64), z.string().max(1024)).default({}),
    },
  }, async ({ type, fields }) => {
    if (Object.keys(fields).length > 30) {
      return { content: [{ type: 'text' as const, text: 'Too many metadata fields' }], isError: true };
    }
    const sections = [website, image, twitter, ...(ogSchemas[type] ? [ogSchemas[type]] : [])];
    const allowed = new Set(sections.flatMap(section => section.elements.map(element => element.key)));
    if (Object.keys(fields).some(key => !allowed.has(key))) {
      return { content: [{ type: 'text' as const, text: 'Unknown metadata field for selected page type' }], isError: true };
    }
    const metadata = { type, 'twitter:card': 'summary_large_image', ...fields };
    const twitterMeta = Object.fromEntries(Object.entries(metadata)
      .filter(([key, value]) => key.startsWith('twitter:') && value)
      .map(([key, value]) => [key.slice(8), value]));
    const otherMeta = Object.fromEntries(Object.entries(metadata).filter(([key, value]) => !key.startsWith('twitter:') && value));
    try {
      const html = generateMeta({ ...otherMeta, twitter: twitterMeta }, { generateTwitterCompatibleMeta: true });
      if (html.length > 32_768) {
        return { content: [{ type: 'text' as const, text: 'Generated meta tags are too large' }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify({ html }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Unable to generate meta tags' }], isError: true };
    }
  });
}
