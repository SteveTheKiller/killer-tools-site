import type { McpServer } from '@modelcontextprotocol/server';
import { escape, unescape } from 'lodash';
import { ulid } from 'ulid';
import { NIL, v1, v3, v4, v5, validate as validateUuid } from 'uuid';
import { z } from 'zod';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation } from '../../src/tools/chmod-calculator/chmod-calculator.service';
import { buildSvgPlaceholder } from '../../src/tools/svg-placeholder-generator/svg-placeholder-generator.service';
import { textToBase64 } from '../../src/utils/base64';

const inputText = z.string().max(4096);
const permissionGroup = z.object({ read: z.boolean(), write: z.boolean(), execute: z.boolean() });
const permissions = z.object({ owner: permissionGroup, group: permissionGroup, public: permissionGroup });

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function registerSimpleTools(server: McpServer) {
  server.registerTool('generate_svg_placeholder', {
    description: 'Generate an SVG placeholder image using KillerTools.',
    inputSchema: {
      width: z.number().int().min(1).max(4096),
      height: z.number().int().min(1).max(4096),
      fontSize: z.number().int().min(1).max(512).default(26),
      bgColor: z.string().regex(/^#[0-9a-f]{6}$/i).default('#cccccc'),
      fgColor: z.string().regex(/^#[0-9a-f]{6}$/i).default('#333333'),
      useExactSize: z.boolean().default(true),
      customText: z.string().max(256).default(''),
    },
  }, async (options) => {
    const svg = buildSvgPlaceholder(options);
    return result({ svg, dataUrl: `data:image/svg+xml;base64,${textToBase64(svg)}` });
  });

  server.registerTool('calculate_chmod', {
    description: 'Calculate octal and symbolic Unix permissions using KillerTools Chmod Calculator.',
    inputSchema: { permissions },
  }, async ({ permissions }) => {
    const octal = computeChmodOctalRepresentation({ permissions });
    return result({ octal, symbolic: computeChmodSymbolicRepresentation({ permissions }), command: `chmod ${octal} path` });
  });

  server.registerTool('escape_html_entities', {
    description: 'Escape HTML entities using the KillerTools HTML Entities tool.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ text: escape(text) }));

  server.registerTool('unescape_html_entities', {
    description: 'Unescape HTML entities using the KillerTools HTML Entities tool.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ text: unescape(text) }));

  server.registerTool('generate_ulids', {
    description: 'Generate up to 100 ULIDs using the KillerTools generator.',
    inputSchema: { count: z.number().int().min(1).max(100).default(1) },
  }, async ({ count }) => result({ ids: Array.from({ length: count }, () => ulid()) }));

  server.registerTool('generate_uuids', {
    description: 'Generate up to 100 UUIDs using the KillerTools generator.',
    inputSchema: {
      version: z.enum(['NIL', 'v1', 'v3', 'v4', 'v5']).default('v4'),
      count: z.number().int().min(1).max(100).default(1),
      name: z.string().max(128).optional(),
      namespace: z.string().max(36).optional(),
    },
  }, async ({ version, count, name, namespace }) => {
    if ((version === 'v3' || version === 'v5') && (!namespace || !validateUuid(namespace))) {
      return { content: [{ type: 'text' as const, text: 'A valid namespace UUID is required' }], isError: true };
    }
    const ids = Array.from({ length: count }, (_, index) => {
      switch (version) {
        case 'NIL': return NIL;
        case 'v1': return v1({
          clockseq: index,
          msecs: Date.now(),
          nsecs: Math.floor(Math.random() * 10000),
          node: Uint8Array.from({ length: 6 }, () => Math.floor(Math.random() * 256)),
        });
        case 'v3': return v3(name ?? '', namespace!);
        case 'v5': return v5(name ?? '', namespace!);
        default: return v4();
      }
    });
    return result({ ids });
  });
}
