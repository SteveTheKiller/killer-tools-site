import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { modules } from '../../src/tools/killer-modules/killer-modules.data';

export function registerKillerModules(server: McpServer) {
  server.registerTool('list_killer_modules', {
    description: 'List the KillerTools PowerShell modules, their commands, install text, and repository links. Does not install or run anything.',
    inputSchema: { name: z.string().max(80).optional() },
  }, async ({ name }) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(name
      ? modules.filter(module => module.name.toLowerCase().includes(name.toLowerCase()))
      : modules) }],
  }));
}
