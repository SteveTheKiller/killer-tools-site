import type { McpServer } from '@modelcontextprotocol/server';
import JSON5 from 'json5';
import xmlFormat from 'xml-formatter';
import convert from 'xml-js';
import { z } from 'zod';
import { diff } from '../../src/tools/json-diff/json-diff.models';

const inputText = z.string().min(1).max(4096);
const maxOutputLength = 16384;

function output(value: unknown) {
  const text = JSON.stringify(value);
  return text.length > maxOutputLength
    ? { content: [{ type: 'text' as const, text: 'Output is too large' }], isError: true }
    : { content: [{ type: 'text' as const, text }], isError: false };
}

function invalid() {
  return { content: [{ type: 'text' as const, text: 'Invalid document input' }], isError: true };
}

export function registerDocumentTools(server: McpServer) {
  server.registerTool('diff_json', {
    description: 'Compare two JSON5-compatible documents using KillerTools JSON Diff.',
    inputSchema: { left: inputText, right: inputText, onlyDifferences: z.boolean().default(true) },
  }, async ({ left, right, onlyDifferences }) => {
    try {
      return output(diff(JSON5.parse(left), JSON5.parse(right), { onlyShowDifferences: onlyDifferences }));
    }
    catch {
      return invalid();
    }
  });

  server.registerTool('format_xml', {
    description: 'Format XML using KillerTools XML Formatter.',
    inputSchema: {
      text: inputText,
      indentSize: z.number().int().min(0).max(10).default(2),
      collapseContent: z.boolean().default(true),
    },
  }, async ({ text, indentSize, collapseContent }) => {
    try {
      return output({ text: xmlFormat(text.trim(), { indentation: ' '.repeat(indentSize), collapseContent, lineSeparator: '\n' }) });
    }
    catch {
      return invalid();
    }
  });

  server.registerTool('convert_xml_json', {
    description: 'Convert XML to JSON or JSON5-compatible text to XML using KillerTools.',
    inputSchema: { text: inputText, direction: z.enum(['xml_to_json', 'json_to_xml']) },
  }, async ({ text, direction }) => {
    try {
      return direction === 'xml_to_json'
        ? output({ text: JSON.stringify(convert.xml2js(text, { compact: true }), null, 2) })
        : output({ text: convert.js2xml(JSON5.parse(text), { compact: true, spaces: 2 }) });
    }
    catch { return invalid(); }
  });
}
