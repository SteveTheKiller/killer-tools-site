import type { McpServer } from '@modelcontextprotocol/server';
import figlet from 'figlet';
import { z } from 'zod';

const loadedFonts = new Set<string>();

async function loadFont(font: string): Promise<void> {
  if (loadedFonts.has(font)) {
    return;
  }
  const url = `https://killertools.net/figlet-fonts/${encodeURIComponent(font)}.flf`;
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok || !response.body) {
    throw new Error('Font unavailable');
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
    if (size > 262_144) {
      await reader.cancel();
      throw new Error('Font too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  figlet.parseFont(font, new TextDecoder().decode(bytes));
  loadedFonts.add(font);
}

export function registerAsciiArt(server: McpServer) {
  server.registerTool('draw_ascii_text', {
    description: 'Render text with a KillerTools FIGlet font from the website font collection.',
    inputSchema: {
      text: z.string().min(1).max(128),
      font: z.string().min(1).max(40).regex(/^[\w '-]+$/).default('Standard'),
      width: z.number().int().min(20).max(200).default(80),
    },
  }, async ({ text, font, width }) => {
    try {
      await loadFont(font);
      const art = figlet.textSync(text, { font, width, whitespaceBreak: true });
      if (art.length > 32_768) {
        throw new Error('Art too large');
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify({ art }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Font unavailable or output too large' }], isError: true };
    }
  });
}
