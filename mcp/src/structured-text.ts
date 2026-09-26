import type { McpServer } from '@modelcontextprotocol/server';
import { parse as parseToml, stringify as stringifyToml } from 'iarna-toml-esm';
import JSON5 from 'json5';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { formatJson } from '../../src/tools/json-viewer/json.models';
import { formatYaml } from '../../src/tools/yaml-viewer/yaml-models';

const inputText = z.string().min(1).max(4096);
const maxOutputLength = 16384;

function output(text: string) {
  return text.length > maxOutputLength
    ? { content: [{ type: 'text' as const, text: 'Output is too large' }], isError: true }
    : { content: [{ type: 'text' as const, text: JSON.stringify({ text }) }] };
}

function invalid() {
  return { content: [{ type: 'text' as const, text: 'Invalid structured text' }], isError: true };
}

export function registerStructuredText(server: McpServer) {
  server.registerTool('format_json', {
    description: 'Prettify JSON5-compatible text with optional key sorting using KillerTools JSON Viewer.',
    inputSchema: {
      text: inputText,
      indentSize: z.number().int().min(0).max(10).default(3),
      sortKeys: z.boolean().default(true),
    },
  }, async ({ text, indentSize, sortKeys }) => {
    try {
      return output(formatJson({ rawJson: text, indentSize, sortKeys }));
    }
    catch { return invalid(); }
  });

  server.registerTool('format_yaml', {
    description: 'Prettify YAML with optional key sorting using KillerTools YAML Viewer.',
    inputSchema: {
      text: inputText,
      indentSize: z.number().int().min(1).max(10).default(2),
      sortKeys: z.boolean().default(false),
    },
  }, async ({ text, indentSize, sortKeys }) => {
    try {
      return output(formatYaml({ rawYaml: text, indentSize, sortKeys }));
    }
    catch { return invalid(); }
  });

  server.registerTool('convert_json', {
    description: 'Convert JSON5-compatible text to YAML or TOML using KillerTools.',
    inputSchema: { text: inputText, to: z.enum(['yaml', 'toml']) },
  }, async ({ text, to }) => {
    try {
      const value = JSON5.parse(text);
      return output(to === 'yaml' ? stringifyYaml(value) : [stringifyToml(value)].flat().join('\n').trim());
    }
    catch { return invalid(); }
  });

  server.registerTool('convert_yaml', {
    description: 'Convert YAML text to JSON or TOML using KillerTools.',
    inputSchema: { text: inputText, to: z.enum(['json', 'toml']) },
  }, async ({ text, to }) => {
    try {
      const value = parseYaml(text, { merge: true });
      if (!value) {
        return invalid();
      }
      return output(to === 'json' ? JSON.stringify(value, null, 2) : [stringifyToml(value)].flat().join('\n').trim());
    }
    catch { return invalid(); }
  });

  server.registerTool('convert_toml', {
    description: 'Convert TOML text to JSON or YAML using KillerTools.',
    inputSchema: { text: inputText, to: z.enum(['json', 'yaml']) },
  }, async ({ text, to }) => {
    try {
      const value = parseToml(text);
      return output(to === 'json' ? JSON.stringify(value, null, 2) : stringifyYaml(value));
    }
    catch { return invalid(); }
  });

  server.registerTool('minify_json', {
    description: 'Minify JSON5-compatible text using KillerTools JSON Minify.',
    inputSchema: { text: inputText },
  }, async ({ text }) => {
    try {
      return output(JSON.stringify(JSON5.parse(text)));
    }
    catch {
      return invalid();
    }
  });
}
