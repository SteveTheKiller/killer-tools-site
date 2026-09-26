import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const baseUrl = 'https://raw.githubusercontent.com/SteveTheKiller/killer-scripts/main/';
const catalogUrl = `${baseUrl}descriptions.json`;
let cached: { until: number, entries: ScriptEntry[] } | undefined;

interface ScriptEntry {
  filename: string
  name: string
  description: string
  downloadUrl: string
}

async function readBounded(response: Response): Promise<string> {
  if (!response.ok || !response.body) {
    throw new Error('Script catalog unavailable');
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
    if (size > 32_768) {
      await reader.cancel();
      throw new Error('Script catalog too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function loadScripts(): Promise<ScriptEntry[]> {
  if (cached && Date.now() < cached.until) {
    return cached.entries;
  }
  const response = await fetch(catalogUrl, { signal: AbortSignal.timeout(5000) });
  const parsed: unknown = JSON.parse(await readBounded(response));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid script catalog');
  }
  const entries = Object.entries(parsed).filter(([filename]) => /^[A-Za-z0-9-]{1,64}\.ps1$/.test(filename));
  if (entries.length > 100) {
    throw new Error('Script catalog too large');
  }
  const scripts = entries.map(([filename, info]) => {
    if (!info || typeof info !== 'object' || !('name' in info) || !('description' in info)
      || typeof info.name !== 'string' || typeof info.description !== 'string'
      || info.name.length > 256 || info.description.length > 512) {
      throw new Error('Invalid script entry');
    }
    return { filename, name: info.name, description: info.description, downloadUrl: `${baseUrl}${filename}` };
  }).sort((a, b) => a.filename.localeCompare(b.filename));
  cached = { until: Date.now() + 600_000, entries: scripts };
  return scripts;
}

export function registerKillerScripts(server: McpServer) {
  server.registerTool('list_killer_scripts', {
    description: 'List KillerScripts names, descriptions, and download links from the same GitHub catalog as the KillerTools page. Does not download or run a script.',
    inputSchema: { query: z.string().trim().max(80).default('') },
  }, async ({ query }) => {
    try {
      const scripts = await loadScripts();
      const filtered = query ? scripts.filter(script => `${script.filename} ${script.name} ${script.description}`.toLowerCase().includes(query.toLowerCase())) : scripts;
      return { content: [{ type: 'text' as const, text: JSON.stringify(filtered) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Script catalog is unavailable' }], isError: true };
    }
  });
}
