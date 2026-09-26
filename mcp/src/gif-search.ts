import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const proxy = 'https://gif-proxy.cst-498.workers.dev/';

export function registerGifSearch(server: McpServer) {
  server.registerTool('search_gifs', {
    description: 'Search GIFs through the same fixed proxy used by the KillerTools GIF page. Returns links and titles, not image bytes.',
    inputSchema: { query: z.string().trim().min(1).max(80), limit: z.number().int().min(1).max(20).default(10) },
  }, async ({ query, limit }) => {
    try {
      const url = new URL(proxy);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', String(limit));
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok || !response.body) {
        throw new Error('GIF proxy unavailable');
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        size += value.byteLength;
        if (size > 131_072) {
          await reader.cancel();
          throw new Error('GIF response too large');
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
      if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data)) {
        throw new Error('Invalid GIF response');
      }
      const gifs = data.data.slice(0, limit).map((item: unknown) => {
        if (!item || typeof item !== 'object' || !('id' in item) || !('images' in item) || !item.images || typeof item.images !== 'object') {
          throw new Error('Invalid GIF');
        }
        const images = item.images as Record<string, { url?: string }>;
        const previewUrl = images.fixed_height_small?.url ?? images.fixed_height?.url;
        const fullUrl = images.original?.url;
        if (typeof item.id !== 'string' || typeof previewUrl !== 'string' || typeof fullUrl !== 'string'
          || !previewUrl.startsWith('https://') || !fullUrl.startsWith('https://')) {
          throw new Error('Invalid GIF URL');
        }
        return { id: item.id, title: 'title' in item && typeof item.title === 'string' ? item.title.slice(0, 200) : 'GIF', previewUrl, fullUrl };
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(gifs) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'GIF search is unavailable' }], isError: true };
    }
  });
}
