import type { McpServer } from '@modelcontextprotocol/server';
import markdownit from 'markdown-it';
import { format as formatSql } from 'sql-formatter';
import { z } from 'zod';

const inputText = z.string().max(4096);
const maxOutputLength = 16384;

function output(text: string) {
  return text.length > maxOutputLength
    ? { content: [{ type: 'text' as const, text: 'Output is too large' }], isError: true }
    : { content: [{ type: 'text' as const, text: JSON.stringify({ text }) }] };
}

export function registerTextFormatters(server: McpServer) {
  server.registerTool('markdown_to_html', {
    description: 'Convert Markdown to HTML using KillerTools Markdown to HTML.',
    inputSchema: { markdown: inputText },
  }, async ({ markdown }) => output(markdownit().render(markdown)));

  server.registerTool('format_sql', {
    description: 'Format SQL with the dialect and style options shown by KillerTools SQL Prettify.',
    inputSchema: {
      sql: inputText,
      language: z.enum(['bigquery', 'db2', 'hive', 'mariadb', 'mysql', 'n1ql', 'plsql', 'postgresql', 'redshift', 'spark', 'sql', 'sqlite', 'tsql']).default('sql'),
      keywordCase: z.enum(['upper', 'lower', 'preserve']).default('upper'),
      indentStyle: z.enum(['standard', 'tabularLeft', 'tabularRight']).default('standard'),
      useTabs: z.boolean().default(false),
    },
  }, async ({ sql, language, keywordCase, indentStyle, useTabs }) => {
    try {
      return output(formatSql(sql, { language, keywordCase, indentStyle, useTabs }));
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid SQL formatting request' }], isError: true };
    }
  });
}
