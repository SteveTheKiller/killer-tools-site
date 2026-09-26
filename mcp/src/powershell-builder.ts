import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { cmdlets } from '../../src/tools/powershell-builder/powershell-builder.data';

function output(value: unknown) {
  const text = JSON.stringify(value);
  return text.length > 32_768
    ? error('Catalog output is too large')
    : { content: [{ type: 'text' as const, text }] };
}

function error(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, '\u0027\u0027')}'`;
}

export function registerPowerShellBuilder(server: McpServer) {
  server.registerTool('search_powershell_cmdlets', {
    description: 'Search the KillerTools PowerShell Builder catalog. Does not run commands.',
    inputSchema: { query: z.string().trim().min(1).max(80), limit: z.number().int().min(1).max(20).default(10) },
  }, async ({ query, limit }) => output(cmdlets.filter(item => `${item.cmdlet} ${item.description} ${item.module}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, limit)
    .map(({ cmdlet, module, category, description, requiresAdmin }) => ({ cmdlet, module, category, description, requiresAdmin }))));

  server.registerTool('get_powershell_cmdlet', {
    description: 'Get parameter descriptions and example snippets for an exact KillerTools PowerShell cmdlet. Does not run commands.',
    inputSchema: { cmdlet: z.string().min(1).max(80) },
  }, async ({ cmdlet }) => {
    const item = cmdlets.find(entry => entry.cmdlet.toLowerCase() === cmdlet.toLowerCase());
    return item ? output(item) : error('Unknown cmdlet');
  });

  server.registerTool('build_powershell_command', {
    description: 'Assemble a PowerShell command from the KillerTools catalog. Returns text only and never executes it. Review scriptblock parameters before use.',
    inputSchema: {
      cmdlet: z.string().min(1).max(80),
      parameters: z.record(z.string().max(80), z.union([z.string().max(512), z.boolean()])).default({}),
    },
  }, async ({ cmdlet, parameters }) => {
    const item = cmdlets.find(entry => entry.cmdlet.toLowerCase() === cmdlet.toLowerCase());
    if (!item) {
      return error('Unknown cmdlet');
    }
    if (Object.keys(parameters).length > 20) {
      return error('Too many parameters');
    }
    const known = new Map(item.parameters.map(parameter => [parameter.name.toLowerCase(), parameter]));
    if (Object.keys(parameters).some(name => !known.has(name.toLowerCase()))) {
      return error('Unknown parameter');
    }
    const parts = [item.cmdlet];
    for (const parameter of item.parameters) {
      const value = Object.entries(parameters).find(([name]) => name.toLowerCase() === parameter.name.toLowerCase())?.[1];
      if (value === undefined || value === '' || value === false) {
        continue;
      }
      if (parameter.type === 'switch') {
        if (value !== true) {
          return error(`-${parameter.name} must be a switch`);
        }
        parts.push(`-${parameter.name}`);
      }
      else {
        if (typeof value !== 'string') {
          return error(`-${parameter.name} requires text`);
        }
        const trimmed = value.trim();
        if (!trimmed) {
          continue;
        }
        if (parameter.type === 'int') {
          if (!/^-?\d+$/.test(trimmed)) {
            return error(`-${parameter.name} requires an integer`);
          }
          parts.push(`-${parameter.name} ${trimmed}`);
        }
        else if (parameter.type === 'scriptblock') {
          parts.push(`-${parameter.name} { ${trimmed} }`);
        }
        else if (parameter.type === 'string[]') {
          const items = trimmed.split(',').map(part => part.trim()).filter(Boolean);
          if (items.length > 20) {
            return error(`-${parameter.name} has too many items`);
          }
          parts.push(`-${parameter.name} ${items.map(quoteLiteral).join(',')}`);
        }
        else {
          parts.push(`-${parameter.name} ${quoteLiteral(trimmed)}`);
        }
      }
    }
    const command = parts.join(' ');
    return command.length > 4096 ? error('Generated command is too long') : output({ command, requiresAdmin: item.requiresAdmin });
  });
}
