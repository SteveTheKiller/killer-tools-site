import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

interface DiffLine {
  kind: 'context' | 'add' | 'remove'
  text: string
}

function lineDiff(left: string[], right: string[]): DiffLine[] {
  const lengths = Array.from({ length: left.length + 1 }, () => new Uint16Array(right.length + 1));
  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      lengths[i][j] = left[i] === right[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      lines.push({ kind: 'context', text: left[i++] });
      j++;
    }
    else if (j < right.length && (i === left.length || lengths[i][j + 1] >= lengths[i + 1][j])) {
      lines.push({ kind: 'add', text: right[j++] });
    }
    else {
      lines.push({ kind: 'remove', text: left[i++] });
    }
  }
  return lines;
}

export function registerTextDiff(server: McpServer) {
  server.registerTool('diff_text', {
    description: 'Compare two bounded text inputs line by line, corresponding to the KillerTools Text Diff page.',
    inputSchema: { left: z.string().max(4096), right: z.string().max(4096) },
  }, async ({ left, right }) => {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    if (leftLines.length > 200 || rightLines.length > 200) {
      return { content: [{ type: 'text' as const, text: 'Too many lines for text comparison' }], isError: true };
    }
    const lines = lineDiff(leftLines, rightLines);
    return { content: [{ type: 'text' as const, text: JSON.stringify({
      equal: left === right,
      added: lines.filter(line => line.kind === 'add').length,
      removed: lines.filter(line => line.kind === 'remove').length,
      lines,
    }) }] };
  });
}
